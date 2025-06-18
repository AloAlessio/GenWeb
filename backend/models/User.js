// Importamos DataTypes desde Sequelize para definir los tipos de datos de los campos
// DataTypes contiene todos los tipos disponibles: STRING, INTEGER, BOOLEAN, DATE, etc.
const { DataTypes } = require('sequelize');
// Importamos la instancia de conexión a la base de datos configurada en db.js
const sequelize = require('../db');

// Definimos el modelo User usando sequelize.define()
// Primer parámetro: nombre del modelo (User)
// Segundo parámetro: objeto con la definición de los campos de la tabla
// Tercer parámetro: opciones de configuración del modelo
const User = sequelize.define('User', {
    // Campo ID: clave primaria de la tabla users
    id: { 
        type: DataTypes.INTEGER,        // Tipo de dato: número entero
        primaryKey: true,               // Es la clave primaria de la tabla
        autoIncrement: true             // Se incrementa automáticamente con cada nuevo registro
    },
    // Campo nombre: almacena el nombre completo del usuario
    nombre: { 
        type: DataTypes.STRING,         // Tipo de dato: cadena de texto (VARCHAR en MySQL)
        allowNull: false                // No puede ser NULL (campo obligatorio)
    },
    // Campo email: almacena el correo electrónico del usuario
    email: { 
        type: DataTypes.STRING,         // Tipo de dato: cadena de texto
        allowNull: false,               // No puede ser NULL (campo obligatorio)
        unique: true                    // Debe ser único en toda la tabla (no duplicados)
    },
    // Campo password: almacena la contraseña encriptada del usuario
    password: { 
        type: DataTypes.STRING,         // Tipo de dato: cadena de texto
        allowNull: false                // No puede ser NULL (campo obligatorio)
    }
}, {
    // Opciones de configuración del modelo:
    tableName: 'users',                 // Nombre específico de la tabla en la BD (por defecto sería 'Users')
    timestamps: false                   // No crear campos automáticos createdAt y updatedAt
});

// Exportamos el modelo para poder importarlo y usarlo en otros archivos
// Esto permite hacer User.create(), User.findAll(), etc. en controladores
module.exports = User;
