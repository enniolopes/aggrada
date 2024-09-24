/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
import Router from 'koa-router';
import SftpClient from 'ssh2-sftp-client';

const REMOTE_DIR = process.env.REMOTE_DIR as string;
const sftp = new SftpClient();

// Endpoint para deletar arquivos no servidor remoto
export const delete_fileRouter = new Router();

// Endpoint para deletar arquivos no servidor remoto
delete_fileRouter.post('/delete-file', async (ctx: Router.RouterContext) => {
  const { filename } = ctx.request.body as { filename: string };
  console.log(filename);

  if (!filename) {
    ctx.status = 400;
    ctx.body = { error: 'Filename é requerido' };
    return;
  }

  try {
    await sftp.connect({
      host: process.env.REMOTE_IP as string,
      port: parseInt(process.env.REMOTE_PORT as string, 10),
      username: process.env.REMOTE_USER as string,
      password: process.env.REMOTE_PASSWORD as string,
    });

    const remoteFilePath = `${REMOTE_DIR}/${filename}`;
    console.log(remoteFilePath);
    await sftp.delete(remoteFilePath);

    ctx.status = 200;
    ctx.body = { message: 'Arquivo deletado com sucesso' };
  }  catch (err) {
    const errorMessage = (err as Error).message || 'Erro desconhecido';
    ctx.status = 500;
    ctx.body = { error: 'Falha ao deletar arquivo no servidor remoto: ' + errorMessage };
  } finally {
    sftp.end();
  }
});
// eslint-disable-next-line import/no-default-export
export default delete_fileRouter;