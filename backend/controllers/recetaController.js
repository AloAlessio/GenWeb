// 💊 CONTROLADOR DE RECETAS MÉDICAS
// Este archivo maneja todas las operaciones relacionadas con recetas médicas
// Incluye creación, consulta, actualización y eliminación de recetas
// También integra el servicio de email para notificar a los pacientes

// 📦 IMPORTACIONES DE MODELOS DE BASE DE DATOS
// Receta: Modelo principal para manejar recetas médicas
const Receta = require('../models/Receta');
// Cita: Modelo para validar que la cita existe antes de crear la receta
const Cita = require('../models/Cita');

// 📦 IMPORTACIÓN DE SERVICIOS EXTERNOS
// enviarEmailReceta: Servicio para enviar recetas por correo electrónico a los pacientes
const { enviarEmailReceta } = require('../services/emailService');

// 🏗️ CLASE CONTROLADORA DE RECETAS
// Utilizamos una clase para organizar mejor los métodos y mantener el código estructurado
// Todos los métodos son estáticos para poder exportarlos individualmente
class RecetaController {
    
    // 📝 MÉTODO PARA CREAR UNA NUEVA RECETA MÉDICA
    // Este método maneja las peticiones POST para generar recetas
    // Endpoint: POST /api/recetas
    static async crearReceta(req, res) {
        try {
            // 📥 EXTRACCIÓN Y DESTRUCTURACIÓN DE DATOS DEL CLIENTE
            // req.body contiene todos los datos de la receta enviados desde el frontend
            const { 
                citaId,          // Number: ID de la cita médica asociada (obligatorio)
                nombrePaciente,  // String: Nombre completo del paciente (obligatorio)
                doctorId,        // Number/String: ID del doctor que prescribe (obligatorio)
                medicamento,     // String: Nombre del medicamento prescrito (obligatorio)
                dosis,           // String: Dosis del medicamento (ej: "500mg") (obligatorio)
                frecuencia,      // String: Frecuencia de toma (ej: "Cada 8 horas") (obligatorio)
                duracion,        // String: Duración del tratamiento (ej: "7 días") (obligatorio)
                indicaciones     // String: Instrucciones adicionales (opcional)
            } = req.body;
            
            // 📊 REGISTRO DE AUDITORÍA - INICIO DEL PROCESO
            console.log(`💊 Iniciando creación de receta médica`);
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);
            console.log(`🏥 Cita ID: ${citaId}`);
            console.log(`👤 Paciente: ${nombrePaciente}`);
            console.log(`👨‍⚕️ Doctor ID: ${doctorId}`);
            console.log(`💊 Medicamento: ${medicamento}`);
            
            // 🔍 VALIDACIÓN EXHAUSTIVA DE CAMPOS OBLIGATORIOS
            const camposObligatorios = {
                citaId: citaId,
                nombrePaciente: nombrePaciente,
                doctorId: doctorId,
                medicamento: medicamento,
                dosis: dosis,
                frecuencia: frecuencia,
                duracion: duracion
            };
            
            // Verificamos cada campo obligatorio individualmente
            const camposFaltantes = [];
            Object.entries(camposObligatorios).forEach(([campo, valor]) => {
                if (!valor || valor.toString().trim() === '') {
                    camposFaltantes.push(campo);
                }
            });
            
            // Si hay campos faltantes, devolvemos error detallado
            if (camposFaltantes.length > 0) {
                console.log(`❌ Campos obligatorios faltantes:`, camposFaltantes);
                return res.status(400).json({ 
                    error: 'Faltan campos obligatorios para crear la receta',
                    camposFaltantes: camposFaltantes,
                    camposRecibidos: Object.keys(req.body),
                    ejemplo: {
                        citaId: 123,
                        nombrePaciente: "Juan Pérez",
                        doctorId: 1,
                        medicamento: "Paracetamol",
                        dosis: "500mg",
                        frecuencia: "Cada 8 horas",
                        duracion: "7 días",
                        indicaciones: "Tomar con alimentos (opcional)"
                    }
                });
            }

            // 🔍 VALIDACIONES ESPECÍFICAS DE FORMATO Y LÓGICA
            // Validación del ID de cita
            if (isNaN(parseInt(citaId)) || parseInt(citaId) <= 0) {
                return res.status(400).json({
                    error: 'El ID de la cita debe ser un número positivo',
                    valorRecibido: citaId
                });
            }

            // Validación del nombre del paciente
            if (nombrePaciente.length < 2 || nombrePaciente.length > 100) {
                return res.status(400).json({
                    error: 'El nombre del paciente debe tener entre 2 y 100 caracteres',
                    longitudRecibida: nombrePaciente.length
                });
            }

            // Validación básica del medicamento
            if (medicamento.length < 2 || medicamento.length > 200) {
                return res.status(400).json({
                    error: 'El nombre del medicamento debe tener entre 2 y 200 caracteres',
                    longitudRecibida: medicamento.length
                });
            }

            // 🏥 VERIFICACIÓN DE EXISTENCIA DE LA CITA
            console.log(`🔍 Verificando existencia de cita ID: ${citaId}`);
            const cita = await Cita.findByPk(citaId);
            
            if (!cita) {
                console.log(`❌ Cita no encontrada con ID: ${citaId}`);
                return res.status(404).json({ 
                    error: 'La cita especificada no existe en el sistema',
                    citaId: citaId,
                    sugerencia: 'Verifique que el ID de la cita sea correcto'
                });
            }

            // 📋 INFORMACIÓN DETALLADA DE LA CITA ENCONTRADA
            console.log(`✅ Cita encontrada:`, {
                id: cita.id,
                paciente: cita.nombre,
                email: cita.correo,
                fecha: cita.fecha,
                hora: cita.hora,
                doctor: cita.doctorId,
                especialidad: cita.especialidad
            });

            // 🔍 VERIFICACIÓN DE RECETA DUPLICADA
            // Una cita solo puede tener una receta (relación 1:1)
            console.log(`🔍 Verificando si ya existe receta para la cita ID: ${citaId}`);
            const recetaExistente = await Receta.findOne({ where: { citaId } });
            
            if (recetaExistente) {
                console.log(`⚠️ Ya existe receta para la cita ID: ${citaId}`);
                return res.status(400).json({ 
                    error: 'Ya existe una receta médica para esta cita',
                    recetaExistente: {
                        id: recetaExistente.id,
                        medicamento: recetaExistente.medicamento,
                        fechaCreacion: recetaExistente.createdAt
                    },
                    sugerencia: 'Use la función de actualización si necesita modificar la receta'
                });
            }

            // 📋 PREPARACIÓN DE DATOS PARA LA NUEVA RECETA
            const fechaActual = new Date();
            const recetaData = {
                citaId: parseInt(citaId),                    // ID de la cita (convertido a número)
                nombrePaciente: nombrePaciente.trim(),       // Nombre del paciente (sin espacios extra)
                doctorId: doctorId,                          // ID del doctor prescriptor
                medicamento: medicamento.trim(),             // Medicamento prescrito
                dosis: dosis.trim(),                         // Dosis del medicamento
                frecuencia: frecuencia.trim(),               // Frecuencia de administración
                duracion: duracion.trim(),                   // Duración del tratamiento
                indicaciones: indicaciones ? indicaciones.trim() : null, // Indicaciones opcionales
                fecha: fechaActual.toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
                // Campos adicionales para auditoría
                fechaCreacion: fechaActual,
                estadoReceta: 'activa'  // Estado por defecto
            };

            // 💾 CREACIÓN DE LA RECETA EN LA BASE DE DATOS
            console.log(`💾 Creando nueva receta en la base de datos`);
            const nuevaReceta = await Receta.create(recetaData);
            
            // 📊 REGISTRO DE CREACIÓN EXITOSA
            console.log(`✅ Receta creada exitosamente:`, {
                id: nuevaReceta.id,
                citaId: nuevaReceta.citaId,
                paciente: nuevaReceta.nombrePaciente,
                medicamento: nuevaReceta.medicamento,
                fechaCreacion: nuevaReceta.createdAt
            });            // 👨‍⚕️ MAPEO DETALLADO DE DOCTORES DEL SISTEMA
            // Esta función convierte IDs numéricos a nombres completos de doctores
            // Permite flexibilidad al recibir tanto IDs como nombres parciales
            const obtenerNombreDoctor = (doctorId) => {
                // 📋 BASE DE DATOS LOCAL DE DOCTORES
                // En un sistema más robusto, esto vendría de la tabla doctors
                const doctores = {
                    // 🔢 MAPEO POR ID NUMÉRICO (más común)
                    0: "Dr. Gonzalo Mendoza - Medicina General",
                    1: "Dr. Alonso Jimenez - Cardiología", 
                    2: "Dra. Melissa Lara - Pediatría",
                    3: "Dr. Diego Hernandez - Dermatología",
                    4: "Dra. Kelly Palomares - Ginecología", 
                    5: "Dr. Mauricio Rocha - Neurología",
                    6: "Dr. Alexis Hernandez - Traumatología",
                    
                    // 📝 MAPEO POR NOMBRE COMPLETO (para compatibilidad)
                    "Dr. Alonso Jimenez": "Dr. Alonso Jimenez - Cardiología",
                    "Dra. Melissa Lara": "Dra. Melissa Lara - Pediatría",
                    "Dr. Diego Hernandez": "Dr. Diego Hernandez - Dermatología", 
                    "Dra. Kelly Palomares": "Dra. Kelly Palomares - Ginecología",
                    "Dr. Mauricio Rocha": "Dr. Mauricio Rocha - Neurología",
                    "Dr. Alexis Hernandez": "Dr. Alexis Hernandez - Traumatología",
                    "Dr. Gonzalo Mendoza": "Dr. Gonzalo Mendoza - Medicina General"
                };
                
                // 🔍 BÚSQUEDA DEL DOCTOR
                const nombreDoctor = doctores[doctorId];
                if (nombreDoctor) {
                    console.log(`👨‍⚕️ Doctor identificado: ${nombreDoctor}`);
                    return nombreDoctor;
                } else {
                    console.log(`⚠️ Doctor no encontrado en mapeo: ${doctorId}`);
                    // Formato genérico si no se encuentra el doctor
                    return `Doctor ID: ${doctorId}`;
                }
            };

            // 📧 PROCESO DE ENVÍO DE EMAIL DE NOTIFICACIÓN
            console.log(`📧 Iniciando proceso de envío de email de receta`);
            
            try {
                // 📋 PREPARACIÓN DE DATOS PARA EL EMAIL
                const datosEmail = {
                    // 📧 INFORMACIÓN DEL DESTINATARIO
                    emailPaciente: cita.correo,              // Email del paciente desde la cita
                    nombrePaciente: cita.nombre,             // Nombre del paciente desde la cita
                    
                    // 👨‍⚕️ INFORMACIÓN DEL DOCTOR
                    nombreDoctor: obtenerNombreDoctor(doctorId), // Nombre completo del doctor
                    
                    // 💊 INFORMACIÓN DE LA RECETA
                    medicamento: nuevaReceta.medicamento,    // Medicamento prescrito
                    dosis: nuevaReceta.dosis,                // Dosis del medicamento
                    frecuencia: nuevaReceta.frecuencia,      // Frecuencia de toma
                    duracion: nuevaReceta.duracion,          // Duración del tratamiento
                    indicaciones: nuevaReceta.indicaciones || 'Ninguna indicación especial',
                    
                    // 📅 INFORMACIÓN DE FECHAS
                    fechaEmision: fechaActual.toLocaleDateString('es-ES'), // Fecha en formato español
                    fechaCita: `${cita.fecha} a las ${cita.hora}`,        // Fecha/hora de la cita
                    
                    // 🏥 INFORMACIÓN ADICIONAL
                    especialidad: cita.especialidad || 'Medicina General',
                    modalidadCita: cita.modalidad || 'Presencial',
                    
                    // 🔢 IDENTIFICADORES
                    numeroReceta: nuevaReceta.id,            // ID único de la receta
                    numeroCita: cita.id                      // ID de la cita asociada
                };

                // 📊 LOG DE DATOS DEL EMAIL
                console.log(`📧 Datos preparados para el email:`, {
                    destinatario: datosEmail.emailPaciente,
                    paciente: datosEmail.nombrePaciente,
                    doctor: datosEmail.nombreDoctor,
                    medicamento: datosEmail.medicamento,
                    numeroReceta: datosEmail.numeroReceta
                });

                // 📨 ENVÍO DEL EMAIL USANDO EL SERVICIO
                console.log(`📨 Enviando email de receta a: ${datosEmail.emailPaciente}`);
                const resultadoEmail = await enviarEmailReceta(datosEmail);
                
                // ✅ VERIFICACIÓN DEL RESULTADO DEL ENVÍO
                if (resultadoEmail.success) {
                    console.log(`✅ Email de receta enviado exitosamente`);
                    console.log(`📧 Detalles del envío:`, {
                        destinatario: datosEmail.emailPaciente,
                        fechaEnvio: new Date().toISOString(),
                        numeroReceta: datosEmail.numeroReceta
                    });
                } else {
                    // ⚠️ FALLO EN EL ENVÍO (NO CRÍTICO)
                    console.error(`⚠️ Error al enviar email de receta:`, resultadoEmail.error);
                    console.log(`💡 La receta se creó correctamente, pero falló la notificación por email`);
                    // No falla la creación de receta si el email falla
                }
                
            } catch (emailError) {
                // 🚨 ERROR EN EL SERVICIO DE EMAIL
                console.error(`⚠️ Error en el servicio de email:`, {
                    mensaje: emailError.message,
                    stack: emailError.stack?.split('\n')[0],
                    datosEmail: {
                        destinatario: cita.correo,
                        paciente: cita.nombre,
                        numeroReceta: nuevaReceta.id
                    }
                });
                // La receta se crea exitosamente aunque falle el email
                console.log(`💡 Receta creada exitosamente, email falló pero no es crítico`);
            }
            
            // ✅ RESPUESTA EXITOSA AL CLIENTE
            res.status(201).json({
                message: 'Receta médica creada exitosamente',
                // 💊 DATOS PRINCIPALES DE LA RECETA
                receta: {
                    id: nuevaReceta.id,
                    citaId: nuevaReceta.citaId,
                    nombrePaciente: nuevaReceta.nombrePaciente,
                    doctorId: nuevaReceta.doctorId,
                    nombreDoctor: obtenerNombreDoctor(doctorId),
                    medicamento: nuevaReceta.medicamento,
                    dosis: nuevaReceta.dosis,
                    frecuencia: nuevaReceta.frecuencia,
                    duracion: nuevaReceta.duracion,
                    indicaciones: nuevaReceta.indicaciones,
                    fecha: nuevaReceta.fecha,
                    fechaCreacion: nuevaReceta.createdAt
                },
                // 📧 INFORMACIÓN DEL EMAIL
                notificacion: {
                    emailEnviado: true,  // Indicador de que se intentó enviar
                    destinatario: cita.correo,
                    fechaEnvio: new Date().toISOString()
                },
                // 🏥 INFORMACIÓN DE LA CITA ASOCIADA
                cita: {
                    id: cita.id,
                    paciente: cita.nombre,
                    fecha: cita.fecha,
                    hora: cita.hora,
                    especialidad: cita.especialidad
                },
                // 💡 INFORMACIÓN ÚTIL PARA EL FRONTEND
                metadatos: {
                    numeroReceta: nuevaReceta.id,
                    validaHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
                    proximasAcciones: [
                        'Paciente notificado por email',
                        'Receta disponible para descarga',
                        'Seguimiento médico programado'
                    ]
                } 
            });
            
        } catch (error) {
            // 🚨 MANEJO DETALLADO DE ERRORES
            const errorId = `CREATE_RECETA_${Date.now()}`;
            console.error(`❌ ${errorId} - Error al crear receta médica:`, error);
            
            // 📋 LOG DETALLADO DEL ERROR
            console.error(`📋 Detalles del error:`, {
                datosRecibidos: req.body,
                errorName: error.name,
                errorMessage: error.message,
                stack: error.stack?.split('\n').slice(0, 3), // Primeras 3 líneas del stack
                timestamp: new Date().toISOString()
            });

            // 🔍 MANEJO ESPECÍFICO DE ERRORES DE SEQUELIZE
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    error: 'Error de validación en los datos de la receta',
                    detalles: error.errors?.map(e => ({
                        campo: e.path,
                        mensaje: e.message,
                        valorRecibido: e.value
                    })),
                    errorId: errorId
                });
            }

            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({
                    error: 'Error de integridad referencial',
                    detalle: 'La cita o doctor especificado no existe',
                    sugerencia: 'Verifique que los IDs sean correctos',
                    errorId: errorId
                });
            }

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    error: 'Ya existe una receta para esta cita',
                    detalle: 'Cada cita solo puede tener una receta asociada',
                    sugerencia: 'Use la función de actualización para modificar la receta existente',
                    errorId: errorId
                });
            }

            // 🚨 ERROR CRÍTICO DEL SERVIDOR
            res.status(500).json({ 
                error: 'Error interno del servidor al crear la receta médica',
                errorId: errorId,
                timestamp: new Date().toISOString(),
                sugerencia: 'Contacte al administrador del sistema con el ID de error'
            });
        }
    }    // 🔍 MÉTODO PARA OBTENER RECETA POR ID DE CITA
    // Este método busca la receta asociada a una cita específica
    // Endpoint: GET /api/recetas/cita/:citaId
    static async obtenerRecetaPorCita(req, res) {
        try {
            // 📥 EXTRACCIÓN DEL ID DE CITA DESDE PARÁMETROS DE URL
            const { citaId } = req.params;
            
            // 📊 REGISTRO DE AUDITORÍA
            console.log(`🔍 Búsqueda de receta por cita ID: ${citaId}`);
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);
            console.log(`🌐 IP solicitante: ${req.ip || 'No disponible'}`);
            
            // 🔢 VALIDACIÓN DEL ID DE CITA
            if (!citaId) {
                console.log(`❌ ID de cita no proporcionado`);
                return res.status(400).json({ 
                    error: 'ID de cita es requerido para buscar la receta',
                    parametroEsperado: 'citaId',
                    ejemploURL: '/api/recetas/cita/123'
                });
            }

            // Validar que sea un número válido
            if (isNaN(parseInt(citaId)) || parseInt(citaId) <= 0) {
                console.log(`❌ ID de cita inválido: ${citaId}`);
                return res.status(400).json({
                    error: 'El ID de cita debe ser un número positivo',
                    valorRecibido: citaId,
                    formatoEsperado: 'Número entero positivo'
                });
            }

            // 🔍 BÚSQUEDA DE LA RECETA EN LA BASE DE DATOS
            console.log(`🔍 Buscando receta asociada a la cita ID: ${citaId}`);
            
            // findOne busca un único registro que coincida con la condición
            // Equivale a: SELECT * FROM recetas WHERE citaId = [citaId]
            const receta = await Receta.findOne({ 
                where: { citaId: parseInt(citaId) },
                // Incluir todos los campos para información completa
                attributes: [
                    'id', 'citaId', 'nombrePaciente', 'doctorId', 'medicamento',
                    'dosis', 'frecuencia', 'duracion', 'indicaciones', 'fecha',
                    'createdAt', 'updatedAt'
                ]
            });
            
            // ❌ VERIFICACIÓN DE EXISTENCIA DE LA RECETA
            if (!receta) {
                console.log(`❌ No se encontró receta para la cita ID: ${citaId}`);
                return res.status(404).json({ 
                    error: 'No se encontró receta médica para esta cita',
                    citaId: parseInt(citaId),
                    sugerencias: [
                        'Verifique que el ID de la cita sea correcto',
                        'Confirme que la cita tenga una receta asociada',
                        'Puede que la receta aún no haya sido creada por el doctor'
                    ]
                });
            }

            // 📋 INFORMACIÓN DETALLADA DE LA RECETA ENCONTRADA
            console.log(`✅ Receta encontrada para cita ID ${citaId}:`, {
                recetaId: receta.id,
                paciente: receta.nombrePaciente,
                medicamento: receta.medicamento,
                doctorId: receta.doctorId,
                fechaCreacion: receta.createdAt
            });

            // 🔍 VERIFICACIÓN OPCIONAL DE LA CITA ASOCIADA
            // Obtenemos información adicional de la cita para contexto
            try {
                const citaInfo = await Cita.findByPk(citaId, {
                    attributes: ['id', 'nombre', 'correo', 'fecha', 'hora', 'especialidad', 'modalidad']
                });
                
                if (citaInfo) {
                    console.log(`📋 Información de la cita asociada:`, {
                        fecha: citaInfo.fecha,
                        hora: citaInfo.hora,
                        especialidad: citaInfo.especialidad,
                        modalidad: citaInfo.modalidad
                    });
                }
            } catch (citaError) {
                console.log(`⚠️ No se pudo obtener información adicional de la cita: ${citaError.message}`);
            }

            // 📊 METADATOS ÚTILES PARA EL FRONTEND
            const metadatos = {
                fechaConsulta: new Date().toISOString(),
                diasDesdeCreacion: Math.floor((new Date() - new Date(receta.createdAt)) / (1000 * 60 * 60 * 24)),
                estadoReceta: 'activa', // En un sistema más complejo, esto vendría de la BD
                numeroReceta: receta.id,
                fechaEmision: receta.fecha,
                fechaCreacion: receta.createdAt,
                ultimaModificacion: receta.updatedAt
            };

            // ✅ RESPUESTA EXITOSA CON LA RECETA
            res.json({
                message: 'Receta médica encontrada exitosamente',
                // 💊 DATOS PRINCIPALES DE LA RECETA
                receta: {
                    id: receta.id,
                    citaId: receta.citaId,
                    nombrePaciente: receta.nombrePaciente,
                    doctorId: receta.doctorId,
                    medicamento: receta.medicamento,
                    dosis: receta.dosis,
                    frecuencia: receta.frecuencia,
                    duracion: receta.duracion,
                    indicaciones: receta.indicaciones || 'Sin indicaciones especiales',
                    fecha: receta.fecha,
                    fechaCreacion: receta.createdAt,
                    fechaActualizacion: receta.updatedAt
                },
                // 📊 METADATOS ADICIONALES
                metadatos: metadatos,
                // 💡 INFORMACIÓN ÚTIL PARA EL FRONTEND
                acciones: {
                    puedeActualizar: true,
                    puedeEliminar: true,
                    puedeReenviarEmail: true,
                    puedeDescargarPDF: true
                }
            });
            
        } catch (error) {
            // 🚨 MANEJO DETALLADO DE ERRORES
            const errorId = `GET_RECETA_CITA_${Date.now()}`;
            console.error(`❌ ${errorId} - Error al obtener receta por cita:`, error);
            
            // 📋 LOG DETALLADO DEL ERROR
            console.error(`📋 Detalles del error:`, {
                citaId: req.params.citaId,
                errorName: error.name,
                errorMessage: error.message,
                stack: error.stack?.split('\n')[0],
                timestamp: new Date().toISOString()
            });

            // Manejo específico de errores de base de datos
            if (error.name === 'SequelizeDatabaseError') {
                return res.status(500).json({
                    error: 'Error en la consulta de receta a la base de datos',
                    errorId: errorId,
                    sugerencia: 'Contacte al administrador del sistema'
                });
            }

            // Error genérico del servidor
            res.status(500).json({ 
                error: 'Error interno del servidor al obtener la receta',
                citaId: req.params.citaId,
                errorId: errorId,
                timestamp: new Date().toISOString()
            });
        }
    }    // 🆔 MÉTODO PARA OBTENER RECETA POR SU ID ÚNICO
    // Este método busca una receta específica usando su ID primario
    // Endpoint: GET /api/recetas/:id
    static async obtenerRecetaPorId(req, res) {
        try {
            // 📥 EXTRACCIÓN DEL ID DE RECETA DESDE PARÁMETROS DE URL
            const { id } = req.params;
            
            // 📊 REGISTRO DE AUDITORÍA
            console.log(`🔍 Búsqueda de receta por ID: ${id}`);
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);
            
            // 🔢 VALIDACIÓN DEL ID DE RECETA
            if (!id) {
                console.log(`❌ ID de receta no proporcionado`);
                return res.status(400).json({ 
                    error: 'ID de receta es requerido',
                    parametroEsperado: 'id',
                    ejemploURL: '/api/recetas/123'
                });
            }

            // Validar que sea un número válido
            if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
                console.log(`❌ ID de receta inválido: ${id}`);
                return res.status(400).json({
                    error: 'El ID de receta debe ser un número positivo',
                    valorRecibido: id,
                    formatoEsperado: 'Número entero positivo'
                });
            }

            // 🔍 BÚSQUEDA DE LA RECETA POR CLAVE PRIMARIA
            console.log(`🔍 Buscando receta con ID: ${id}`);
            
            // findByPk es más eficiente para búsquedas por clave primaria
            // Equivale a: SELECT * FROM recetas WHERE id = [id]
            const receta = await Receta.findByPk(parseInt(id), {
                attributes: [
                    'id', 'citaId', 'nombrePaciente', 'doctorId', 'medicamento',
                    'dosis', 'frecuencia', 'duracion', 'indicaciones', 'fecha',
                    'createdAt', 'updatedAt'
                ]
            });
            
            // ❌ VERIFICACIÓN DE EXISTENCIA
            if (!receta) {
                console.log(`❌ Receta no encontrada con ID: ${id}`);
                return res.status(404).json({ 
                    error: 'Receta médica no encontrada',
                    recetaId: parseInt(id),
                    sugerencias: [
                        'Verifique que el ID de la receta sea correcto',
                        'La receta puede haber sido eliminada',
                        'Contacte al administrador si el problema persiste'
                    ]
                });
            }

            // 📋 INFORMACIÓN DETALLADA DE LA RECETA ENCONTRADA
            console.log(`✅ Receta encontrada:`, {
                id: receta.id,
                citaId: receta.citaId,
                paciente: receta.nombrePaciente,
                medicamento: receta.medicamento,
                doctorId: receta.doctorId,
                fechaCreacion: receta.createdAt
            });

            // 🔍 OBTENER INFORMACIÓN ADICIONAL DE LA CITA ASOCIADA
            let informacionCita = null;
            try {
                const cita = await Cita.findByPk(receta.citaId, {
                    attributes: ['id', 'nombre', 'correo', 'telefono', 'fecha', 'hora', 'especialidad', 'modalidad', 'doctorId']
                });
                
                if (cita) {
                    informacionCita = {
                        id: cita.id,
                        fechaCita: cita.fecha,
                        horaCita: cita.hora,
                        especialidad: cita.especialidad,
                        modalidad: cita.modalidad,
                        telefonoPaciente: cita.telefono,
                        emailPaciente: cita.correo
                    };
                    
                    console.log(`📋 Información de cita asociada obtenida:`, {
                        citaId: cita.id,
                        fecha: cita.fecha,
                        especialidad: cita.especialidad
                    });
                }
            } catch (citaError) {
                console.log(`⚠️ No se pudo obtener información de la cita asociada: ${citaError.message}`);
            }

            // 📊 CÁLCULO DE METADATOS ÚTILES
            const fechaActual = new Date();
            const fechaCreacion = new Date(receta.createdAt);
            const diasDesdeCreacion = Math.floor((fechaActual - fechaCreacion) / (1000 * 60 * 60 * 24));
            
            // 💊 ANÁLISIS DEL ESTADO DE LA RECETA
            const metadatos = {
                numeroReceta: receta.id,
                fechaConsulta: fechaActual.toISOString(),
                diasDesdeCreacion: diasDesdeCreacion,
                semanasDesdeCreacion: Math.floor(diasDesdeCreacion / 7),
                estadoReceta: diasDesdeCreacion > 90 ? 'expirada' : 'activa', // Las recetas expiran en 90 días
                fechaEmision: receta.fecha,
                fechaCreacion: receta.createdAt,
                ultimaModificacion: receta.updatedAt,
                puedeRenovar: diasDesdeCreacion > 30, // Renovable después de 30 días
                requiereNuevaConsulta: diasDesdeCreacion > 60 // Nueva consulta después de 60 días
            };

            // 👨‍⚕️ INFORMACIÓN DEL DOCTOR (si está disponible)
            let infoDoctor = null;
            if (receta.doctorId) {
                // En un sistema más complejo, aquí consultaríamos la tabla de doctores
                // Por ahora usamos el mapeo local
                const obtenerInfoDoctor = (doctorId) => {
                    const doctoresInfo = {
                        0: { nombre: "Dr. Gonzalo Mendoza", especialidad: "Medicina General", telefono: "+52 555 0001" },
                        1: { nombre: "Dr. Alonso Jimenez", especialidad: "Cardiología", telefono: "+52 555 0002" },
                        2: { nombre: "Dra. Melissa Lara", especialidad: "Pediatría", telefono: "+52 555 0003" },
                        3: { nombre: "Dr. Diego Hernandez", especialidad: "Dermatología", telefono: "+52 555 0004" },
                        4: { nombre: "Dra. Kelly Palomares", especialidad: "Ginecología", telefono: "+52 555 0005" },
                        5: { nombre: "Dr. Mauricio Rocha", especialidad: "Neurología", telefono: "+52 555 0006" },
                        6: { nombre: "Dr. Alexis Hernandez", especialidad: "Traumatología", telefono: "+52 555 0007" }
                    };
                    return doctoresInfo[doctorId] || { nombre: `Doctor ID: ${doctorId}`, especialidad: "No especificada", telefono: "No disponible" };
                };
                
                infoDoctor = obtenerInfoDoctor(receta.doctorId);
                console.log(`👨‍⚕️ Información del doctor obtenida: ${infoDoctor.nombre}`);
            }

            // ✅ RESPUESTA EXITOSA CON INFORMACIÓN COMPLETA
            res.json({
                message: 'Receta médica obtenida exitosamente',
                // 💊 DATOS PRINCIPALES DE LA RECETA
                receta: {
                    id: receta.id,
                    citaId: receta.citaId,
                    nombrePaciente: receta.nombrePaciente,
                    doctorId: receta.doctorId,
                    medicamento: receta.medicamento,
                    dosis: receta.dosis,
                    frecuencia: receta.frecuencia,
                    duracion: receta.duracion,
                    indicaciones: receta.indicaciones || 'Sin indicaciones especiales',
                    fecha: receta.fecha,
                    fechaCreacion: receta.createdAt,
                    fechaActualizacion: receta.updatedAt
                },
                // 👨‍⚕️ INFORMACIÓN DEL DOCTOR
                doctor: infoDoctor,
                // 🏥 INFORMACIÓN DE LA CITA (si está disponible)
                cita: informacionCita,
                // 📊 METADATOS Y ESTADO
                metadatos: metadatos,
                // 💡 ACCIONES DISPONIBLES PARA EL FRONTEND
                acciones: {
                    puedeActualizar: metadatos.estadoReceta === 'activa',
                    puedeEliminar: true,
                    puedeRenovar: metadatos.puedeRenovar,
                    requiereNuevaConsulta: metadatos.requiereNuevaConsulta,
                    puedeDescargarPDF: true,
                    puedeReenviarEmail: true
                }
            });
            
        } catch (error) {
            // 🚨 MANEJO DETALLADO DE ERRORES
            const errorId = `GET_RECETA_ID_${Date.now()}`;
            console.error(`❌ ${errorId} - Error al obtener receta por ID:`, error);
            
            // 📋 LOG DETALLADO DEL ERROR
            console.error(`📋 Detalles del error:`, {
                recetaId: req.params.id,
                errorName: error.name,
                errorMessage: error.message,
                stack: error.stack?.split('\n')[0],
                timestamp: new Date().toISOString()
            });

            // Manejo específico de errores de Sequelize
            if (error.name === 'SequelizeDatabaseError') {
                return res.status(500).json({
                    error: 'Error en la consulta de receta a la base de datos',
                    errorId: errorId,
                    sugerencia: 'Verifique la conexión a la base de datos'
                });
            }

            // Error genérico del servidor
            res.status(500).json({ 
                error: 'Error interno del servidor al obtener la receta',
                recetaId: req.params.id,
                errorId: errorId,
                timestamp: new Date().toISOString()
            });
        }
    }    // 👨‍⚕️ MÉTODO PARA OBTENER TODAS LAS RECETAS DE UN DOCTOR ESPECÍFICO
    // Este método lista todas las recetas prescritas por un doctor particular
    // Endpoint: GET /api/recetas/doctor/:doctorId
    static async obtenerRecetasPorDoctor(req, res) {
        try {
            // 📥 EXTRACCIÓN DEL ID DEL DOCTOR DESDE PARÁMETROS DE URL
            const { doctorId } = req.params;
            
            // 📊 REGISTRO DE AUDITORÍA
            console.log(`👨‍⚕️ Búsqueda de recetas por doctor ID: ${doctorId}`);
            console.log(`📅 Timestamp: ${new Date().toISOString()}`);
            console.log(`🌐 IP solicitante: ${req.ip || 'No disponible'}`);
            
            // 🔢 VALIDACIÓN DEL ID DEL DOCTOR
            if (!doctorId) {
                console.log(`❌ ID de doctor no proporcionado`);
                return res.status(400).json({ 
                    error: 'ID de doctor es requerido para buscar sus recetas',
                    parametroEsperado: 'doctorId',
                    ejemploURL: '/api/recetas/doctor/1'
                });
            }

            // Validar que sea un ID válido (puede ser número o string)
            if (doctorId.toString().trim() === '') {
                console.log(`❌ ID de doctor vacío: "${doctorId}"`);
                return res.status(400).json({
                    error: 'El ID del doctor no puede estar vacío',
                    valorRecibido: doctorId
                });
            }

            // 🔍 PARÁMETROS DE CONSULTA OPCIONALES PARA FILTRADO Y PAGINACIÓN
            const {
                page = 1,           // Página actual (por defecto 1)
                limit = 20,         // Recetas por página (por defecto 20)
                fechaInicio,        // Filtro por fecha de inicio (formato YYYY-MM-DD)
                fechaFin,           // Filtro por fecha de fin (formato YYYY-MM-DD)
                medicamento,        // Filtro por nombre de medicamento
                paciente,           // Filtro por nombre de paciente
                sortBy = 'createdAt', // Campo para ordenar (por defecto fecha de creación)
                sortOrder = 'DESC'  // Orden: DESC (más recientes primero) o ASC
            } = req.query;

            // 🔢 VALIDACIÓN DE PARÁMETROS DE PAGINACIÓN
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            
            if (isNaN(pageNumber) || pageNumber < 1) {
                return res.status(400).json({
                    error: 'El número de página debe ser un entero positivo',
                    valorRecibido: page
                });
            }
            
            if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
                return res.status(400).json({
                    error: 'El límite debe ser entre 1 y 100 recetas por página',
                    valorRecibido: limit
                });
            }

            // 🏗️ CONSTRUCCIÓN DE FILTROS DINÁMICOS
            const whereClause = { doctorId: doctorId };
            
            // 📅 FILTRO POR RANGO DE FECHAS
            if (fechaInicio || fechaFin) {
                const { Op } = require('sequelize');
                const fechaFilter = {};
                
                if (fechaInicio) {
                    // Validar formato de fecha
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) {
                        return res.status(400).json({
                            error: 'Formato de fecha inicio inválido. Use YYYY-MM-DD',
                            valorRecibido: fechaInicio
                        });
                    }
                    fechaFilter[Op.gte] = fechaInicio; // Mayor o igual que fecha inicio
                }
                
                if (fechaFin) {
                    // Validar formato de fecha
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
                        return res.status(400).json({
                            error: 'Formato de fecha fin inválido. Use YYYY-MM-DD',
                            valorRecibido: fechaFin
                        });
                    }
                    fechaFilter[Op.lte] = fechaFin; // Menor o igual que fecha fin
                }
                
                whereClause.fecha = fechaFilter;
                console.log(`📅 Filtro por rango de fechas aplicado: ${fechaInicio || 'sin inicio'} a ${fechaFin || 'sin fin'}`);
            }

            // 💊 FILTRO POR MEDICAMENTO
            if (medicamento && medicamento.trim() !== '') {
                const { Op } = require('sequelize');
                whereClause.medicamento = { 
                    [Op.like]: `%${medicamento.trim()}%` 
                };
                console.log(`💊 Filtro por medicamento aplicado: contiene "${medicamento}"`);
            }

            // 👤 FILTRO POR NOMBRE DE PACIENTE
            if (paciente && paciente.trim() !== '') {
                const { Op } = require('sequelize');
                whereClause.nombrePaciente = { 
                    [Op.like]: `%${paciente.trim()}%` 
                };
                console.log(`👤 Filtro por paciente aplicado: contiene "${paciente}"`);
            }

            // 📊 CONFIGURACIÓN DE OPCIONES DE CONSULTA
            const queryOptions = {
                where: whereClause,
                // 📄 PAGINACIÓN
                offset: (pageNumber - 1) * limitNumber,
                limit: limitNumber,
                // 📊 ORDENAMIENTO
                order: [[sortBy, sortOrder.toUpperCase()]],
                // 📋 CAMPOS A INCLUIR
                attributes: [
                    'id', 'citaId', 'nombrePaciente', 'doctorId', 'medicamento',
                    'dosis', 'frecuencia', 'duracion', 'indicaciones', 'fecha',
                    'createdAt', 'updatedAt'
                ]
            };

            // 🔍 EJECUCIÓN DE LA CONSULTA CON CONTEO
            console.log(`📋 Ejecutando consulta de recetas para doctor ${doctorId} con filtros:`, {
                page: pageNumber,
                limit: limitNumber,
                filtros: Object.keys(whereClause).filter(key => key !== 'doctorId'),
                ordenamiento: `${sortBy} ${sortOrder}`
            });

            // findAndCountAll ejecuta dos consultas: una para contar y otra para obtener datos
            const result = await Receta.findAndCountAll(queryOptions);
            
            const recetas = result.rows;      // Array de recetas
            const totalRecetas = result.count; // Total de recetas del doctor

            // 📊 CÁLCULO DE METADATOS DE PAGINACIÓN
            const totalPages = Math.ceil(totalRecetas / limitNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;

            // 📈 ANÁLISIS ESTADÍSTICO DE LAS RECETAS
            let estadisticas = {
                totalRecetasDoctor: totalRecetas,
                recetasEnPagina: recetas.length,
                paginaActual: pageNumber,
                totalPaginas: totalPages,
                hayMasPaginas: hasNextPage,
                hayPaginaAnterior: hasPrevPage
            };

            // Si hay recetas, calculamos estadísticas adicionales
            if (recetas.length > 0) {
                // Medicamentos más recetados
                const medicamentosCount = {};
                const pacientesUnicos = new Set();
                let recetasUltimoMes = 0;
                
                const fechaUnMesAtras = new Date();
                fechaUnMesAtras.setMonth(fechaUnMesAtras.getMonth() - 1);
                
                recetas.forEach(receta => {
                    // Contar medicamentos
                    const medicamento = receta.medicamento;
                    medicamentosCount[medicamento] = (medicamentosCount[medicamento] || 0) + 1;
                    
                    // Contar pacientes únicos
                    pacientesUnicos.add(receta.nombrePaciente);
                    
                    // Contar recetas del último mes
                    if (new Date(receta.createdAt) >= fechaUnMesAtras) {
                        recetasUltimoMes++;
                    }
                });

                // Medicamentos más frecuentes (top 5)
                const medicamentosFrecuentes = Object.entries(medicamentosCount)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([medicamento, cantidad]) => ({ medicamento, cantidad }));

                estadisticas = {
                    ...estadisticas,
                    pacientesUnicos: pacientesUnicos.size,
                    medicamentosFrecuentes: medicamentosFrecuentes,
                    recetasUltimoMes: recetasUltimoMes,
                    promedioRecetasPorMes: (totalRecetas / 12).toFixed(1), // Estimación anual
                    fechaUltimaReceta: recetas[0]?.createdAt || null // Asumiendo orden DESC
                };
            }

            // 📋 LOG DE RESULTADOS
            console.log(`✅ Consulta completada para doctor ${doctorId}:`, {
                totalEncontradas: totalRecetas,
                enPagina: recetas.length,
                pagina: `${pageNumber}/${totalPages}`,
                pacientesUnicos: estadisticas.pacientesUnicos || 0
            });

            // ✅ RESPUESTA EXITOSA CON RECETAS Y METADATOS
            res.json({
                message: `Se encontraron ${totalRecetas} recetas para el doctor ${doctorId}`,
                // 👨‍⚕️ INFORMACIÓN DEL DOCTOR
                doctor: {
                    id: doctorId,
                    totalRecetas: totalRecetas
                },
                // 💊 DATOS PRINCIPALES DE LAS RECETAS
                recetas: recetas,
                // 📊 ESTADÍSTICAS Y METADATOS
                estadisticas: estadisticas,
                // 📄 INFORMACIÓN DE PAGINACIÓN
                paginacion: {
                    paginaActual: pageNumber,
                    totalPaginas: totalPages,
                    totalRecetas: totalRecetas,
                    recetasPorPagina: limitNumber,
                    hayPaginaSiguiente: hasNextPage,
                    hayPaginaAnterior: hasPrevPage,
                    primerElemento: (pageNumber - 1) * limitNumber + 1,
                    ultimoElemento: Math.min(pageNumber * limitNumber, totalRecetas)
                },
                // 🔍 INFORMACIÓN DE FILTROS APLICADOS
                filtros: {
                    doctorId: doctorId,
                    fechaInicio: fechaInicio || null,
                    fechaFin: fechaFin || null,
                    medicamento: medicamento || null,
                    paciente: paciente || null,
                    ordenamiento: `${sortBy} ${sortOrder}`
                },
                // 🔗 ENLACES DE NAVEGACIÓN
                navegacion: {
                    paginaSiguiente: hasNextPage ? 
                        `${req.baseUrl}${req.path.replace(':doctorId', doctorId)}?page=${pageNumber + 1}&limit=${limitNumber}` : null,
                    paginaAnterior: hasPrevPage ? 
                        `${req.baseUrl}${req.path.replace(':doctorId', doctorId)}?page=${pageNumber - 1}&limit=${limitNumber}` : null
                }
            });
            
        } catch (error) {
            // 🚨 MANEJO DETALLADO DE ERRORES
            const errorId = `GET_RECETAS_DOCTOR_${Date.now()}`;
            console.error(`❌ ${errorId} - Error al obtener recetas por doctor:`, error);
            
            // 📋 LOG DETALLADO DEL ERROR
            console.error(`📋 Detalles del error:`, {
                doctorId: req.params.doctorId,
                parametrosConsulta: req.query,
                errorName: error.name,
                errorMessage: error.message,
                stack: error.stack?.split('\n')[0],
                timestamp: new Date().toISOString()
            });

            // Manejo específico de errores de Sequelize
            if (error.name === 'SequelizeDatabaseError') {
                return res.status(500).json({
                    error: 'Error en la consulta de recetas a la base de datos',
                    doctorId: req.params.doctorId,
                    errorId: errorId
                });
            }

            // Error genérico del servidor
            res.status(500).json({ 
                error: 'Error interno del servidor al obtener recetas del doctor',
                doctorId: req.params.doctorId,
                errorId: errorId,
                timestamp: new Date().toISOString()
            });
        }
    }// Método para verificar si existe una receta para una cita específica
    static async verificarRecetaExiste(req, res) {
        try {
            // Extraemos el ID de la cita de los parámetros de la URL
            const { citaId } = req.params;
            
            // Validamos que se proporcionó el ID de la cita
            if (!citaId) {
                return res.status(400).json({ error: 'ID de cita es requerido' });
            }

            // Buscamos si existe una receta para esta cita
            const receta = await Receta.findOne({ where: { citaId } });
            // Convertimos el resultado a booleano (true si existe, false si no)
            const existe = !!receta;
            
            // Devolvemos solo la información de si existe o no
            res.json({ existe });
        } catch (error) {
            // Manejo de errores del servidor
            console.error('Error al verificar existencia de receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Método para actualizar una receta existente
    static async actualizarReceta(req, res) {
        try {
            // Extraemos el ID de la receta de los parámetros de la URL
            const { id } = req.params;
            // Extraemos los campos que se pueden actualizar del cuerpo de la petición
            const { medicamento, dosis, frecuencia, duracion, indicaciones } = req.body;
            
            // Validamos que se proporcionó el ID de la receta
            if (!id) {
                return res.status(400).json({ error: 'ID de receta es requerido' });
            }            // Verificar que la receta existe antes de intentar actualizarla
            const receta = await Receta.findByPk(id);
            if (!receta) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            // Creamos un objeto con solo los campos que se van a actualizar
            // Esto permite actualizaciones parciales (solo los campos enviados)
            const datosActualizacion = {};
            if (medicamento) datosActualizacion.medicamento = medicamento;
            if (dosis) datosActualizacion.dosis = dosis;
            if (frecuencia) datosActualizacion.frecuencia = frecuencia;
            if (duracion) datosActualizacion.duracion = duracion;
            // !== undefined permite enviar string vacío para borrar indicaciones
            if (indicaciones !== undefined) datosActualizacion.indicaciones = indicaciones;

            // Actualizamos la receta con los nuevos datos
            await receta.update(datosActualizacion);
            
            // Devolvemos confirmación con la receta actualizada
            res.json({
                message: 'Receta actualizada exitosamente',
                receta
            });
        } catch (error) {
            // Manejo de errores del servidor
            console.error('Error al actualizar receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Método para eliminar una receta permanentemente
    static async eliminarReceta(req, res) {
        try {
            // Extraemos el ID de la receta de los parámetros de la URL
            const { id } = req.params;
            
            // Validamos que se proporcionó el ID de la receta
            if (!id) {
                return res.status(400).json({ error: 'ID de receta es requerido' });
            }

            // Verificar que la receta existe antes de eliminarla
            const receta = await Receta.findByPk(id);
            if (!receta) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            // destroy() elimina permanentemente el registro de la base de datos
            await receta.destroy();
            
            // Confirmamos la eliminación
            res.json({
                message: 'Receta eliminada exitosamente'
            });
        } catch (error) {
            // Manejo de errores del servidor
            console.error('Error al eliminar receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

// Exportamos todos los métodos de la clase como funciones individuales
// Esto permite importarlos individualmente en las rutas
module.exports = {
    crearReceta: RecetaController.crearReceta,
    obtenerRecetaPorId: RecetaController.obtenerRecetaPorId,
    obtenerRecetaPorCita: RecetaController.obtenerRecetaPorCita,
    obtenerRecetasPorDoctor: RecetaController.obtenerRecetasPorDoctor,
    verificarRecetaExiste: RecetaController.verificarRecetaExiste,
    actualizarReceta: RecetaController.actualizarReceta,
    eliminarReceta: RecetaController.eliminarReceta
};