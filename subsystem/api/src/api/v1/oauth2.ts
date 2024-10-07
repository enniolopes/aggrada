import { Request, Response } from '@node-oauth/oauth2-server';
import { Router } from '@ttoss/http-server';
import type { Context } from 'src/Context';

const oauth2Router = new Router({
  prefix: '/oauth2',
});

oauth2Router.post('/token', async (ctx: Context) => {
  const request = new Request(ctx.request);
  const response = new Response(ctx.response);
  const token = await ctx.oauth2.token(request, response);
  ctx.body = token;
});

export { oauth2Router };
