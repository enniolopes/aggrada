/* eslint-disable no-console */
import { db } from '@simple4decision/postgresdb';
import 'dotenv/config';

(async () => {
  db.sequelize.authenticate();
  const users = await db.CoreUser.findAll();
  // eslint-disable-next-line no-console
  console.log(users);
  await db.sequelize.close();
})();

// (async () => {
//   const mockAggradaSpatialData = {
//     geo_code: 'TEST',
//     source: 'IBGE',
//     start_date: new Date('2022-01-01'),
//     metadata: {
//       additional_info: 'Dados adicionais de teste',
//       reference: 'Referência teste',
//     },
//     geometry: {
//       type: 'Point',
//       coordinates: [-46.633309, -23.55052],
//     },
//   };

//   const newSpatialData = await db.AggradaSpatial.create(mockAggradaSpatialData);
//   console.log('Novo dado inserido:', newSpatialData);
// })();
