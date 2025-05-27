// Archivo para migrar la base de datos y agregar el campo 'estado'
const db = require('./db');
const Cita = require('./models/Cita');

async function migrateDatabase() {
    try {
        console.log('Iniciando migración de base de datos...');
        
        // Sincronizar la base de datos (esto agregará el campo 'estado' si no existe)
        await db.sync({ alter: true });
        
        console.log('✅ Migración completada exitosamente');
        
        // Actualizar citas existentes sin estado a 'pendiente'
        const citasSinEstado = await Cita.findAll({
            where: {
                estado: null
            }
        });
        
        if (citasSinEstado.length > 0) {
            console.log(`Actualizando ${citasSinEstado.length} citas sin estado...`);
            
            await Cita.update(
                { estado: 'pendiente' },
                { 
                    where: { 
                        estado: null 
                    } 
                }
            );
            
            console.log('✅ Citas actualizadas con estado "pendiente"');
        }
        
        console.log('✅ Base de datos lista para usar');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrateDatabase();