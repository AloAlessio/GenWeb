const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController'); // ✅ Asegurar que esta línea esté presente

router.get('/', doctorController.getAllDoctors);
router.get('/filter', doctorController.filterDoctors); // ✅ Asegurar que esta línea esté bien escrita

module.exports = router;
