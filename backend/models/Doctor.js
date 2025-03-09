const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Asegúrate de que este sea el camino correcto

const Doctor = sequelize.define('Doctor', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    especialidad: { type: DataTypes.STRING, allowNull: false },
    modalidad: { type: DataTypes.STRING, allowNull: false },
    imagen: { type: DataTypes.STRING, allowNull: true }
});

module.exports = Doctor;
