/* eslint-disable @typescript-eslint/no-unused-vars */
import * as jose from 'jose';
import { App } from '@ttoss/http-server';
import { type Context } from 'src/Context';
import { comparePassword } from '@ttoss/auth-core';
import { db } from 'src/db';
import OAuth2Server, {
  type Client,
  type PasswordModel,
  Request,
  type RequestAuthenticationModel,
  Response,
} from '@node-oauth/oauth2-server';

/**
 * api.simple4decision.com client
 */
const ApiClient: Client = {
  id: '1',
  grants: ['password'],
  scope: ['all'],
};

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);

const jwtAlg = 'HS256';

type Scope = 'users:read' | 'users:write';

type Roles = 'user';

const rolesScope: { [key in Roles]: Scope[] } = {
  user: ['users:read', 'users:write'],
};

const getUserScope = (roles: Roles[]): Scope[] => {
  return roles.reduce((acc, role) => {
    return acc.concat(rolesScope[role]);
  }, [] as Scope[]);
};

/**
 * https://node-oauthoauth2-server.readthedocs.io/en/master/model/overview.html#client-credentials-grant
 */
const model: PasswordModel & RequestAuthenticationModel = {
  generateAccessToken: async (client, user, scope) => {
    const accessToken = await new jose.SignJWT({
      iss: 'https://api.simple4decision.com',
      aud: 'https://app.simple4decision.com',
      sub: user.id,
      roles: user.roles,
      scope,
    })
      .setProtectedHeader({ alg: jwtAlg })
      .setIssuedAt()
      .setExpirationTime('30 days')
      .sign(jwtSecret);

    return accessToken;
  },
  generateRefreshToken: async (client, user, scope) => {
    const refreshToken = await new jose.SignJWT({
      iss: 'https://api.simple4decision.com',
      aud: 'https://app.simple4decision.com',
      sub: user.id,
    })
      .setProtectedHeader({ alg: jwtAlg })
      .setIssuedAt()
      .setExpirationTime('30 days')
      .sign(jwtSecret);

    return refreshToken;
  },
  getAccessToken: async (accessToken: string) => {
    try {
      const token = await db.CoreOauthToken.findOne({
        where: { 'token.accessToken': accessToken },
      });

      if (!token) {
        return null;
      }

      await jose.jwtVerify(token.token.accessToken, jwtSecret, {
        issuer: 'https://api.simple4decision.com',
        audience: 'https://app.simple4decision.com',
        algorithms: [jwtAlg],
      });

      token.token.accessTokenExpiresAt = new Date(
        token.token.accessTokenExpiresAt
      );

      token.token.refreshTokenExpiresAt = new Date(
        token.token.refreshTokenExpiresAt
      );

      return token.token;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return null;
    }
  },
  getClient: async (clientId: string) => {
    if (clientId === ApiClient.id) {
      return ApiClient;
    }

    return null;
  },
  getUser: async (username, password) => {
    const user = await db.CoreUser.findOne({
      attributes: ['email', 'password_hash'],
      where: { email: username },
    });

    if (!user) {
      return false;
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const userData = user.toJSON();

    delete userData.password_hash;

    return { roles: ['user'], id: '1', ...userData };
  },
  saveToken: async (token, client, user) => {
    const tokenToSave = { ...token, client, user };
    await db.CoreOauthToken.create({ token: tokenToSave });
    return tokenToSave;
  },
  verifyScope: async (token, requestedScope: Scope[]) => {
    const clientScope = token.client.scope;

    const isRequestedScopeAllowedByClient = (() => {
      if (clientScope.includes('all')) {
        return true;
      }

      return requestedScope.every((scope) => {
        return clientScope.includes(scope);
      });
    })();

    const userRoles = token.user.roles;

    if (!userRoles) {
      return isRequestedScopeAllowedByClient;
    }

    const userScope = getUserScope(userRoles);

    const isRequestedScopeAllowedByUser = requestedScope.every((scope) => {
      return userScope.includes(scope);
    });

    return isRequestedScopeAllowedByClient && isRequestedScopeAllowedByUser;
  },
};

export const oauth2 = new OAuth2Server({
  model,
  requireClientAuthentication: { password: false },
});

export const authenticate = (scope: string[]) => {
  return async (ctx: Context, next: App.Next) => {
    try {
      const token = await ctx.oauth2.authenticate(
        new Request(ctx.request),
        new Response(ctx.response),
        { scope }
      );
      ctx.user = token.user;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      ctx.throw(401, 'Unauthorized');
    }

    await next();
  };
};
