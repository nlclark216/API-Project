'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
options.tableName = 'SpotImages';
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
};

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(options, 'spotId', {
      type: Sequelize.INTEGER,
      references: { model: 'Spots' },
      onDelete: 'cascade',
      allowNull: false
    }, options);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(options, 'spotId');
  }
};
