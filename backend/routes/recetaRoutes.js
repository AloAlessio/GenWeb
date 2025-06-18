// Archivo de rutas para el manejo de recetas médicas
// routes/recetaRoutes.js

// Importamos Express para el sistema de rutas
const express = require('express');
// Importamos todas las funciones del controlador de recetas usando destructuring
// Esto nos permite usar las funciones directamente sin prefijo
const { 
    crearReceta,                    // Función para crear nuevas recetas
    obtenerRecetaPorCita,          // Función para buscar receta por ID de cita
    obtenerRecetaPorId,            // Función para buscar receta por ID único
    obtenerRecetasPorDoctor,       // Función para listar recetas de un doctor
    verificarRecetaExiste,         // Función para verificar existencia de receta
    actualizarReceta,              // Función para modificar recetas existentes
    eliminarReceta                 // Función para eliminar recetas
} = require('../controllers/recetaController');

// Creamos una instancia de Router para agrupar las rutas de recetas
const router = express.Router();

// Ruta POST para crear una nueva receta médica
// POST /api/recetas
// Recibe: citaId, nombrePaciente, doctorId, medicamento, dosis, frecuencia, duracion, indicaciones
// También envía automáticamente un email al paciente con la receta
router.post('/', crearReceta);

// Ruta GET para obtener una receta específica usando el ID de la cita
// GET /api/recetas/cita/123 (donde 123 es el ID de la cita)
// Útil para verificar si una cita ya tiene receta asociada
// Retorna la receta completa o error 404 si no existe
router.get('/cita/:citaId', obtenerRecetaPorCita);

// Ruta GET para obtener una receta por su ID único
// GET /api/recetas/456 (donde 456 es el ID de la receta)
// Esta ruta debe ir DESPUÉS de rutas específicas para evitar conflictos
// :id captura cualquier número que no coincida con rutas anteriores
router.get('/:id', obtenerRecetaPorId);

// Ruta GET para obtener todas las recetas emitidas por un doctor específico
// GET /api/recetas/doctor/Dr.%20Juan%20Perez
// Útil para reportes médicos y seguimiento de prescripciones
// Retorna las recetas ordenadas por fecha de creación (más recientes primero)
router.get('/doctor/:doctorId', obtenerRecetasPorDoctor);

// Ruta GET para verificar si existe una receta para una cita específica
// GET /api/recetas/existe/123 (donde 123 es el ID de la cita)
// Retorna: { existe: true } o { existe: false }
// Útil para validaciones en el frontend antes de crear recetas
router.get('/existe/:citaId', verificarRecetaExiste);

// Ruta PUT para actualizar completamente una receta existente
// PUT /api/recetas/456
// Permite modificar: medicamento, dosis, frecuencia, duracion, indicaciones
// PUT se usa para actualizaciones completas del recurso
router.put('/:id', actualizarReceta);

// Ruta DELETE para eliminar permanentemente una receta
// DELETE /api/recetas/456
// Elimina completamente el registro de la base de datos
// Usar con precaución ya que es una acción irreversible
router.delete('/:id', eliminarReceta);

// Exportamos el router para ser usado en server.js
module.exports = router;