// Archivo de migración para crear la tabla de recetas médicas
// migrations/create_recetas_table.js

// Importamos DataTypes para definir tipos de columnas de la base de datos
const { DataTypes } = require('sequelize');
// Importamos la conexión a la base de datos
const sequelize = require('../db');

// Función asíncrona para crear la tabla 'Recetas' con SQL directo
async function createRecetasTable() {
    try {
        // getQueryInterface() nos da acceso a métodos de manipulación directa de la BD
        // createTable() ejecuta SQL CREATE TABLE con la estructura especificada
        await sequelize.getQueryInterface().createTable('Recetas', {
            // Campo ID: clave primaria auto-incremental
            id: {
                type: DataTypes.INTEGER,        // Número entero
                primaryKey: true,               // Es la clave primaria
                autoIncrement: true,            // Se incrementa automáticamente
                allowNull: false                // No puede ser NULL
            },
            // Campo citaId: referencia a la tabla de citas (relación 1:1)
            citaId: {
                type: DataTypes.INTEGER,        // Número entero
                allowNull: false,               // Campo obligatorio
                unique: true,                   // Único (una receta por cita)
                references: {
                    model: 'Cita',              // Tabla referenciada (nombre del modelo)
                    key: 'id'                   // Campo referenciado en la tabla Cita
                },
                onDelete: 'CASCADE'             // Si se elimina la cita, eliminar también la receta
            },
            // Campo nombrePaciente: nombre del paciente que recibe la receta
            nombrePaciente: {
                type: DataTypes.STRING,         // Cadena de texto
                allowNull: false                // Campo obligatorio
            },
            // Campo doctorId: identificador del doctor que emite la receta
            doctorId: {
                type: DataTypes.STRING,         // Cadena de texto (no INTEGER para flexibilidad)
                allowNull: false                // Campo obligatorio
            },
            // Campo medicamento: nombre del medicamento recetado
            medicamento: {
                type: DataTypes.STRING,         // Cadena de texto
                allowNull: false                // Campo obligatorio
            },
            // Campo dosis: cantidad y concentración del medicamento
            dosis: {
                type: DataTypes.STRING,         // Cadena de texto (ej: "500mg", "2 tabletas")
                allowNull: false                // Campo obligatorio
            },
            // Campo frecuencia: cada cuánto tiempo tomar el medicamento
            frecuencia: {
                type: DataTypes.STRING,         // Cadena de texto (ej: "cada 8 horas")
                allowNull: false                // Campo obligatorio
            },
            // Campo duracion: por cuánto tiempo debe tomarse
            duracion: {
                type: DataTypes.STRING,         // Cadena de texto (ej: "7 días")
                allowNull: false                // Campo obligatorio
            },
            // Campo indicaciones: instrucciones adicionales (opcional)
            indicaciones: {
                type: DataTypes.TEXT,           // Texto largo
                allowNull: true                 // Campo opcional
            },
            // Campo fecha: fecha de emisión de la receta
            fecha: {
                type: DataTypes.DATEONLY,       // Solo fecha (YYYY-MM-DD), sin hora
                allowNull: false                // Campo obligatorio
            },
            // Campos de auditoría automáticos de Sequelize
            // Campo createdAt: fecha y hora de creación del registro
            createdAt: {
                type: DataTypes.DATE,           // Fecha y hora completa
                allowNull: false,               // Campo obligatorio
                defaultValue: DataTypes.NOW     // Valor por defecto: fecha/hora actual
            },
            // Campo updatedAt: fecha y hora de última actualización
            updatedAt: {
                type: DataTypes.DATE,           // Fecha y hora completa
                allowNull: false,               // Campo obligatorio
                defaultValue: DataTypes.NOW     // Valor por defecto: fecha/hora actual
            }
        });
        
        // Si la tabla se crea exitosamente, mostramos mensaje de confirmación
        console.log('Tabla recetas creada exitosamente');
        
    } catch (error) {
        // Manejo específico para el caso donde la tabla ya existe
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('already exists')) {
            console.log('Tabla recetas ya existe');
        } else {
            // Si es otro tipo de error, lo mostramos y lo re-lanzamos
            console.error('Error al crear tabla recetas:', error);
            throw error;
        }
    }
}

// Exportamos la función para que pueda ser usada en otros archivos
module.exports = createRecetasTable;