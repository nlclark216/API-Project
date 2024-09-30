'use strict';

const { Review } = require('../models');

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
};

module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 2,
        spotId: 1,
        review: "This was an awesome spot!",
        stars: 5,
      },
      {
        userId: 3,
        spotId: 1,
        review: "What an amazing spot!",
        stars: 4,
      },
      {
        userId: 2,
        spotId: 2,
        review: "Really liked this spot!",
        stars: 5,
      },
      {
        userId: 3,
        spotId: 2,
        review: "This was an awesome spot!",
        stars: 4,
      },
      {
        userId: 1,
        spotId: 3,
        review: "What an amazing spot!",
        stars: 4,
      },
      {
        userId: 3,
        spotId: 3,
        review: "Really liked this spot!",
        stars: 5,
      },
      {
        userId: 1,
        spotId: 4,
        review: "This was an awesome spot!",
        stars: 5,
      },
      {
        userId: 3,
        spotId: 4,
        review: "What an amazing spot!",
        stars: 4,
      },
      {
        userId: 1,
        spotId: 5,
        review: "Really liked this spot!",
        stars: 5,
      },
      {
        userId: 2,
        spotId: 5,
        review: "This was an awesome spot!",
        stars: 4,
      },
      {
        userId: 2,
        spotId: 6,
        review: "What an amazing spot!",
        stars: 4,
      },
      {
        userId: 1,
        spotId: 6,
        review: "Really liked this spot!",
        stars: 5,
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews'
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      stars: { [Op.between]: [1, 5]}
    }, {})
  }
};
