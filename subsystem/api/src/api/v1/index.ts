import { Router } from '@ttoss/http-server';
import { authRouter } from './auth';
import { oauth2Router } from './oauth2';
import { usersRouter } from './users';

const v1Router = new Router({
  prefix: '/v1',
});

v1Router.use(authRouter.routes(), authRouter.allowedMethods());
v1Router.use(oauth2Router.routes(), oauth2Router.allowedMethods());
v1Router.use(usersRouter.routes(), usersRouter.allowedMethods());

export { v1Router };
