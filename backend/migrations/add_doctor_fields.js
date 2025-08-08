'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Doctors', 'telefono', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Doctors', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Doctors', 'horarios', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    await queryInterface.addColumn('Doctors', 'experiencia', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    
    await queryInterface.addColumn('Doctors', 'costo', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
    
    await queryInterface.addColumn('Doctors', 'activo', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Doctors', 'telefono');
    await queryInterface.removeColumn('Doctors', 'email');
    await queryInterface.removeColumn('Doctors', 'horarios');
    await queryInterface.removeColumn('Doctors', 'experiencia');
    await queryInterface.removeColumn('Doctors', 'costo');
    await queryInterface.removeColumn('Doctors', 'activo');
  }
};
