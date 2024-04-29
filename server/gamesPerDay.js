const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db')

const gamesPerDay = sequelize.define('gamesPerDay',  {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_DATE')
        },
        played:{
            type:DataTypes.INTEGER
        },
        won:{
            type:DataTypes.INTEGER
        },
        lost:{
            type:DataTypes.INTEGER
        },
        draw:{
            type:DataTypes.INTEGER
        }
        
    });


module.exports = gamesPerDay;