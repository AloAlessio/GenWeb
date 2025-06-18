// Importamos Express para el sistema de rutas
const express = require('express');
// Creamos router para agrupar todas las rutas relacionadas con citas
const router = express.Router();
// Importamos el controlador de citas con todas sus funciones
const citaController = require('../controllers/citaController');

// Ruta POST para crear una nueva cita médica
// POST /api/citas
// Recibe datos del paciente, doctor, fecha, hora, etc. en el cuerpo de la petición
router.post('/', citaController.crearCita);

// Ruta GET para obtener todas las citas (con filtros opcionales)
// GET /api/citas
// GET /api/citas?fecha=2025-06-17 (filtrar por fecha)
// GET /api/citas?modalidad=Virtual (filtrar por modalidad)
// Los filtros se envían como query parameters
router.get('/', citaController.getAllCitas);

// Ruta GET para obtener una cita específica por su ID
// GET /api/citas/123 (donde 123 es el ID de la cita)
// :id es un parámetro dinámico que se extrae con req.params.id
router.get('/:id', citaController.getCitaById);

// Ruta PUT para actualizar completamente una cita existente
// PUT /api/citas/123
// PUT se usa para actualizaciones completas del recurso
// Recibe todos los datos de la cita en el cuerpo de la petición
router.put('/:id', citaController.updateCita);

// Ruta PATCH para confirmar una cita (actualización parcial de estado)
// PATCH /api/citas/123/confirmar
// PATCH se usa para actualizaciones parciales
// Cambia solo el campo 'estado' a 'confirmada'
router.patch('/:id/confirmar', citaController.confirmarCita);

// Ruta PATCH para cancelar una cita (actualización parcial de estado)
// PATCH /api/citas/123/cancelar
// Cambia solo el campo 'estado' a 'cancelada'
router.patch('/:id/cancelar', citaController.cancelarCita);

// Ruta DELETE para eliminar permanentemente una cita
// DELETE /api/citas/123
// Elimina completamente el registro de la base de datos
router.delete('/:id', citaController.deleteCita);

// Exportamos el router para usar en server.js
module.exports = router;
