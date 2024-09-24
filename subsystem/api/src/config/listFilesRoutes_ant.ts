/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
import Router from 'koa-router';
// import { Context } from 'koa';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

// import { Client, ClientChannel, ConnectConfig } from 'ssh2';
import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';

dotenv.config();

const sftp = new SftpClient();

const listFilesRouter = new Router();
const REMOTE_DIR = process.env.REMOTE_DIR as string;

// Função para conectar ao servidor remoto
// const connectToRemoteServer = (): Promise<Client> => {
//   return new Promise((resolve, reject) => {
//     const conn = new Client();
//     conn.on('ready', () => {
//       console.log('Conectado ao servidor');
//       resolve(conn);
//     }).on('error', (err: Error) => {
//       console.error('Erro na conexão com o servidor remoto:', err);
//       reject(err);
//     }).connect({
//       host: process.env.REMOTE_IP,
//       port: process.env.REMOTE_PORT_SERVER,
//       username: process.env.REMOTE_USER_SERVER,
//       password: process.env.REMOTE_PASSWORD_SERVER,
//     } as ConnectConfig);
//   });
// };

// // Função para listar arquivos no servidor remoto
// const listRemoteFiles = async (conn: Client): Promise<string[]> => {
//   return new Promise((resolve, reject) => {
//     conn.exec(`ls -l ${REMOTE_DIR}`, (err: Error | null, stream: ClientChannel) => {
//       if (err) {
//         reject(err);
//         return;
//       }
//       let data = '';
//       stream
//         .on('close', () => {
//           conn.end();
//           const files = data.split('\n')
//             .filter((line) => { return line.trim() !== '' })
//             .map((line) => { return line.trim() });
//           resolve(files);
//         })
//         .on('data', (chunk: Buffer) => {
//           data += chunk.toString();
//         })
//         .stderr.on('data', (chunk: Buffer) => {
//           reject(chunk.toString());
//         });
//     });
//   });
// };

// // Endpoint para listar arquivos no servidor remoto
// listFilesRouter.get('/files', async (ctx) => {
//   try {
//     const conn = await connectToRemoteServer();
//     const files = await listRemoteFiles(conn);
//     ctx.body = {
//       success: true,
//       files,
//     };
//     ctx.status = 200;
//   } catch (error) {
//     console.error('Erro ao listar arquivos:', error);
//     ctx.status = 500;
//     ctx.body = {
//       success: false,
//       message: 'Não foi possível listar os arquivos',
//       error: (error as Error).message,
//     };
//   }
// });

const listRemoteFiles = async (): Promise<string[]> => {
  try {
    await sftp.connect({
      host: process.env.REMOTE_IP!,
      port: Number(process.env.REMOTE_PORT_SERVER!),
      username: process.env.REMOTE_USER_SERVER!,
      password: process.env.REMOTE_PASSWORD_SERVER!,
    });

    const fileList = await sftp.list(REMOTE_DIR);
    await sftp.end();

    return fileList.map((file) => { return file.name });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    throw error;
  }
};

listFilesRouter.get('/files', async (ctx) => {
  try {
    const files = await listRemoteFiles();
    ctx.body = {
      success: true,
      files,
    };
    ctx.status = 200;
  } catch (error) {
    console.error('Erro ao listar arquivos:', (error as Error).message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Não foi possível listar os arquivos',
      error: (error as Error).message,
    };
  }
});

// eslint-disable-next-line import/no-default-export
export default listFilesRouter;
