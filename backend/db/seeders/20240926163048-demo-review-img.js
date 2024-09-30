'use strict';

const { ReviewImage } = require('../models');

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; 
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await ReviewImage.bulkCreate([
      {
        reviewId: 1,
        url: "review1 image url"
      },
      {
        reviewId: 2,
        url: "review2 image url"
      },
      {
        reviewId: 3,
        url: "review3 image url"
      },
      {
        reviewId: 4,
        url: "review4 image url"
      },
      {
        reviewId: 5,
        url: "review5 image url"
      },
      {
        reviewId: 6,
        url: "review6 image url"
      }
    ], { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.substring]: '%url%'}
    }, {})
  }
};
