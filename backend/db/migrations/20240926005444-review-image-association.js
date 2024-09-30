'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
options.tableName = 'ReviewImages';
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
};

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(options, 'reviewId', {
      type: Sequelize.INTEGER,
      references: { model: 'Reviews' }
    }, options);
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(options, 'reviewId');
  }
};
