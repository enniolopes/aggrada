import * as Models from '../src/models';
import { Sequelize } from 'sequelize-typescript';
import fs from 'fs';
import sequelizeErd from 'sequelize-erd';

(async () => {
  const sequelize = new Sequelize({
    logging: false,
    dialect: 'postgres',
    define: {
      // underscored: true,
      timestamps: true,
    },
    models: Object.values(Models),
  });

  const svg = await sequelizeErd({ source: sequelize });
  fs.writeFileSync('./public/erd.svg', svg);
})();
