const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('Tic-tac-toe', 'postgres', 'postgre', {
    host: 'localhost',
    dialect: 'postgres'
});


module.exports = sequelize;

