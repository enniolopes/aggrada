import * as Models from './models';
import { Sequelize, type SequelizeOptions } from 'sequelize-typescript';

let sequelize: Sequelize;

export const loadSequelize = async (options: SequelizeOptions) => {
  if (sequelize) {
    return sequelize;
  }

  sequelize = new Sequelize({
    logging: false,
    ...options,
    /**
     * `options` cannot change the properties below.
     * They are fixed for the project.
     */
    dialect: 'postgres',
    define: {
      // underscored: true,
      timestamps: true,
    },
    models: Object.values(Models),
  });

  await sequelize.authenticate();

  return sequelize;
};
