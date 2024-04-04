const { config } = require('dotenv');
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

module.exports = {
  dialect: 'sqlite',
  storage: './database.sqlite3',
};
