const sequelize = require('./db');

async function addDoctorColumns() {
    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos MySQL');

        // Añadir las columnas una por una
        await sequelize.query(`
            ALTER TABLE Doctors 
            ADD COLUMN IF NOT EXISTS telefono VARCHAR(255),
            ADD COLUMN IF NOT EXISTS email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS horarios JSON,
            ADD COLUMN IF NOT EXISTS experiencia INTEGER,
            ADD COLUMN IF NOT EXISTS costo DECIMAL(10,2),
            ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true
        `);

        console.log('✅ Columnas añadidas correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

addDoctorColumns();
