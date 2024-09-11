// import { Pool } from 'pg';

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// export default pool;

// db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Criação da instância do Pool para conexão com o PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL de conexão com o banco de dados
  ssl: {
    rejectUnauthorized: false, // Defina como necessário para seu ambiente
  },
});

// Função para obter um cliente do Pool
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Função para fechar o Pool
export const closePool = async () => {
  await pool.end();
};
