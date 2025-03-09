const express = require('express');
const router = express.Router();
const { register, login, users } = require('../controllers/authController'); // Se importa correctamente la función users

router.post('/register', register);
router.post('/login', login);
router.get('/users', users); // Ahora la función está correctamente definida

module.exports = router;
