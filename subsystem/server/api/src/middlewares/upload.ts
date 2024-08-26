/* eslint-disable prettier/prettier */
/* eslint-disable no-console */

import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import multer from '@koa/multer';

// Carregar variáveis de ambiente
dotenv.config();

const storage = multer.diskStorage({
  destination: (_req, _file, cb)=> {
    cb(null, './uploads');
  },
  filename: (_req, file, cb)=> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

export const upload = multer({ storage });

export const uploadToRemote = async (
  filePath: string,
  fileName: string
): Promise<void> => {
  const sftp = new SftpClient();

  const getEnvVar = (name: string): string => {
    const value = process.env[name];
    if (value === undefined) {
      throw new Error(`A variável de ambiente ${name} não está definida.`);
    }
    return value;
  };
  
  // Configuração
  const config = {
    host: getEnvVar('REMOTE_IP'),
    port: parseInt(getEnvVar('REMOTE_PORT'), 10),
    username: getEnvVar('REMOTE_USER'),
    password: getEnvVar('REMOTE_PASSWORD'),
    readyTimeout: 40000,
  };

  try {
    await sftp.connect(config);
    const remotePath = `${process.env.REMOTE_DIR}/${fileName}`;
    await sftp.put(filePath, remotePath);
    await sftp.end();
  } catch (err) {
    console.error(`Erro ao enviar o arquivo: ${(err as Error).message}`);
    throw err;
  } finally {
    // Ensure that the SFTP connection is closed even if an error occurs
    sftp.end();
  }
}