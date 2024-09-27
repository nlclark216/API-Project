'use strict';
const { Model, Validator, Op } = require('sequelize');
const { Spot } = require('../models');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Spot, { foreignKey: "ownerId", onDelete: 'cascade', hooks: true });
      User.hasMany(models.Review, { foreignKey: "userId", onDelete: 'cascade', hooks: true })
    };
  };
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [4, 30],
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error('Cannot be an email.');
          }
        },
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 256],
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 256],
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
          len: [3, 256],
          isEmail: true,
      },
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
        validate: {
          len: [60, 60],
        },
    }
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
      },
    },
    scopes: {
      checkPassword(email) {
          return {
              where: { email }, 
              attributes: { 
                  include: [ "hashedPassword" ]
              }
          }
      },
      isOwner(id) { 
      },
  
  }
  });
  return User;
};