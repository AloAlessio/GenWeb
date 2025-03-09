const { Op } = require('sequelize');
const Doctor = require('../models/Doctor'); // ✅ Asegurar que el modelo Doctor está importado correctamente

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener doctores", error });
    }
};


exports.filterDoctors = async (req, res) => {
    try {
        let { especialidad, modalidad } = req.query;

        const filterOptions = {};

        if (modalidad) {
            if (modalidad.toLowerCase() === "online" || modalidad.toLowerCase() === "en línea") modalidad = "Virtual";
            if (modalidad.toLowerCase() === "presencial") modalidad = "Presencial";
            filterOptions.modalidad = { [Op.like]: modalidad };
        }

        if (especialidad) filterOptions.especialidad = { [Op.like]: `%${especialidad}%` };

        if (Object.keys(filterOptions).length === 0) {
            return res.status(400).json({ message: "Debes proporcionar al menos un filtro (especialidad o modalidad)." });
        }

        const doctors = await Doctor.findAll({ where: filterOptions });

        if (doctors.length === 0) {
            return res.status(404).json({ message: "No se encontraron doctores con los filtros proporcionados" });
        }

        res.json(doctors);
    } catch (error) {
        console.error("Error al filtrar doctores:", error);
        res.status(500).json({ message: "Error al filtrar doctores", error });
    }
};
