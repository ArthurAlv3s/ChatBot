const knex = require('knex');
const knexdb = knex({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'senacrs',
    database: 'chatbot'
  }
});

module.exports = knexdb;
