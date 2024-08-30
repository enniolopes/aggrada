import { DefaultContext, DefaultState } from 'koa';
import { Pool } from 'pg';
import Router from 'koa-router';

interface AddDataRequestBody {
  // user_id: string;
  // descrição: string;
  email: string;
  password_hash: string;
  name: string;
}

const router = new Router<DefaultState, DefaultContext>();

export const addDataRouter = (pool: Pool) => {
  router.post('/upload-add-data', async (ctx) => {
    const body = ctx.request.body as AddDataRequestBody;
    // const { user_id, descrição } = body;
    const { email, password_hash, name } = body;

    // if (!user_id || !descrição) {
    //   ctx.status = 400;
    //   ctx.body = { error: 'Por favor, forneça user_id e descrição' };
    //   return;
    // }
    if (!email || !password_hash || !name) {
      ctx.status = 400;
      ctx.body = { error: 'Por favor, forneça email, password_hash e name' };
      return;
    }

    try {
      // const existingUser = await pool.query(
      //   'SELECT * FROM "MULTIMAPAS".dados WHERE user_id = $1',
      //   [user_id]
      // );
      const existingUser = await pool.query(
        'SELECT * FROM public."Users" WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        ctx.status = 409; // Conflito
        // ctx.body = { message: 'user_id já existe' };
        ctx.body = { message: 'Email já está em uso' };
        return;
      }

      const query =
        // 'INSERT INTO "MULTIMAPAS".dados (user_id, descrição) VALUES ($1, $2)';
        // const values = [user_id, descrição];
        'INSERT INTO public."Users" (email, password_hash, name, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())';
      const values = [email, password_hash, name];
      await pool.query(query, values);

      ctx.status = 201;
      ctx.body = { message: 'Dados inseridos com sucesso' };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Erro ao inserir dados no banco de dados', err);
      ctx.status = 500;
      ctx.body = { error: 'Erro ao inserir dados no banco de dados' };
    }
  });

  return router;
};

// eslint-disable-next-line import/no-default-export
export default addDataRouter;
