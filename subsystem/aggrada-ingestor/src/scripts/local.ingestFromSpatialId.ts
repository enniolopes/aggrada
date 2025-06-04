// /* eslint-disable no-console */
// import 'dotenv/config';

// import { ingestFromSpatialId } from '../ingestors/ingestFromSpatialId';

// // SJRP Controle Vigilancia CSV
// const sjrpControleYears2 = [2022,2021,2020,2019,2018]
// for (const year of sjrpControleYears2) {
//   const filePath = `/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp-${year}.csv`

//   console.log('init filePath: ', filePath);

//   await ingestFromSpatialId({
//     file: filePath,
//     fileFormat: 'csv-semicolon',
//     geoCodeKey: 'numero_quarteirao',
//     source: 'user',
//     adminLevel: 'block',
//     timeKey: 'mes',
//   });
// }

// // SJRP Controle Vigilancia CSV - vig 2012 a 2016
// const filesSjrpVig = [
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp2012-vig.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp2013-vig.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp2014-vig.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp2015-vig.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp2016-vig.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp2017acima-vig.csv'
// ]

// for (const fileSjrpVig of filesSjrpVig) {
//   const filePath = fileSjrpVig;

//   console.log('init filePath: ', filePath);

//   await ingestFromSpatialId({
//     file: filePath,
//     fileFormat: 'csv-semicolon',
//     geoCodeKey: 'numero_quarteirao',
//     source: 'user',
//     adminLevel: 'block',
//     timeKey: 'mes',
//   });
// }


// // SJRP Controle Vigilancia CSV - ad 2012 a 2016
// const filesSjrpAd = [
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp-adl2012.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp-adl2013.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp-adl2014.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp-adl2015.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp-adl2016.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp-adl2017acima.csv',
//   '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/sjrp-controle/sjrp-adl2017abaixo.csv',
// ]

// for (const fileSjrpAd of filesSjrpAd) {
//   const filePath = fileSjrpAd

//   console.log('init filePath: ', filePath);

//   await ingestFromSpatialId({
//     file: filePath,
//     fileFormat: 'csv-semicolon',
//     geoCodeKey: 'numero_quarteirao',
//     source: 'user',
//     adminLevel: 'block',
//     timeKey: 'mes',
//   });
// }



// console.log('finished ingestion', new Date());
