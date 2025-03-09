const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

// Crear cita (POST /api/citas)
router.post('/', citaController.crearCita);

// Listar todas las citas (GET /api/citas)
router.get('/', citaController.getAllCitas);

// Obtener una cita por id (GET /api/citas/:id)
router.get('/:id', citaController.getCitaById);

// Actualizar una cita (PUT /api/citas/:id)
router.put('/:id', citaController.updateCita);

// Eliminar una cita (DELETE /api/citas/:id)
router.delete('/:id', citaController.deleteCita);

module.exports = router;
