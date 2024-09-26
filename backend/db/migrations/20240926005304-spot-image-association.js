'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
options.tableName = 'SpotImages';
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
};
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(options, 'spotId', {
      type: Sequelize.INTEGER,
      references: { model: 'Spots' },
      onDelete: 'cascade',
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(options, 'spotId');
  }
};
