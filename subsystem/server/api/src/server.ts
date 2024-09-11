/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { Pool } from 'pg';
import Koa from 'koa';
import Router from 'koa-router';
import addDataRouter from './routes/addDataRoutes'; // Importa a classe Pool do pacote pg
import bodyParser from 'koa-bodyparser';
import delete_fileRouter from './routes/delete_fileRoutes'; // Importa a rota de login
import dotenv from 'dotenv'; // Importa a rota de delete-file
import listFilesRouter from './routes/listFilesRoutes'; // Importa a rota de upload
import loginRouter from './routes/loginRoutes';
import uploadRouter from './routes/uploadRoutes';

dotenv.config();

const koa = new Koa();
const router = new Router();

koa.use(bodyParser());
// console.log("process.env.DATABASE_URL:",process.env.DATABASE_URL);


//----------INICIO DA CONEXÃO COM POSTGRESQL------------------
// Configuração do cliente PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL as string, // Garantia de que DATABASE_URL é uma string
});

// Conectar ao banco de dados
pool.connect()
  .then(() => { return console.log('Conectado ao banco de dados PostgreSQL') })
  .catch((err: Error) => { return console.error('Erro ao conectar ao banco de dados', err) });
//----------FIM DA CONEXÃO COM POSTGRESQL------------------

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Configuração das rotas no Koa
koa.use(router.routes());
koa.use(router.allowedMethods());

// Use os routers importados
koa.use(loginRouter.routes());
koa.use(loginRouter.allowedMethods());
koa.use(delete_fileRouter.routes());
koa.use(delete_fileRouter.allowedMethods());
koa.use(uploadRouter.routes());
koa.use(uploadRouter.allowedMethods());
koa.use(addDataRouter(pool).routes());
koa.use(addDataRouter(pool).allowedMethods());
koa.use(listFilesRouter.routes());  
koa.use(listFilesRouter.allowedMethods());


const PORT = process.env.PORT || 3001;
koa.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
