import { loadSequelize } from '../src';
import 'dotenv/config';

const database = process.env.DATABASE_NAME;
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;
const host = process.env.DATABASE_HOST;
const port = process.env.DATABASE_PORT;

const args = process.argv.slice(2);

(async () => {
  const sequelize = await loadSequelize({
    database,
    username,
    password,
    host,
    port: Number(port),
  });

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const environment = process.env.ENVIRONMENT;

  const alter = (() => {
    if (!args.includes('--alter')) {
      return false;
    }

    if (!environment) {
      // eslint-disable-next-line no-console
      console.info('No environment specified, cannot alter sync!');
      return false;
    }

    if (environment === 'Production') {
      // eslint-disable-next-line no-console
      console.info('Environment is Production, cannot alter sync!');
      return false;
    }

    return true;
  })();

  await sequelize.sync({
    /**
     * Don't force anymore because it's better to run migrations.
     */
    force: false,
    alter,
  });

  // eslint-disable-next-line no-console
  console.log('Database & tables created!');
})();
