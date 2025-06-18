// Importamos DataTypes desde Sequelize para definir tipos de datos
const { DataTypes } = require('sequelize');
// Importamos la conexión a la base de datos (nota: usa 'db' en lugar de 'sequelize')
const db = require('../db'); // Conexión a la base de datos

// Definimos el modelo Cita para la tabla de citas médicas
const Cita = db.define('Cita', {
    // Campo ID: clave primaria de la tabla citas
    id: { 
        type: DataTypes.INTEGER,        // Tipo: número entero
        primaryKey: true,               // Es la clave primaria
        autoIncrement: true             // Se incrementa automáticamente
    },
    // Campo nombre: nombre completo del paciente que solicita la cita
    nombre: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
    },
    // Campo correo: email del paciente para contacto y envío de confirmaciones
    correo: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
        // Se usa para enviar confirmaciones, recordatorios y recetas
    },
    // Campo telefono: número telefónico del paciente
    telefono: { 
        type: DataTypes.STRING,         // Tipo: cadena (no INTEGER para manejar formatos)
        allowNull: false                // Campo obligatorio
        // Se almacena como STRING para manejar códigos de país, espacios, etc.
    },
    // Campo doctorId: referencia al doctor que atenderá la cita
    doctorId: { 
        type: DataTypes.INTEGER,        // Tipo: número entero
        allowNull: false                // Campo obligatorio
        // Es una clave foránea que apunta al ID del doctor
    },
    // Campo especialidad: especialidad médica solicitada en la cita
    especialidad: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
        // Ejemplos: "Cardiología", "Dermatología", "Medicina General"
    },
    // Campo modalidad: tipo de consulta (presencial o virtual)
    modalidad: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
        // Valores: "Presencial" o "Virtual"
    },
    // Campo fecha: fecha en que se realizará la cita
    fecha: { 
        type: DataTypes.DATEONLY,       // Tipo: solo fecha (YYYY-MM-DD), sin hora
        allowNull: false                // Campo obligatorio
        // DATEONLY almacena solo la fecha, no incluye horas/minutos/segundos
    },
    // Campo hora: hora específica de la cita
    hora: { 
        type: DataTypes.TIME,           // Tipo: solo hora (HH:MM:SS)
        allowNull: false                // Campo obligatorio
        // TIME almacena solo la hora, separada de la fecha
    },
    // Campo notas: observaciones adicionales del paciente
    notas: { 
        type: DataTypes.TEXT,           // Tipo: texto largo (más caracteres que STRING)
        allowNull: true                 // Campo opcional
        // TEXT permite almacenar textos largos sin límite de caracteres
    },
    // Campo estado: estado actual de la cita
    estado: { 
        type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada'), // Solo permite estos 3 valores
        allowNull: false,               // Campo obligatorio
        defaultValue: 'pendiente'       // Valor por defecto cuando se crea una cita
        // ENUM restringe los valores posibles, evitando errores de escritura
        // El estado se puede cambiar durante el ciclo de vida de la cita
    }
});

// Exportamos el modelo para usar en controladores
module.exports = Cita;
