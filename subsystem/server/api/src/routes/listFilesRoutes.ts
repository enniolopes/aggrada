/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
import { DefaultContext, DefaultState, ParameterizedContext } from 'koa';
import Router from 'koa-router';
import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';

dotenv.config();

const sftp = new SftpClient();
export const listFilesRouter = new Router<DefaultState, DefaultContext>();


// Função para listar arquivos em um diretório remoto
const listRemoteFiles = async (remoteDir: string): Promise<string[]> => {
  console.log('REMOTE_IP:', process.env.REMOTE_IP);
  console.log('REMOTE_PORT:', process.env.REMOTE_PORT_SERVER);
  console.log('REMOTE_USER:', process.env.REMOTE_USER_SERVER);
  console.log('REMOTE_PASSWORD:', process.env.REMOTE_PASSWORD_SERVER);
  

  const config = {
    host: process.env.REMOTE_IP!,
    port: parseInt(process.env.REMOTE_PORT_SERVER!, 10),
    username: process.env.REMOTE_USER_SERVER!,
    password: process.env.REMOTE_PASSWORD_SERVER!,
    readyTimeout: 40000, // Timeout de 40 segundos
  };

  try {
    await sftp.connect(config);
    console.log(`Conectado ao servidor SFTP. Listando arquivos em: ${remoteDir}`);
    const fileList = await sftp.list(remoteDir);
    await sftp.end();

    // Retorna os nomes dos arquivos no diretório remoto
    return fileList.map((file) => { return file.name });
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Erro ao listar arquivos: ${err.message}`);
    } else {
      console.error('Erro desconhecido ao listar arquivos');
    }
    throw err;
  }
};

// Endpoint para listar arquivos de um diretório específico
listFilesRouter.get('/files', async (ctx: ParameterizedContext<DefaultState, DefaultContext>) => {
  console.log("LIST FILES");
  try {
    const remoteDir = process.env.REMOTE_DIR || '/'; // Define o diretório remoto
    const files = await listRemoteFiles(remoteDir);

    console.log('Arquivos listados:', files);

    ctx.body = {
      message: 'Arquivos listados com sucesso',
      files
    };
    ctx.status = 200;
  } catch (err) {
    console.error('Erro ao listar arquivos:', (err as Error).message);
    ctx.status = 500;
    ctx.body = { message: 'Erro ao listar arquivos', error: (err as Error).message };
  }
});

// eslint-disable-next-line import/no-default-export
export default listFilesRouter;
