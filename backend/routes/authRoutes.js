// Importamos Express para crear el router
const express = require('express');
// Creamos una instancia de Router para definir las rutas de este módulo
// Router permite agrupar rutas relacionadas y aplicarles middleware específico
const router = express.Router();
// Importamos las funciones controladoras desde authController
// Destructuring para extraer solo las funciones que necesitamos
const { register, login, users } = require('../controllers/authController'); // Se importa correctamente la función users

// Definimos ruta POST para registro de usuarios
// POST /api/auth/register (el prefijo /api/auth se define en server.js)
// Cuando llegue una petición POST a esta ruta, ejecutará la función register del controlador
router.post('/register', register);

// Definimos ruta POST para inicio de sesión
// POST /api/auth/login
// Maneja la autenticación y generación de tokens JWT
router.post('/login', login);

// Definimos ruta GET para obtener lista de usuarios
// GET /api/auth/users
// Devuelve todos los usuarios registrados (sin contraseñas por seguridad)
router.get('/users', users); // Ahora la función está correctamente definida

// Exportamos el router para que pueda ser usado en server.js
// Esto permite que server.js use: app.use('/api/auth', authRoutes)
module.exports = router;
