const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db')

const users = sequelize.define('users',  {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name:{
            type:DataTypes.STRING
        },
        age:{
            type:DataTypes.INTEGER
        },
        country:{
            type:DataTypes.STRING
        },
        gender:{
            type:DataTypes.STRING
        },
        gamesPlayed:{
            type:DataTypes.INTEGER
        },
        gamesWon:{
            type:DataTypes.INTEGER
        },
        
    });


module.exports = users;