'use strict';

/** @type {import('sequelize-cli').Migration} */


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
    })

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
    await queryInterface.removeColumn('Spots', 'ownerId');
    await queryInterface.removeColumn('SpotImages', 'spotId');
    await queryInterface.removeColumn('Reviews', 'spotId');
    await queryInterface.removeColumn('Reviews', 'userId');
    await queryInterface.removeColumn('ReviewImages', 'reviewId');
  }
};
