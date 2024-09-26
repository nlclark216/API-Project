'use strict';
/** @type {import('sequelize-cli').Migration} */

const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
};

module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: "123 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 37.7645358,
        lng: -122.4730327,
        name: "App Academy",
        description: "Place where web developers are created",
        price: 123
      },
      {
        ownerId: 1,
        address: "456 Elm Street",
        city: "Los Angeles",
        state: "California",
        country: "United States of America",
        lat: 34.052235,
        lng: -118.243683,
        name: "Code Academy",
        description: "Learn to code in the heart of LA",
        price: 150
      }, 
      {
        ownerId: 2,
        address: "789 Maple Avenue",
        city: "New York",
        state: "New York",
        country: "United States of America",
        lat: 40.712776,
        lng: -74.005974,
        name: "Tech Hub",
        description: "Innovative tech space in NYC",
        price: 200
      },
      {
        ownerId: 2,
        address: "101 Pine Street",
        city: "Chicago",
        state: "Illinois",
        country: "United States of America",
        lat: 41.878113,
        lng: -87.629799,
        name: "Dev Center",
        description: "Chicago's premier developer community",
        price: 175
      },
      {
        ownerId: 2,
        address: "202 Oak Lane",
        city: "Houston",
        state: "Texas",
        country: "United States of America",
        lat: 29.760427,
        lng: -95.369804,
        name: "Coder's Den",
        description: "Houston's hub for aspiring developers",
        price: 130
      },
      {
        ownerId: 3,
        address: "303 Birch Road",
        city: "Miami",
        state: "Florida",
        country: "United States of America",
        lat: 25.761680,
        lng: -80.191790,
        name: "Web Dev House",
        description: "Miami's leading web development school",
        price: 140
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ["Web Dev House", "Coder's Den", "Dev Center","Tech Hub","Code Academy","App Academy"] }
    }, {});
  }
};
