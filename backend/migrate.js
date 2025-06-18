// Script de migración para actualizar la estructura de la base de datos
// Se ejecuta cuando necesitamos agregar nuevos campos o tablas sin perder datos existentes

// Importamos la conexión a la base de datos
const db = require('./db');
// Importamos el modelo Cita para manipular registros existentes
const Cita = require('./models/Cita');
// Importamos la migración para crear la tabla de recetas
const createRecetasTable = require('./migrations/create_recetas_table');

// Función principal de migración asíncrona
async function migrateDatabase() {
    try {
        console.log('Iniciando migración de base de datos...');
        
        // Sincronizar la base de datos con modificaciones (alter: true)
        // alter: true permite modificar tablas existentes agregando nuevos campos
        // sync() crearía nuevas tablas pero podría eliminar datos existentes sin alter
        await db.sync({ alter: true });
        
        // Ejecutar migración específica para crear tabla de recetas
        // Esto ejecuta SQL personalizado para crear la tabla con la estructura exacta necesaria
        await createRecetasTable();
        
        console.log('✅ Migración completada exitosamente');
        
        // Buscar citas existentes que no tienen el campo 'estado' definido
        // Esto puede ocurrir cuando se agrega un nuevo campo a una tabla existente
        const citasSinEstado = await Cita.findAll({
            where: {
                estado: null        // Buscar registros donde estado es NULL
            }
        });
        
        // Si existen citas sin estado definido, las actualizamos
        if (citasSinEstado.length > 0) {
            console.log(`Actualizando ${citasSinEstado.length} citas sin estado...`);
            
            // Actualizar en lote todas las citas que tienen estado NULL
            await Cita.update(
                { estado: 'pendiente' },           // Nuevo valor para el campo estado
                { 
                    where: { 
                        estado: null                // Condición: solo donde estado es NULL
                    } 
                }
            );
            
            console.log('✅ Citas actualizadas con estado "pendiente"');
        }
        
        console.log('✅ Base de datos lista para usar');
        // process.exit(0) termina el script con código de éxito
        process.exit(0);
        
    } catch (error) {
        // Si ocurre algún error durante la migración
        console.error('❌ Error durante la migración:', error);
        // process.exit(1) termina el script con código de error
        process.exit(1);
    }
}

// Ejecutar la función de migración
// Este script se ejecuta con: node migrate.js
migrateDatabase();