const { DataTypes } = require('sequelize');
const db = require('../db'); // Conexión a la base de datos

const Cita = db.define('Cita', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    correo: { type: DataTypes.STRING, allowNull: false },
    telefono: { type: DataTypes.STRING, allowNull: false },
    doctorId: { type: DataTypes.INTEGER, allowNull: false },
    especialidad: { type: DataTypes.STRING, allowNull: false },
    modalidad: { type: DataTypes.STRING, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    hora: { type: DataTypes.TIME, allowNull: false },
    notas: { type: DataTypes.TEXT, allowNull: true }
});

module.exports = Cita;
