/* eslint-disable no-console */
// import * as dotenv from 'dotenv';
// import axios from 'axios';

// /**
//  * Define the variables below to run the container orchestrator
//  */
// const PROJECT_NAME = 'celnn_in_a_quantum_device';
// const ACTION = 'update'; // update | add

// dotenv.config();
// const AUTH_TOKEN = process.env.AUTH_TOKEN;
// const HOSTNAME = process.env.HOSTNAME;

// if (!AUTH_TOKEN || !HOSTNAME) {
//   console.error(
//     'Error: Make sure AUTH_TOKEN and HOSTNAME are set in .env file.'
//   );
//   process.exit(1);
// }

// const sendProjectToOrchestrator = async ({
//   projectName,
//   action,
// }: {
//   projectName: string;
//   action: string;
// }) => {
//   try {
//     const response = await axios.post(
//       `${HOSTNAME}/projects`,
//       {
//         project: projectName,
//         action,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: AUTH_TOKEN,
//         },
//       }
//     );

//     console.log(`Projeto ${projectName} enviado com sucesso!`);
//     console.log('Resposta:', response.data);
//   } catch (error) {
//     console.error(`Erro ao enviar o projeto ${projectName}:`, error);
//   }
// };

// sendProjectToOrchestrator({
//   projectName: PROJECT_NAME,
//   action: ACTION,
// });

import { loadEnvironmentVariables } from './src/loadEnv';
import { updateProject } from './src/orchestrator';
const runLocal = async () => {
  await loadEnvironmentVariables();
  await updateProject('celnn_in_a_quantum_device').then(console.log);
  return 1;
};

runLocal().then(console.log);
