/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
import { Context, Next } from 'koa';
import Router from 'koa-router';
import SftpClient from 'ssh2-sftp-client';
import multer from '@koa/multer';


// Configurando o multer para armazenar arquivos na pasta 'uploads/'
const upload = multer({ dest: 'uploads/' });

const sftp = new SftpClient();
// Criando o router
export const uploadRouter = new Router();

// Middleware para lidar com uploads de arquivos
const multerMiddleware = upload.any();

const uploadToRemote = async (path: string, filename: string): Promise<void> => {

  const config = {
    host: process.env.REMOTE_IP!,
    port: parseInt(process.env.REMOTE_PORT!, 10),
    username: process.env.REMOTE_USER!,
    password: process.env.REMOTE_PASSWORD!,
    readyTimeout: 40000 // Timeout de 40 segundos
  };

  try {
    await sftp.connect(config);
    const remotePath = `${process.env.REMOTE_DIR}/${filename}`;
    console.log(`RemotePath: ${remotePath}`);
    await sftp.put(path, remotePath);
    await sftp.end();
    console.log(`Arquivo ${filename} enviado com sucesso para ${remotePath}`);
  } catch (err) {
    // Corrigir a inferência de tipo de erro
    if (err instanceof Error) {
      console.error(`Erro ao enviar o arquivo: ${err.message}`);
    } else {
      console.error('Erro desconhecido ao enviar o arquivo');
    }
    throw err;
  }
  console.log(`Arquivo ${filename} carregado para o servidor remoto.`);
};

uploadRouter.post(
  '/upload',
  multerMiddleware,
  async (ctx: Context, next: Next) => {
  console.log("UPLOAD");
  try {
    // Logs para debugging
    console.log('ctx.request:', ctx.request);
    console.log('Campos recebidos:', ctx.request.body);
    console.log('Arquivos recebidos:', ctx.request.files);

    // Checa se os arquivos estão no request body
    if (!ctx.request.files || (ctx.request.files as Express.Multer.File[]).length === 0) {
      ctx.throw(400, 'Nenhum arquivo para upload');
    }

    // Display detalhes dos arquivos recebidos
    const files = ctx.request.files as Express.Multer.File[];
    console.log('Arquivos recebidos:');
    for (const file of files) {
      console.log(`Original name: ${file.originalname}`);
      console.log(`Stored name: ${file.filename}`);
      console.log(`File type: ${file.mimetype}`);
      console.log(`Path: ${file.path}`);
      console.log(`Size: ${file.size}`);
      console.log('---');

      // Upload do arquivo para o servidor remoto
      await uploadToRemote(file.path, file.filename);
    }

    ctx.body = {
      message: 'Upload com sucesso',
      files: files.map((file) => { return {
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        path: file.path,
        size: file.size
      } })
    };
  } catch (err) {
    console.error('Erro durante o upload:', (err as Error).message);
    ctx.status = 500;
    ctx.body = { message: 'Erro durante o upload', error: (err as Error).message };
  }

  await next(); // Certifique-se de chamar next()
});
// eslint-disable-next-line import/no-default-export
export default uploadRouter;