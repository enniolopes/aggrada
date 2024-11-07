import 'dotenv/config';

import { ingestFromAddress } from '../ingestors/ingestFromAddress';

await ingestFromAddress({
  file: '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestion/.local/data/dengue/dengue_2022.csv',
  fileFormat: 'csv',
  timeKey: 'DT_SIN_PRI',
  addressKeys: {
    streetName: 'NM_LOGRADO',
    streetNumber: 'NU_NUMERO',
    postalCode: 'NU_CEP',
  },
  fixedAddressValues: {
    country: 'Brazil',
  },
});
