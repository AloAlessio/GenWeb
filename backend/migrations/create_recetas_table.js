// migrations/create_recetas_table.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

async function createRecetasTable() {
    try {
        await sequelize.getQueryInterface().createTable('Recetas', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            citaId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'Cita',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            nombrePaciente: {
                type: DataTypes.STRING,
                allowNull: false
            },
            doctorId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            medicamento: {
                type: DataTypes.STRING,
                allowNull: false
            },
            dosis: {
                type: DataTypes.STRING,
                allowNull: false
            },
            frecuencia: {
                type: DataTypes.STRING,
                allowNull: false
            },
            duracion: {
                type: DataTypes.STRING,
                allowNull: false
            },
            indicaciones: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            fecha: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        });
        
        console.log('Tabla recetas creada exitosamente');
    } catch (error) {
        // Check if table already exists
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('already exists')) {
            console.log('Tabla recetas ya existe');
        } else {
            console.error('Error al crear tabla recetas:', error);
            throw error;
        }
    }
}
    });
}

module.exports = createRecetasTable;