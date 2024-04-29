const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('Tic-tac-toe', 'postgres', 'postgre', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});
sequelize.sync()
        .then(() => {
            console.log('Database synchronized');
        })
        .catch(err => {
            console.error('Error synchronizing database:', err);
        });

module.exports = sequelize;

