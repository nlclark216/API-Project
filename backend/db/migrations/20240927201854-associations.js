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

    // const spotsTable = await queryInterface.describeTable('Spots');
    

    // if (!spotsTable.ownerId) {
      options.tableName = 'Spots';
      await queryInterface.addColumn(options, 'ownerId', {
        type: Sequelize.INTEGER,
        references: { model: 'Users' },
        onDelete: 'cascade',
        allowNull: false
      });
    // };

    // const spotImagesTable = await queryInterface.describeTable('SpotImages');

    // if(!spotImagesTable.spotId){
      options.tableName = 'SpotImages';
      await queryInterface.addColumn(options, 'spotId', {
        type: Sequelize.INTEGER,
        references: { model: 'Spots' },
        onDelete: 'cascade',
        allowNull: false
      });
    // };

    
    
    // const reviewsTable = await queryInterface.describeTable('Reviews');

    // if(!reviewsTable.spotId && !reviewsTable.userId){
      options.tableName = 'Reviews';
      await queryInterface.addColumn(options, 'spotId', {
        type: Sequelize.INTEGER,
        references: { model: 'Spots' },
        onDelete: 'cascade',
        allowNull: false
      });
      await queryInterface.addColumn(options, 'userId', {
        type: Sequelize.INTEGER,
        references: { model: 'Users' },
        onDelete: 'cascade',
        allowNull: false
      });
    // };

    
    // const reviewImagesTable = await queryInterface.describeTable('ReviewImages');
    
    // if(!reviewImagesTable.reviewId){
      options.tableName = 'ReviewImages';
      await queryInterface.addColumn(options, 'reviewId', {
        type: Sequelize.INTEGER,
        references: { model: 'Reviews' }
      });
    // };
    
  },
  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    options.tableName = 'Spots';
    await queryInterface.removeColumn('Spots', 'ownerId');

    options.tableName = 'SpotImages';
    await queryInterface.removeColumn('SpotImages', 'spotId');
    // await queryInterface.removeColumn('SpotImages', 'spotId');

    options.tableName = 'Reviews';
    await queryInterface.removeColumn('Reviews', 'spotId');
    await queryInterface.removeColumn('Reviews', 'userId');
    // await queryInterface.removeColumn('Reviews', 'spotId');
    // await queryInterface.removeColumn('Reviews', 'userId');

    options.tableName = 'ReviewImages';
    await queryInterface.removeColumn('ReviewImages', 'reviewId');
    // await queryInterface.removeColumn('ReviewImages', 'reviewId');
  }
};
