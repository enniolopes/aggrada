import 'dotenv/config';

import { db } from '../src/db';

(async () => {
  const obs = await db.AggradaObservation.findOne();
  // eslint-disable-next-line no-console
  console.log(obs?.dataValues);
  await db.sequelize.close();
})();
