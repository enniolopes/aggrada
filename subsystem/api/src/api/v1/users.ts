/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from '@ttoss/http-server';
import { authenticate } from 'src/oauth2';
import type { AuthenticatedContext } from 'src/Context';

export const usersRouter = new Router({
  prefix: '/users',
});

usersRouter.get(
  '/me',
  authenticate(['users:read']),
  async (ctx: AuthenticatedContext) => {
    const user = await ctx.db.CoreUser.findByPk(ctx.user.email, {
      attributes: ['email'],
    });
    ctx.body = user;
  }
);
