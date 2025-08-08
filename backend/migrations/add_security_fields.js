// Migración para agregar campos de seguridad a la tabla users
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
            ALTER TABLE users
            ADD COLUMN failedLoginAttempts INT DEFAULT 0,
            ADD COLUMN isLocked BOOLEAN DEFAULT false,
            ADD COLUMN lockExpiry DATETIME NULL,
            ADD COLUMN lastLogin DATETIME NULL,
            ADD COLUMN passwordResetToken VARCHAR(255) NULL,
            ADD COLUMN passwordResetExpiry DATETIME NULL,
            ADD COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
        `);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
            ALTER TABLE users
            DROP COLUMN failedLoginAttempts,
            DROP COLUMN isLocked,
            DROP COLUMN lockExpiry,
            DROP COLUMN lastLogin,
            DROP COLUMN passwordResetToken,
            DROP COLUMN passwordResetExpiry,
            DROP COLUMN createdAt,
            DROP COLUMN updatedAt;
        `);
    }
};
