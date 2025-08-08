// Importamos nodemailer: biblioteca de Node.js para envío de emails
// Soporta múltiples proveedores: Gmail, Outlook, Yahoo, SMTP personalizado, etc.
const nodemailer = require('nodemailer');

// Función para crear y configurar el transportador de email
// El transportador es el objeto que se encarga de enviar los emails
const createTransporter = () => {
    // nodemailer.createTransporter() crea una instancia de transporte
    console.log('Configurando transportador de email con:', {
        user: process.env.EMAIL_USER,
        // No mostramos la contraseña por seguridad
        hasPassword: !!process.env.EMAIL_PASSWORD
    });

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        debug: true // Habilitar logs de debug
    });
};

// Función principal para enviar emails de recetas médicas a pacientes
// Recibe un objeto con todos los datos necesarios para generar la receta
const enviarEmailReceta = async (datosReceta) => {
    try {
        // Creamos el transportador usando la configuración definida arriba
        const transporter = createTransporter();
        
        // Destructuramos los datos de la receta para facilitar su uso
        // Extraemos cada campo del objeto datosReceta
        const { 
            emailPaciente,          // Email del destinatario (paciente)
            nombrePaciente,         // Nombre completo del paciente
            nombreDoctor,           // Nombre completo del doctor que emite la receta
            medicamento,            // Nombre del medicamento recetado
            dosis,                  // Cantidad y concentración del medicamento
            frecuencia,             // Cada cuánto tiempo tomar el medicamento
            duracion,               // Por cuánto tiempo debe tomarse
            indicaciones,           // Instrucciones adicionales (opcional)
            fechaEmision            // Fecha de emisión de la receta
        } = datosReceta;        // Creamos la plantilla HTML para el email
        // Esta plantilla incluye estilos CSS inline para compatibilidad con clientes de email
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Receta Médica - GenWeb</title>
            <style>
                /* Estilos CSS inline para máxima compatibilidad con clientes de email */
                /* Los clientes de email (Gmail, Outlook) tienen soporte limitado de CSS */
                
                body {
                    font-family: Arial, sans-serif;    /* Fuente segura para emails */
                    line-height: 1.6;                  /* Espaciado entre líneas para legibilidad */
                    color: #333;                       /* Color de texto gris oscuro */
                    background-color: #f4f4f4;        /* Fondo gris claro */
                    margin: 0;                         /* Sin márgenes externos */
                    padding: 20px;                     /* Espaciado interno */
                }
                .container {
                    max-width: 600px;                  /* Ancho máximo recomendado para emails */
                    margin: 0 auto;                    /* Centrar horizontalmente */
                    background: white;                 /* Fondo blanco para el contenido */
                    border-radius: 10px;               /* Bordes redondeados */
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);  /* Sombra sutil */
                    overflow: hidden;                  /* Ocultar contenido que desborde */
                }
                .header {
                    background: linear-gradient(135deg, #28a745, #20c997);  /* Gradiente verde médico */
                    color: white;                      /* Texto blanco */
                    padding: 30px;                     /* Espaciado interno */
                    text-align: center;                /* Texto centrado */
                }
                .header h1 {
                    margin: 0;                         /* Sin márgenes */
                    font-size: 28px;                  /* Tamaño de fuente grande */
                }
                .header .subtitle {
                    margin: 10px 0 0 0;               /* Solo margen superior */
                    font-size: 16px;                  /* Tamaño de fuente mediano */
                    opacity: 0.9;                     /* Ligeramente transparente */
                }
                .content {
                    padding: 30px;                     /* Espaciado interno generoso */
                }
                .patient-info {
                    background: #f8f9fa;              /* Fondo gris muy claro */
                    border-left: 4px solid #28a745;   /* Borde izquierdo verde */
                    padding: 20px;                     /* Espaciado interno */
                    margin-bottom: 25px;               /* Espacio inferior */
                    border-radius: 0 8px 8px 0;       /* Bordes redondeados solo en la derecha */
                }
                .prescription-details {
                    background: #fff;                  /* Fondo blanco */
                    border: 2px solid #e9ecef;        /* Borde gris claro */
                    border-radius: 8px;               /* Bordes redondeados */
                    padding: 25px;                     /* Espaciado interno */
                    margin-bottom: 25px;               /* Espacio inferior */
                }
                .detail-row {
                    display: flex;                     /* Layout flexbox */
                    justify-content: space-between;   /* Distribuir espacio entre elementos */
                    margin-bottom: 15px;               /* Espacio inferior */
                    padding-bottom: 10px;              /* Espaciado inferior */
                    border-bottom: 1px solid #eee;    /* Línea separadora sutil */
                }
                .detail-label {
                    font-weight: bold;                 /* Texto en negrita */
                    color: #495057;                    /* Color gris oscuro */
                    flex: 1;                          /* Tomar espacio disponible */
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
        `;        // Configuración del email que se va a enviar
        const mailOptions = {
            // Configuración del remitente (quien envía el email)
            from: {
                name: 'GenWeb - Sistema Médico',                      // Nombre que aparece como remitente
                address: process.env.EMAIL_USER || 'noreply@genweb.com'  // Email del remitente
            },
            to: emailPaciente,                                        // Email del destinatario (paciente)
            subject: `🏥 Receta Médica - ${medicamento} | GenWeb`,    // Asunto del email con emoji y medicamento
            html: htmlTemplate,                                       // Contenido HTML del email (plantilla creada arriba)
            text: `                                                   /* Versión de texto plano como alternativa */
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

        // Enviamos el email usando el transportador configurado
        // sendMail() es asíncrono y retorna información sobre el envío
        const result = await transporter.sendMail(mailOptions);
        
        // Registramos el éxito en la consola para debugging
        console.log('✅ Email de receta enviado exitosamente:', result.messageId);
        
        // Retornamos objeto con información de éxito
        return {
            success: true,                              // Indica que el envío fue exitoso
            messageId: result.messageId,                // ID único del mensaje (útil para rastreo)
            message: 'Email enviado exitosamente'       // Mensaje descriptivo
        };

    } catch (error) {
        // Log detallado del error
        console.error('❌ Error detallado al enviar email:', {
            mensaje: error.message,
            codigo: error.code,
            respuesta: error.response,
            comando: error.command,
            credenciales: {
                usuario: process.env.EMAIL_USER,
                tienePassword: !!process.env.EMAIL_PASSWORD
            }
        });
        
        // Retornamos objeto con información del error
        return {
            success: false,
            error: error.message,
            details: {
                code: error.code,
                response: error.response
            },
            message: 'Error al enviar el email. Por favor, verifica la configuración del servidor de correo.'
        };
    }
};

// Función para verificar que la configuración de email está correcta
// Esta función es útil para diagnóstico y testing del servicio
const verificarConfiguracion = async () => {
    try {
        // Creamos un transportador con la configuración actual
        const transporter = createTransporter();
        
        // verify() comprueba la conectividad con el servidor de email
        // Verifica credenciales y configuración sin enviar emails
        await transporter.verify();
        
        // Si llegamos aquí, la configuración es correcta
        console.log('✅ Configuración de email verificada');
        return true;    // Retorna true si la configuración es válida
        
    } catch (error) {
        // Si hay algún problema con la configuración
        console.error('❌ Error en configuración de email:', error.message);
        return false;   // Retorna false si hay problemas de configuración
    }
};

// Exportamos las funciones para que puedan ser usadas en otros archivos
// module.exports permite que otros archivos importen estas funciones
module.exports = {
    enviarEmailReceta,          // Función principal para enviar emails de recetas
    verificarConfiguracion      // Función para verificar configuración de email
};
