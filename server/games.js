const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db')

const games = sequelize.define('games',  {
        room: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        player1: {
            type: DataTypes.STRING,
            allowNull: false
        },
        player2:{
            type: DataTypes.STRING,
            allowNull: false
        },
        winner:{
            type:DataTypes.STRING
        },
        
    });


module.exports = games;