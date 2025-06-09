// routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const { enviarEmailReceta, verificarConfiguracion } = require('../services/emailService');

// Ruta para verificar la configuración de email
router.get('/verificar', async (req, res) => {
    try {
        const configurado = await verificarConfiguracion();
        
        res.json({
            configurado,
            proveedor: process.env.EMAIL_SERVICE || 'Gmail',
            usuario: process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/(.{3}).*(@.*)/, '$1***$2') : null
        });
    } catch (error) {
        res.json({
            configurado: false,
            error: error.message
        });
    }
});

// Ruta para enviar email de prueba
router.post('/prueba', async (req, res) => {
    try {
        const { emailDestino } = req.body;
        
        if (!emailDestino) {
            return res.status(400).json({
                success: false,
                error: 'Email de destino es requerido'
            });
        }

        // Datos de prueba para el email
        const datosPrueba = {
            emailPaciente: emailDestino,
            nombrePaciente: 'Paciente de Prueba',
            nombreDoctor: 'Dr. Sistema GenWeb',
            medicamento: 'Medicamento de Prueba',
            dosis: '1 tableta',
            frecuencia: 'Una vez al día',
            duracion: '7 días',
            indicaciones: 'Este es un email de prueba del sistema GenWeb.',
            fechaEmision: new Date().toLocaleDateString('es-ES')
        };

        const resultado = await enviarEmailReceta(datosPrueba);
        
        res.json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
