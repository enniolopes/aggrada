/* eslint-disable prettier/prettier */
import { getClient } from '../config/db';
import Router from 'koa-router';
import dotenv from 'dotenv'; // Importa a função para obter o cliente do Pool
import jwt from 'jsonwebtoken';

dotenv.config();

export const loginRouter = new Router();

// Interface para a estrutura dos dados de login
interface LoginRequestBody {
  username: string;
  password: string;
}

// Rota para fazer login
loginRouter.post('/login', async (ctx: Router.RouterContext) => {
  //console.log("LOGIN");
  const { username, password } = ctx.request.body as LoginRequestBody;

  // Validação do usuário e senha no banco de dados
  const client = await getClient(); // Obtém o cliente do Pool
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    
    if (result.rows.length > 0) {
      const token = jwt.sign({ username: result.rows[0].username }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      ctx.body = { token };
    } else {
      ctx.status = 401;
      ctx.body = { message: 'Credenciais Inválidas' };
    }
  } catch (err) {
    //console.error('Erro ao validar usuário:', err);
    ctx.status = 500;
    ctx.body = { message: 'Erro interno do servidor' };
  } finally {
    client.release(); // Libere o cliente após o uso
  }
});

// eslint-disable-next-line import/no-default-export
export default loginRouter;