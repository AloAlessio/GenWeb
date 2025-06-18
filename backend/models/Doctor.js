// Importamos DataTypes desde Sequelize para definir tipos de datos
const { DataTypes } = require('sequelize');
// Importamos la conexión a la base de datos (nota: el comentario indica verificar la ruta)
const sequelize = require('../db'); // Asegúrate de que este sea el camino correcto

// Definimos el modelo Doctor para la tabla de doctores
const Doctor = sequelize.define('Doctor', {
    // Campo nombre: almacena el nombre completo del doctor
    nombre: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto (VARCHAR)
        allowNull: false                // Campo obligatorio (no puede ser NULL)
    },
    // Campo especialidad: almacena la especialidad médica del doctor
    especialidad: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
    },
    // Campo modalidad: indica si atiende presencial, virtual o ambos
    modalidad: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto
        allowNull: false                // Campo obligatorio
        // Valores esperados: "Presencial", "Virtual", "Ambos"
    },
    // Campo imagen: URL o ruta de la foto del doctor
    imagen: { 
        type: DataTypes.STRING,         // Tipo: cadena de texto para almacenar URL
        allowNull: true                 // Campo opcional (puede ser NULL)
        // Almacena rutas como: "doc1.png", "images/doctor.jpg", etc.
    }
});
// Nota: No se especifican opciones adicionales, por lo que:
// - El nombre de la tabla será "Doctors" (plural automático)
// - timestamps será true (creará createdAt y updatedAt automáticamente)
// - El ID se crea automáticamente como clave primaria auto-incremental

// Exportamos el modelo para usar en controladores y otros archivos
module.exports = Doctor;
