# Simple4Decision's PostgresSQL Database

## About

- We use [@ttoss/postgresdb](https://ttoss.dev/docs/modules/packages/postgresdb/) to manage the database using code-first approach. Check [ttoss guidelines](https://ttoss.dev/docs/engineering/guidelines/postgresdb) for more information.
- View the [database structure documentation](./DATABASE.md)

## Development

To create a database for development, you can use the following steps:

1. Create a `.env` file at the root of the package with the following variables (change the values as needed):

   ```yaml
   DB_NAME=simple4decisiondb
   DB_USERNAME=postgres
   DB_PASSWORD=mysecretpassword
   DB_HOST=localhost
   ```

1. Run `docker compose -f docker-compose.dev.yml up -d` to start the database.

1. Run `pnpm run sync` to create the database and tables.

1. Check if the database and tables were created successfully. Run `docker exec -it simple4decision-db psql -U postgres -d simple4decisiondb` to connect to the database and then run `\dt` to list the tables. If the tables are listed, the database was created successfully.

1. Run `pnpm run seed` to seed the database with sample data.

1. After you finish development, run `docker compose -f docker-compose.dev.yml down` to stop the database.

## Operations

### Spatial Entity

1. Admin Levels: define the admin_levels at [adminLevelMap.ts](subsystem/postgresdb/src/transformers/adminLevelMap.ts)
