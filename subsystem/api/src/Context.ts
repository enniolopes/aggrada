import { App } from '@ttoss/http-server';
import { db } from './db';
import { oauth2 } from './oauth2';

export type Context = App.Context & {
  db: typeof db;
  oauth2: typeof oauth2;
};

export type AuthenticatedContext = Context & {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
};
