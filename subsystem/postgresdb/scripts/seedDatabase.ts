import 'dotenv/config';

import { db } from '../src/db';

(async () => {
  const users = await db.CoreUser.findAll();
  // eslint-disable-next-line no-console
  console.log(users);
  await db.sequelize.close();
})();
