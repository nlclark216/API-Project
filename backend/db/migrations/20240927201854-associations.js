'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
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

    await queryInterface.addColumn('Spots', 'ownerId', {
      type: Sequelize.INTEGER,
      references: { model: 'Users' },
      onDelete: 'cascade',
      allowNull: false
    }, options)

    await queryInterface.addColumn('SpotImages', 'spotId', {
      type: Sequelize.INTEGER,
      references: { model: 'Spots' },
      onDelete: 'cascade',
      allowNull: false
    })

    await queryInterface.addColumn('Reviews', 'spotId', {
      type: Sequelize.INTEGER,
      references: { model: 'Spots' },
      onDelete: 'cascade',
      allowNull: false
    })

    await queryInterface.addColumn('Reviews', 'userId', {
      type: Sequelize.INTEGER,
      references: { model: 'Users' },
      onDelete: 'cascade',
      allowNull: false
    })

    await queryInterface.addColumn('ReviewImages', 'reviewId', {
      type: Sequelize.INTEGER,
      references: { model: 'Reviews' }
    })
  },


  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    options.tableName = 'Spots';
    await queryInterface.removeColumn(options);
    options.tableName = 'SpotImages';
    await queryInterface.removeColumn(options);
    // await queryInterface.removeColumn('SpotImages', 'spotId');
    options.tableName = 'Reviews';
    await queryInterface.removeColumn(options);
    // await queryInterface.removeColumn('Reviews', 'spotId');
    // await queryInterface.removeColumn('Reviews', 'userId');
    options.tableName = 'ReviewImages';
    await queryInterface.removeColumn(options);
    // await queryInterface.removeColumn('ReviewImages', 'reviewId');
  }
};
