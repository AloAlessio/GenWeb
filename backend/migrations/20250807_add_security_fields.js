const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        try {
            await queryInterface.addColumn('users', 'failedLoginAttempts', {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false
            });

            await queryInterface.addColumn('users', 'isLocked', {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false
            });

            await queryInterface.addColumn('users', 'lockExpiry', {
                type: DataTypes.DATE,
                allowNull: true
            });

            await queryInterface.addColumn('users', 'lastLogin', {
                type: DataTypes.DATE,
                allowNull: true
            });

            await queryInterface.addColumn('users', 'passwordResetToken', {
                type: DataTypes.STRING,
                allowNull: true
            });

            await queryInterface.addColumn('users', 'passwordResetExpiry', {
                type: DataTypes.DATE,
                allowNull: true
            });

            await queryInterface.addColumn('users', 'createdAt', {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            });

            await queryInterface.addColumn('users', 'updatedAt', {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            });

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    },

    down: async (queryInterface) => {
        try {
            await queryInterface.removeColumn('users', 'failedLoginAttempts');
            await queryInterface.removeColumn('users', 'isLocked');
            await queryInterface.removeColumn('users', 'lockExpiry');
            await queryInterface.removeColumn('users', 'lastLogin');
            await queryInterface.removeColumn('users', 'passwordResetToken');
            await queryInterface.removeColumn('users', 'passwordResetExpiry');
            await queryInterface.removeColumn('users', 'createdAt');
            await queryInterface.removeColumn('users', 'updatedAt');
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
};
