#!/usr/bin/env tsx
import 'dotenv/config';
import { ingestShapefile, ingestGeoJson } from '../ingestors/geometry';

// (async () => {
//   ingestShapefile({
//       shpPath: `${process.env.STORAGE_RAW_PATH}/pppp-francisco/setor-censitario-sjrp/SC2021.shp`,
//       dbfPath: `${process.env.STORAGE_RAW_PATH}/pppp-francisco/setor-censitario-sjrp/SC2021.dbf`,
//       prjPath: `${process.env.STORAGE_RAW_PATH}/pppp-francisco/setor-censitario-sjrp/SC2021.prj`,
//       cpgPath: `${process.env.STORAGE_RAW_PATH}/pppp-francisco/setor-censitario-sjrp/SC2021.cpg`,
//       nameKey: 'CD_GEOCODI',
//       codeKey: 'CD_GEOCODI',
//       level: 'census_region',
//       source: 'user'
//   })
//   .then(() => console.log('Ingestão de geometrias finalizada'))
//   .catch((err) => {
//     console.error('Erro na ingestão:', err);
//     process.exit(1);
//   })
// })();

(async () => {
  ingestGeoJson({
      file: `${process.env.STORAGE_RAW_PATH}/pppp-francisco/quadras-sjrp/sjrp-quadras.geojson`,
      nameKey: 'QUARTEIRAO',
      codeKey: 'QUARTEIRAO',
      level: 'block',
      source: 'user'
  })
  .then(() => console.log('Ingestão de geometrias finalizada'))
  .catch((err) => {
    console.error('Erro na ingestão:', err);
    process.exit(1);
  })
})();
