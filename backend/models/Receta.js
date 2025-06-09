// models/Receta.js
const { DataTypes } = require('sequelize');
const db = require('../db'); // Conexión a la base de datos

const Receta = db.define('Receta', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    citaId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    nombrePaciente: { type: DataTypes.STRING, allowNull: false },
    doctorId: { type: DataTypes.STRING, allowNull: false },
    medicamento: { type: DataTypes.STRING, allowNull: false },
    dosis: { type: DataTypes.STRING, allowNull: false },
    frecuencia: { type: DataTypes.STRING, allowNull: false },
    duracion: { type: DataTypes.STRING, allowNull: false },
    indicaciones: { type: DataTypes.TEXT, allowNull: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false }
});

module.exports = Receta;