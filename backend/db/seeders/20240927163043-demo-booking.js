'use strict';

const { Booking } = require('../models');

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
};


module.exports = {
  async up (queryInterface, Sequelize) {
    await Booking.bulkCreate([
      {
        spotId: 1,
        userId: 2,
        startDate: "2024-11-19",
        endDate: "2024-11-20",
      },
      {
        spotId: 3,
        userId: 3,
        startDate: "2024-11-19",
        endDate: "2024-11-20",
      },
      {
        spotId: 5,
        userId: 1,
        startDate: "2024-11-19",
        endDate: "2024-11-20",
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: { [Op.between]: [1, 3] }
    }, {});
  }
};
