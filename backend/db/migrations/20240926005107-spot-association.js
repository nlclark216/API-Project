'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
options.tableName = 'Spots';
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; 
};


module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(options, 'ownerId', {
      type: Sequelize.INTEGER,
      references: { model: 'Users' },
      onDelete: 'cascade',
      allowNull: false
    });
    await queryInterface.addColumn(options, 'avgRating', {
      type: Sequelize.INTEGER,
      references: { model: 'Reviews' },
      onDelete: 'cascade'
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(options, 'ownerId');
    await queryInterface.removeColumn(options, 'avgRating');
  }
};
