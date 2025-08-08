// Script para agregar campos de seguridad a la tabla users
const sequelize = require('./db');

async function addSecurityFields() {
    try {
        console.log('Iniciando migración de campos de seguridad...');
        
        // Agregar los campos uno por uno
        await sequelize.query(`
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

        console.log('✅ Campos de seguridad agregados exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

// Ejecutar la migración
addSecurityFields();
