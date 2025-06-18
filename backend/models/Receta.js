// Comentario identificando el archivo del modelo
// models/Receta.js

// Importamos DataTypes desde Sequelize para definir tipos de datos
const { DataTypes } = require('sequelize');
// Importamos la conexión a la base de datos
const db = require('../db'); // Conexión a la base de datos

// Definimos el modelo Receta para la tabla de recetas médicas
const Receta = db.define('Receta', {
    // Campo ID: identificador único de cada receta
    id: { 
        type: DataTypes.INTEGER,        // Tipo: número entero
        primaryKey: true,               // Es la clave primaria
        autoIncrement: true             // Se incrementa automáticamente
    },
    // Campo citaId: vincula la receta con una cita específica
    citaId: { 
        type: DataTypes.INTEGER,        // Tipo: número entero
        allowNull: false,               // Campo obligatorio
        unique: true                    // Debe ser único (una receta por cita)
        // Esta es una clave foránea que referencia el ID de la cita
        // unique: true garantiza relación 1:1 entre cita y receta
    },
    // Campo nombrePaciente: nombre del paciente que recibe la receta
    nombrePaciente: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
        // Se duplica del modelo Cita para facilitar consultas y reportes
    },
    // Campo doctorId: identificador del doctor que emite la receta
    doctorId: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto (no INTEGER)
        allowNull: false                // Campo obligatorio
        // Se usa STRING para manejar tanto IDs numéricos como nombres de doctores
        // Permite flexibilidad en el mapeo de doctores
    },
    // Campo medicamento: nombre del medicamento recetado
    medicamento: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
        // Almacena el nombre comercial o genérico del medicamento
    },
    // Campo dosis: cantidad y concentración del medicamento
    dosis: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
        // Ejemplos: "500mg", "2 tabletas", "5ml", "1 cápsula"
    },
    // Campo frecuencia: cada cuánto tiempo debe tomarse el medicamento
    frecuencia: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
        // Ejemplos: "cada 8 horas", "2 veces al día", "antes de dormir"
    },
    // Campo duracion: por cuánto tiempo debe tomarse el medicamento
    duracion: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
        // Ejemplos: "7 días", "2 semanas", "1 mes", "hasta terminar"
    },
    // Campo indicaciones: instrucciones adicionales para el paciente
    indicaciones: { 
        type: DataTypes.TEXT,           // Tipo: texto largo
        allowNull: true                 // Campo opcional
        // TEXT permite instrucciones detalladas sin límite de caracteres
        // Ejemplos: "Tomar con alimentos", "No tomar alcohol", "Evitar exposición al sol"
    },
    // Campo fecha: fecha de emisión de la receta
    fecha: { 
        type: DataTypes.DATEONLY,       // Tipo: solo fecha (YYYY-MM-DD)
        allowNull: false                // Campo obligatorio
        // Importante para control médico y validez de la prescripción
    }
});
// Nota: Este modelo no especifica opciones adicionales, por lo que:
// - La tabla se llamará "Recetas" (plural automático)
// - Se crearán automáticamente los campos createdAt y updatedAt
// - Útil para auditoría y seguimiento de cambios en las recetas

// Exportamos el modelo para usar en controladores y rutas
module.exports = Receta;