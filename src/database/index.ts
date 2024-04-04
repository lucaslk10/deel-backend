import { Sequelize } from 'sequelize';
import { NODE_ENV } from '@config';
import { logger } from '@utils/logger';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
  logQueryParameters: NODE_ENV === 'development',
  logging: (query, time) => {
    logger.info(time + 'ms' + ' ' + query);
  },
  benchmark: true,
});

export const DB = {
  sequelize, // connection instance (RAW queries)
  Sequelize, // library
};
