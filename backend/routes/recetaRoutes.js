// routes/recetaRoutes.js
const express = require('express');
const { 
    crearReceta, 
    obtenerRecetaPorCita, 
    obtenerRecetaPorId, 
    obtenerRecetasPorDoctor, 
    verificarRecetaExiste, 
    actualizarReceta, 
    eliminarReceta 
} = require('../controllers/recetaController');

const router = express.Router();

// Crear una nueva receta
router.post('/', crearReceta);

// Obtener receta por ID de cita
router.get('/cita/:citaId', obtenerRecetaPorCita);

// Obtener receta por ID
router.get('/:id', obtenerRecetaPorId);

// Obtener todas las recetas de un doctor
router.get('/doctor/:doctorId', obtenerRecetasPorDoctor);

// Verificar si existe receta para una cita
router.get('/existe/:citaId', verificarRecetaExiste);

// Actualizar una receta
router.put('/:id', actualizarReceta);

// Eliminar una receta
router.delete('/:id', eliminarReceta);

module.exports = router;