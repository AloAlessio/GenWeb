const { Op } = require('sequelize');
const Doctor = require('../models/Doctor');

// Obtener todos los doctores
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            order: [['nombre', 'ASC']]
        });

        res.json({
            message: "Doctores obtenidos exitosamente",
            doctors: doctors
        });
    } catch (error) {
        console.error("Error al obtener doctores:", error);
        res.status(500).json({ 
            message: "Error interno del servidor al obtener doctores"
        });
    }
};

// Filtrar doctores por especialidad y/o modalidad
exports.filterDoctors = async (req, res) => {
    try {
        const { especialidad, modalidad } = req.query;
        const filterOptions = {};

        // Aplicar filtro de modalidad si está presente
        if (modalidad) {
            filterOptions.modalidad = modalidad;
        }

        // Aplicar filtro de especialidad si está presente
        if (especialidad) {
            filterOptions.especialidad = especialidad;
        }

        // Ejecutar la consulta con los filtros
        const doctors = await Doctor.findAll({
            where: filterOptions,
            order: [['nombre', 'ASC']]
        });

        res.json({
            message: "Doctores filtrados exitosamente",
            total: doctors.length,
            doctors: doctors
        });

    } catch (error) {
        console.error("Error al filtrar doctores:", error);
        res.status(500).json({ 
            message: "Error interno del servidor al filtrar doctores",
            error: error.message
        });
    }
};
