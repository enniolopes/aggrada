/* eslint-disable no-console */
import { config } from 'dotenv';
import { resolve } from 'path';

// Função para carregar e validar variáveis de ambiente
export const loadEnvironmentVariables = () => {
  // Caminho absoluto para o arquivo .env
  const envPath = resolve(__dirname, '../.env');

  // Carrega as variáveis do .env para process.env
  const result = config({ path: envPath });

  if (result.error) {
    console.error('Erro ao carregar o arquivo .env:', result.error);
    process.exit(1);
  }

  // Lista as variáveis carregadas (opcional)
  console.log('Variáveis de ambiente carregadas:');
  for (const key in process.env) {
    if (Object.prototype.hasOwnProperty.call(process.env, key)) {
      // console.log(`${key}=${process.env[key]}`);
    }
  }

  // Validação adicional (exemplo: verificar se GITLAB_REPO_URL está definida)
  if (!process.env.GITLAB_REPO_URL) {
    console.error('Erro: GITLAB_REPO_URL não está definida no arquivo .env');
    process.exit(1);
  }

  // Adicione outras validações conforme necessário
};

// Executa a função de carregamento
loadEnvironmentVariables();

// Exemplo de uso das variáveis carregadas
// Você pode remover ou modificar esta parte conforme a necessidade da sua aplicação
// console.log('\nExemplo de uso das variáveis de ambiente:');
// console.log(`URL do Repositório GitLab: ${process.env.GITLAB_REPO_URL}`);
// console.log(`Token de Autenticação: ${process.env.AUTH_TOKEN}`);
// console.log(`Hostname: ${process.env.HOSTNAME}`);
