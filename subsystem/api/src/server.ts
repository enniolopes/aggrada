import 'dotenv/config';

import { App, Router, bodyParser, cors } from '@ttoss/http-server';
import { db } from './db';
import { oauth2 } from './oauth2';
import { v1Router } from './api/v1';
import pkg from '../package.json';

const app = new App();

app.use(bodyParser());
app.use(cors());

app.context.db = db;
app.context.oauth2 = oauth2;

const healthRouter = new Router();

healthRouter.get('/health', (ctx: App.Context) => {
  ctx.body = `v${pkg.version} is running properly`;
});

app.use(healthRouter.routes());
app.use(healthRouter.allowedMethods());

app.use(v1Router.routes());
app.use(v1Router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

// /* eslint-disable no-console */
// import Koa from 'koa';
// import Router from 'koa-router';
// import addDataRouter from './routes/addDataRoutes';
// import bodyParser from 'koa-bodyparser'; // Importa a classe Pool do pacote pg
// import cors from '@koa/cors';
// import delete_fileRouter from './routes/delete_fileRoutes'; // Importa a rota de login
// import dotenv from 'dotenv'; // Importa a rota de delete-file
// import listFilesRouter from './routes/listFilesRoutes'; // Importa a rota de upload
// import loginRouter from './routes/loginRoutes';
// import pg from 'pg';
// import uploadRouter from './routes/uploadRoutes';

// dotenv.config();

// const { Pool } = pg;

// const koa = new Koa();
// const router = new Router();

// koa.use(bodyParser());
// koa.use(cors());
// // console.log("process.env.DATABASE_URL:",process.env.DATABASE_URL);

// //----------INICIO DA CONEXÃO COM POSTGRESQL------------------
// // Configuração do cliente PostgreSQL
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL as string, // Garantia de que DATABASE_URL é uma string
// });

// // Conectar ao banco de dados
// pool
//   .connect()
//   .then(() => {
//     return console.log('Conectado ao banco de dados PostgreSQL');
//   })
//   .catch((err: Error) => {
//     return console.error('Erro ao conectar ao banco de dados', err);
//   });
// //----------FIM DA CONEXÃO COM POSTGRESQL------------------

// export const getClient = async () => {
//   const client = await pool.connect();
//   return client;
// };

// // Configuração das rotas no Koa
// koa.use(router.routes());
// koa.use(router.allowedMethods());

// // Use os routers importados
// koa.use(loginRouter.routes());
// koa.use(loginRouter.allowedMethods());
// koa.use(delete_fileRouter.routes());
// koa.use(delete_fileRouter.allowedMethods());
// koa.use(uploadRouter.routes());
// koa.use(uploadRouter.allowedMethods());
// koa.use(addDataRouter(pool).routes());
// koa.use(addDataRouter(pool).allowedMethods());
// koa.use(listFilesRouter.routes());
// koa.use(listFilesRouter.allowedMethods());

// // add a health check route
// router.get('/health', (ctx) => {
//   ctx.body = 'OK';
// });

// const PORT = process.env.PORT || 3000;
// koa.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });
