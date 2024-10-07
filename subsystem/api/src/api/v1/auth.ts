/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from '@ttoss/http-server';
import { hashPassword } from '@ttoss/auth-core';
import type { Context } from 'src/Context';

const authRouter = new Router({
  prefix: '/auth',
});

authRouter.post('/signup', async (ctx: Context) => {
  const { username, password } = ctx.request.body;
  const hash = await hashPassword(password);
  try {
    const user = await ctx.db.CoreUser.create({
      email: username,
      password_hash: hash,
    });
    ctx.body = user;
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      ctx.throw(400, 'Email already in use');
    }

    ctx.throw(500, 'An error occurred while creating the user account');
  }
});

export { authRouter };
