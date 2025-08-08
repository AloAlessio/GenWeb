// Script para agregar campos de seguridad faltantes a la tabla users
const sequelize = require('./db');

async function addMissingFields() {
    try {
        console.log('Verificando campos existentes...');
        
        // Obtener la lista de columnas existentes
        const [columns] = await sequelize.query(`
            SHOW COLUMNS FROM users;
        `);
        
        const existingColumns = columns.map(col => col.Field);
        console.log('Columnas existentes:', existingColumns);

        // Lista de campos a agregar con sus definiciones
        const fields = {
            failedLoginAttempts: 'INT DEFAULT 0',
            isLocked: 'BOOLEAN DEFAULT false',
            lockExpiry: 'DATETIME NULL',
            lastLogin: 'DATETIME NULL',
            passwordResetToken: 'VARCHAR(255) NULL',
            passwordResetExpiry: 'DATETIME NULL',
            createdAt: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
            updatedAt: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        };

        // Agregar solo los campos que faltan
        for (const [field, definition] of Object.entries(fields)) {
            if (!existingColumns.includes(field)) {
                console.log(`Agregando campo: ${field}`);
                await sequelize.query(`
                    ALTER TABLE users
                    ADD COLUMN ${field} ${definition};
                `);
            }
        }

        console.log('✅ Campos faltantes agregados exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

// Ejecutar la migración
addMissingFields();
