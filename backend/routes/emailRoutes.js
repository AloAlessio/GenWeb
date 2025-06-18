// Archivo de rutas para el manejo de funcionalidades de email
// routes/emailRoutes.js

// Importamos Express para el sistema de rutas
const express = require('express');
// Creamos router para agrupar rutas relacionadas con email
const router = express.Router();
// Importamos funciones del servicio de email
const { enviarEmailReceta, verificarConfiguracion } = require('../services/emailService');

// Ruta GET para verificar la configuración del servicio de email
// GET /api/email/verificar
// Comprueba si las credenciales de email están configuradas correctamente
router.get('/verificar', async (req, res) => {
    try {
        // Llamamos a la función que verifica la configuración de email
        const configurado = await verificarConfiguracion();
        
        // Devolvemos información sobre el estado de la configuración
        res.json({
            configurado,                                    // true/false si está configurado
            proveedor: process.env.EMAIL_SERVICE || 'Gmail', // Proveedor de email
            // Ocultamos parte del email por seguridad mostrando solo primeros 3 caracteres
            usuario: process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/(.{3}).*(@.*)/, '$1***$2') : null
        });
    } catch (error) {
        // Si hay error en la verificación, devolvemos información del error
        res.json({
            configurado: false,
            error: error.message
        });
    }
});

// Ruta POST para enviar un email de prueba
// POST /api/email/prueba
// Permite probar el sistema de email enviando una receta de ejemplo
router.post('/prueba', async (req, res) => {
    try {
        // Extraemos el email de destino del cuerpo de la petición
        const { emailDestino } = req.body;
        
        // Validamos que se proporcionó un email de destino
        if (!emailDestino) {
            return res.status(400).json({
                success: false,
                error: 'Email de destino es requerido'
            });
        }

        // Creamos datos de prueba para simular una receta real
        const datosPrueba = {
            emailPaciente: emailDestino,                          // Email donde enviar la prueba
            nombrePaciente: 'Paciente de Prueba',                 // Nombre ficticio
            nombreDoctor: 'Dr. Sistema GenWeb',                   // Doctor ficticio del sistema            medicamento: 'Medicamento de Prueba',                // Medicamento de ejemplo
            dosis: '1 tableta',                                  // Dosis de ejemplo
            frecuencia: 'Una vez al día',                        // Frecuencia de ejemplo
            duracion: '7 días',                                  // Duración de ejemplo
            indicaciones: 'Este es un email de prueba del sistema GenWeb.', // Indicaciones de prueba
            fechaEmision: new Date().toLocaleDateString('es-ES') // Fecha actual en formato español
        };

        // Intentamos enviar el email de prueba usando el servicio de email
        const resultado = await enviarEmailReceta(datosPrueba);
        
        // Devolvemos el resultado del envío (success: true/false, message, etc.)
        res.json(resultado);
    } catch (error) {
        // Si hay algún error durante el envío, devolvemos error 500
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Exportamos el router para ser usado en server.js
module.exports = router;
