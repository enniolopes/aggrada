// #!/usr/bin/env tsx
// // CLI para ingestão de dados do IBGE via API
// import { ingestFromIbgeApi } from '../../src/ingestors/ibge';

// const dataset = process.argv[2];
// if (!dataset) {
//   console.error('Uso: ingest-ibge <dataset>');
//   process.exit(1);
// }

// ingestFromIbgeApi({ dataset })
//   .then(() => console.log('Ingestão IBGE finalizada'))
//   .catch((err) => {
//     console.error('Erro na ingestão IBGE:', err);
//     process.exit(1);
//   });
