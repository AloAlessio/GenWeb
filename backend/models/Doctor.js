// Importamos DataTypes desde Sequelize para definir tipos de datos
const { DataTypes } = require('sequelize');
// Importamos la conexión a la base de datos (nota: el comentario indica verificar la ruta)
const sequelize = require('../db'); // Asegúrate de que este sea el camino correcto

// Definimos el modelo Doctor para la tabla de doctores
const Doctor = sequelize.define('Doctor', {
    // Campo nombre: almacena el nombre completo del doctor
    nombre: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo especialidad: almacena la especialidad médica del doctor
    especialidad: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo modalidad: indica si atiende presencial, virtual o ambos
    modalidad: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo telefono: número de contacto del doctor
    telefono: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Campo email: correo electrónico del doctor
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Campo horarios: horarios de atención
    horarios: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Campo experiencia: años de experiencia
    experiencia: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Campo costo: costo de la consulta
    costo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    // Campo imagen: URL o ruta de la foto del doctor
    imagen: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    // Campo activo: indica si el doctor está activo
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});
// Nota: No se especifican opciones adicionales, por lo que:
// - El nombre de la tabla será "Doctors" (plural automático)
// - timestamps será true (creará createdAt y updatedAt automáticamente)
// - El ID se crea automáticamente como clave primaria auto-incremental

// Exportamos el modelo para usar en controladores y otros archivos
module.exports = Doctor;
