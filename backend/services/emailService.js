const nodemailer = require('nodemailer');

// Configuración del transportador de email
const createTransporter = () => {
    return nodemailer.createTransport({
        // Configuración para Gmail (puedes cambiar según tu proveedor)
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'tu-email@gmail.com',
            pass: process.env.EMAIL_PASSWORD || 'tu-app-password'
        }
    });
};

// Función para enviar email de receta médica
const enviarEmailReceta = async (datosReceta) => {
    try {
        const transporter = createTransporter();
        
        const { 
            emailPaciente, 
            nombrePaciente, 
            nombreDoctor, 
            medicamento, 
            dosis, 
            frecuencia, 
            duracion, 
            indicaciones,
            fechaEmision 
        } = datosReceta;

        // Plantilla HTML para el email
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Receta Médica - GenWeb</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .header .subtitle {
                    margin: 10px 0 0 0;
                    font-size: 16px;
                    opacity: 0.9;
                }
                .content {
                    padding: 30px;
                }
                .patient-info {
                    background: #f8f9fa;
                    border-left: 4px solid #28a745;
                    padding: 20px;
                    margin-bottom: 25px;
                    border-radius: 0 8px 8px 0;
                }
                .prescription-details {
                    background: #fff;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    padding: 25px;
                    margin-bottom: 25px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                .detail-label {
                    font-weight: bold;
                    color: #495057;
                    flex: 1;
                }
                .detail-value {
                    flex: 2;
                    color: #212529;
                }
                .medication-highlight {
                    background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
                    border: 2px solid #2196f3;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: center;
                }
                .medication-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1976d2;
                    margin-bottom: 10px;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 25px;
                    text-align: center;
                    border-top: 3px solid #28a745;
                }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #856404;
                }
                .icon {
                    font-size: 20px;
                    margin-right: 8px;
                }                @media (max-width: 600px) {
                    body {
                        padding: 10px;
                    }
                    .container {
                        margin: 0;
                        border-radius: 5px;
                    }
                    .header {
                        padding: 20px;
                    }
                    .header h1 {
                        font-size: 22px;
                    }
                    .header .subtitle {
                        font-size: 14px;
                    }
                    .content {
                        padding: 20px;
                    }
                    .patient-info {
                        padding: 15px;
                        margin-bottom: 20px;
                    }
                    .prescription-details {
                        padding: 20px;
                        margin-bottom: 20px;
                    }
                    .medication-highlight {
                        padding: 15px;
                        margin: 15px 0;
                    }
                    .medication-name {
                        font-size: 20px;
                    }
                    .footer {
                        padding: 20px;
                    }
                    .warning {
                        padding: 12px;
                        margin: 15px 0;
                        font-size: 14px;
                    }
                    .detail-row {
                        flex-direction: column;
                        margin-bottom: 12px;
                        padding-bottom: 8px;
                    }
                    .detail-label {
                        margin-bottom: 5px;
                        font-size: 14px;
                    }
                    .detail-value {
                        font-size: 14px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 GenWeb</h1>
                    <div class="subtitle">Receta Médica Electrónica</div>
                </div>
                
                <div class="content">
                    <div class="patient-info">
                        <h3 style="margin: 0 0 15px 0; color: #28a745;">
                            👤 Información del Paciente
                        </h3>
                        <div class="detail-row">
                            <div class="detail-label">Paciente:</div>
                            <div class="detail-value">${nombrePaciente}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Médico:</div>
                            <div class="detail-value">${nombreDoctor}</div>
                        </div>
                        <div class="detail-row" style="border-bottom: none;">
                            <div class="detail-label">Fecha de emisión:</div>
                            <div class="detail-value">${fechaEmision}</div>
                        </div>
                    </div>

                    <div class="medication-highlight">
                        <div class="medication-name">💊 ${medicamento}</div>
                        <div style="font-size: 18px; color: #666;">Dosis: ${dosis}</div>
                    </div>

                    <div class="prescription-details">
                        <h3 style="margin: 0 0 20px 0; color: #28a745;">
                            📋 Detalles de la Prescripción
                        </h3>
                        <div class="detail-row">
                            <div class="detail-label">💊 Medicamento:</div>
                            <div class="detail-value">${medicamento}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">⚖️ Dosis:</div>
                            <div class="detail-value">${dosis}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">⏰ Frecuencia:</div>
                            <div class="detail-value">${frecuencia}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">📅 Duración:</div>
                            <div class="detail-value">${duracion}</div>
                        </div>
                        ${indicaciones ? `
                        <div class="detail-row" style="border-bottom: none;">
                            <div class="detail-label">📝 Indicaciones:</div>
                            <div class="detail-value">${indicaciones}</div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="warning">
                        <strong>⚠️ Instrucciones Importantes:</strong><br>
                        • Tome el medicamento exactamente como se prescribe<br>
                        • No altere la dosis sin consultar a su médico<br>
                        • Complete el tratamiento aunque se sienta mejor<br>
                        • Consulte a su médico si experimenta efectos secundarios
                    </div>
                </div>

                <div class="footer">
                    <p style="margin: 0; color: #666;">
                        <strong>GenWeb - Sistema de Gestión Médica</strong><br>
                        Esta receta fue generada electrónicamente el ${fechaEmision}<br>
                        Para consultas, contacte a su médico tratante.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Configuración del email
        const mailOptions = {
            from: {
                name: 'GenWeb - Sistema Médico',
                address: process.env.EMAIL_USER || 'noreply@genweb.com'
            },
            to: emailPaciente,
            subject: `🏥 Receta Médica - ${medicamento} | GenWeb`,
            html: htmlTemplate,
            text: `
RECETA MÉDICA - GENWEB

Paciente: ${nombrePaciente}
Médico: ${nombreDoctor}
Fecha: ${fechaEmision}

PRESCRIPCIÓN:
Medicamento: ${medicamento}
Dosis: ${dosis}
Frecuencia: ${frecuencia}
Duración: ${duracion}

${indicaciones ? `Indicaciones especiales: ${indicaciones}` : ''}

INSTRUCCIONES IMPORTANTES:
- Tome el medicamento exactamente como se prescribe
- No altere la dosis sin consultar a su médico
- Complete el tratamiento aunque se sienta mejor
- Consulte a su médico si experimenta efectos secundarios

GenWeb - Sistema de Gestión Médica
            `
        };

        // Enviar el email
        const result = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email de receta enviado exitosamente:', result.messageId);
        return {
            success: true,
            messageId: result.messageId,
            message: 'Email enviado exitosamente'
        };

    } catch (error) {
        console.error('❌ Error al enviar email de receta:', error);
        return {
            success: false,
            error: error.message,
            message: 'Error al enviar el email'
        };
    }
};

// Función para verificar configuración de email
const verificarConfiguracion = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Configuración de email verificada');
        return true;
    } catch (error) {
        console.error('❌ Error en configuración de email:', error.message);
        return false;
    }
};

module.exports = {
    enviarEmailReceta,
    verificarConfiguracion
};
