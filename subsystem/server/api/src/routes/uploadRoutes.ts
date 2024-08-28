/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// uploadRoutes.ts

import { Context, Next } from 'koa';
import Router from 'koa-router';
import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import multer, { StorageEngine } from '@koa/multer';

dotenv.config();

const uploadRouter = new Router();
//export const uploadRouter = new Router();
const sftp = new SftpClient();

// Configuração do multer para armazenar os arquivos temporariamente em './uploads'
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});

// Middleware de upload usando multer
const upload = multer({ storage });

// Função para fazer upload do arquivo para o servidor remoto
const uploadToRemote = async (
  filePath: string,
  fileName: string
): Promise<void> => {
  const config = {
    host: process.env.REMOTE_IP!,
    port: parseInt(process.env.REMOTE_PORT!, 10),
    username: process.env.REMOTE_USER!,
    password: process.env.REMOTE_PASSWORD!,
    readyTimeout: 40000, // Timeout de 40 segundos
  };

  try {
    await sftp.connect(config);
    const remotePath = `${process.env.REMOTE_DIR}/${fileName}`;
    console.log(`RemotePath: ${remotePath}`);
    await sftp.put(filePath, remotePath);
    await sftp.end();
    console.log(`Arquivo ${fileName} enviado com sucesso para ${remotePath}`);
  } catch (err) {
    console.error(`Erro ao enviar o arquivo: ${(err as Error).message}`);
    throw err;
  }
};

// Endpoint para upload de arquivos
uploadRouter.post('/upload', upload.any(), async (ctx: Context, next: Next) => {
  console.log('UPLOAD');
  try {
    // Logs para debugging
    console.log('ctx.request:', ctx.request);
    console.log('Campos recebidos:', ctx.request.body);
    console.log('Arquivos recebidos:', ctx.request.files);

    // Checa se os arquivos estão no request body
    if (
      !ctx.request.files ||
      (ctx.request.files as Express.Multer.File[]).length === 0
    ) {
      ctx.throw(400, 'Nenhum arquivo para upload');
    }

    // Display detalhes dos arquivos recebidos
    console.log('Arquivos recebidos:');
    for (const file of ctx.request.files as Express.Multer.File[]) {
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
      files: (ctx.request.files as Express.Multer.File[]).map((file) => {
        return {
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          path: file.path,
          size: file.size,
        };
      }),
    };
  } catch (err) {
    console.error('Erro durante o upload:', err);
    ctx.status = 500;
    ctx.body = { message: 'Internal error durante o upload' };
  }

  await next(); // Certifique-se de chamar next()
});

// eslint-disable-next-line import/no-default-export
export default uploadRouter;
