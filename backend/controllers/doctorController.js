// Importamos Op (operadores) de Sequelize para hacer consultas avanzadas con LIKE, IN, etc.
const { Op } = require('sequelize');
// Importamos el modelo Doctor para interactuar con la tabla de doctores
const Doctor = require('../models/Doctor'); // ✅ Asegurar que el modelo Doctor está importado correctamente

// Función para obtener todos los doctores de la base de datos
exports.getAllDoctors = async (req, res) => {
    try {
        // findAll() obtiene todos los registros de la tabla doctors
        const doctors = await Doctor.findAll();
        // Devolvemos todos los doctores en formato JSON
        res.json(doctors);
    } catch (error) {
        // Si hay algún error, devolvemos status 500 con el mensaje de error
        res.status(500).json({ message: "Error al obtener doctores", error });
    }
};

// Función para filtrar doctores por especialidad y/o modalidad
exports.filterDoctors = async (req, res) => {
    try {
        // Extraemos los parámetros de consulta de la URL (query parameters)
        // Ejemplo: /api/doctors/filter?especialidad=cardiologia&modalidad=virtual
        let { especialidad, modalidad } = req.query;

        // Creamos un objeto vacío para almacenar las condiciones de filtrado
        const filterOptions = {};

        // Procesamos el filtro de modalidad si viene en la petición
        if (modalidad) {
            // Normalizamos diferentes formas de escribir "virtual"
            if (modalidad.toLowerCase() === "online" || modalidad.toLowerCase() === "en línea") modalidad = "Virtual";
            // Normalizamos "presencial"
            if (modalidad.toLowerCase() === "presencial") modalidad = "Presencial";
            // Op.like permite búsquedas similares (como LIKE en SQL)
            filterOptions.modalidad = { [Op.like]: modalidad };
        }

        // Procesamos el filtro de especialidad si viene en la petición
        if (especialidad) {
            // %especialidad% busca cualquier texto que contenga la especialidad
            // Los % son wildcards que significan "cualquier texto antes y después"
            filterOptions.especialidad = { [Op.like]: `%${especialidad}%` };
        }

        // Validamos que al menos haya un filtro, sino devolvemos error
        if (Object.keys(filterOptions).length === 0) {
            return res.status(400).json({ message: "Debes proporcionar al menos un filtro (especialidad o modalidad)." });
        }

        // Buscamos doctores que cumplan con los filtros especificados
        // where: filterOptions aplica todas las condiciones de filtrado
        const doctors = await Doctor.findAll({ where: filterOptions });

        // Si no se encontraron doctores, devolvemos error 404
        if (doctors.length === 0) {
            return res.status(404).json({ message: "No se encontraron doctores con los filtros proporcionados" });
        }

        // Devolvemos los doctores encontrados
        res.json(doctors);
    } catch (error) {
        // Registramos el error en la consola para debugging
        console.error("Error al filtrar doctores:", error);
        // Devolvemos error 500 al cliente
        res.status(500).json({ message: "Error al filtrar doctores", error });
    }
};
