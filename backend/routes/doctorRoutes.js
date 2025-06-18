// Importamos Express para crear el sistema de rutas
const express = require('express');
// Creamos una instancia de Router para manejar las rutas de doctores
const router = express.Router();
// Importamos el controlador completo de doctores
// Esto nos da acceso a todas las funciones: getAllDoctors, filterDoctors, etc.
const doctorController = require('../controllers/doctorController'); // ✅ Asegurar que esta línea esté presente

// Ruta GET para obtener todos los doctores
// GET /api/doctors/ (el prefijo /api/doctors se define en server.js)
// Esta ruta devuelve la lista completa de doctores sin filtros
router.get('/', doctorController.getAllDoctors);

// Ruta GET para filtrar doctores por especialidad y/o modalidad
// GET /api/doctors/filter?especialidad=cardiologia&modalidad=virtual
// Los parámetros se envían como query parameters en la URL
// Esta ruta debe ir ANTES de rutas con parámetros dinámicos para evitar conflictos
router.get('/filter', doctorController.filterDoctors); // ✅ Asegurar que esta línea esté bien escrita

// Exportamos el router para ser usado en server.js
module.exports = router;
