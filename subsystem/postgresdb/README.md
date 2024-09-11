# Simple4Decision's PostgresSQL Database

## About

- We use [Sequelize](https://sequelize.org/docs/v6/) for PostgresSQL

- View the [database structure documentation](./DATABASE.md)

## Install New DataBase with Docker

1. Create a .env file at [postgresdb root folder](./) with the variables (substitute \* with your values):

```yaml
DATABASE_HOST=*
DATABASE_PORT=*
DATABASE_NAME=*
DATABASE_USERNAME=*
DATABASE_PASSWORD=*
```

2. Install all dependencies at CLI:

```bash
pnpm install
```

3. Create Docker container at CLI (the docker needs to be already installed):

```bash
pnpm run db-docker-compose
```

4. Create Simple4Decision Database and Tables:

```bash
pnpm run sync
```
