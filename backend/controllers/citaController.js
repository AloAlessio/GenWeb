// Importamos el modelo Cita para interactuar con la tabla de citas médicas
const Cita = require('../models/Cita'); // Asegúrate de que el modelo está bien importado

// 📋 FUNCIÓN PARA CREAR UNA NUEVA CITA MÉDICA
// Esta función maneja las peticiones POST para crear citas médicas
// Endpoint: POST /api/citas
exports.crearCita = async (req, res) => {
    try {
        // 📥 EXTRACCIÓN DE DATOS DEL CUERPO DE LA PETICIÓN
        // Destructuramos todos los campos necesarios que vienen en req.body
        // req.body contiene el JSON enviado desde el frontend
        const { 
            nombre,         // String: Nombre completo del paciente (ej: "Juan Pérez")
            correo,         // String: Email del paciente (ej: "juan@email.com")  
            telefono,       // String: Número telefónico (ej: "+52 123 456 7890")
            doctorId,       // Number/String: ID único del doctor seleccionado (ej: 1, 2, 3)
            especialidad,   // String: Especialidad médica (ej: "Cardiología", "Pediatría")
            modalidad,      // String: Tipo de cita ("Virtual", "Presencial")
            fecha,          // String: Fecha de la cita en formato YYYY-MM-DD (ej: "2025-06-18")
            hora,           // String: Hora de la cita en formato HH:MM (ej: "14:30")
            notas          // String: Observaciones adicionales del paciente (OPCIONAL)
        } = req.body;

        // 🔍 VALIDACIÓN DE CAMPOS OBLIGATORIOS
        // Verificamos que todos los campos requeridos tengan valor (no sean null, undefined o "")
        // Usamos el operador OR (||) para verificar múltiples condiciones
        // Si cualquier campo está vacío, la condición será true y se ejecutará el return
        if (!nombre || !correo || !telefono || !doctorId || !especialidad || !modalidad || !fecha || !hora) {
            // Status 400 = Bad Request (petición mal formada por el cliente)
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios excepto las notas",
                camposRequeridos: ["nombre", "correo", "telefono", "doctorId", "especialidad", "modalidad", "fecha", "hora"]
            });
        }

        // 💾 CREACIÓN DE LA CITA EN LA BASE DE DATOS
        // Cita.create() es un método de Sequelize que:
        // 1. Inserta un nuevo registro en la tabla 'citas'
        // 2. Asigna automáticamente un ID único (auto_increment)
        // 3. Agrega timestamps (createdAt, updatedAt) si están configurados
        // 4. Valida los tipos de datos según el modelo
        const nuevaCita = await Cita.create({
            nombre,         // Se guarda tal como viene del frontend
            correo,         // Se guarda tal como viene del frontend
            telefono,       // Se guarda tal como viene del frontend
            doctorId,       // Se convierte al tipo definido en el modelo
            especialidad,   // Se guarda tal como viene del frontend
            modalidad,      // Se guarda tal como viene del frontend
            fecha,          // Se convierte a tipo DATE si es necesario
            hora,           // Se guarda como STRING o TIME según el modelo
            notas: notas || null  // Si notas está vacío, se guarda como NULL
        });

        // ✅ RESPUESTA EXITOSA AL CLIENTE
        // Status 201 = Created (recurso creado exitosamente)
        // Devolvemos un objeto JSON con mensaje de confirmación y los datos de la cita creada
        res.status(201).json({ 
            message: "Cita médica creada exitosamente",
            cita: nuevaCita,  // Objeto completo de la cita con ID asignado y timestamps
            timestamp: new Date().toISOString()  // Marca de tiempo del servidor
        });

    } catch (error) {
        // 🚨 MANEJO DE ERRORES
        // console.error registra el error completo en los logs del servidor
        // Útil para debugging y monitoreo de la aplicación
        console.error("❌ Error al crear la cita médica:", error);
        
        // Status 500 = Internal Server Error (error del servidor, no del cliente)
        // No mostramos detalles del error al cliente por seguridad
        res.status(500).json({ 
            message: "Error interno del servidor al crear la cita",
            timestamp: new Date().toISOString()
        });
    }
};

// 📋 FUNCIÓN PARA OBTENER TODAS LAS CITAS CON FILTROS OPCIONALES
// Esta función maneja las peticiones GET para listar citas
// Endpoint: GET /api/citas?fecha=2025-06-18&modalidad=Virtual
exports.getAllCitas = async (req, res) => {
    try {
        // 🔍 EXTRACCIÓN DE PARÁMETROS DE CONSULTA (QUERY PARAMETERS)
        // req.query contiene los parámetros que vienen después del ? en la URL
        // Ejemplo: /api/citas?fecha=2025-06-18&modalidad=Virtual&especialidad=cardiologia
        const { 
            fecha,          // String opcional: Filtrar por fecha específica (formato YYYY-MM-DD)
            modalidad,      // String opcional: Filtrar por tipo de modalidad ("Virtual" o "Presencial")
            especialidad,   // String opcional: Filtrar por especialidad médica
            doctorId,       // String/Number opcional: Filtrar por ID de doctor específico
            estado          // String opcional: Filtrar por estado de la cita ("pendiente", "confirmada", "cancelada")
        } = req.query;

        // 🏗️ CONSTRUCCIÓN DINÁMICA DE FILTROS
        // whereClause será el objeto que contenga todas las condiciones WHERE de SQL
        // Se construye dinámicamente dependiendo de qué filtros envíe el cliente
        const whereClause = {};
        
        // 📅 FILTRO POR FECHA
        // Si el cliente envía el parámetro fecha, agregamos la condición al whereClause
        if (fecha) {
            // Validación básica del formato de fecha
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(fecha)) {
                return res.status(400).json({ 
                    message: "Formato de fecha inválido. Use YYYY-MM-DD",
                    ejemplo: "2025-06-18"
                });
            }
            whereClause.fecha = fecha;  // Equivale a: WHERE fecha = '2025-06-18'
        }
        
        // 🏥 FILTRO POR MODALIDAD
        // Si el cliente envía el parámetro modalidad, agregamos la condición
        if (modalidad) {
            // Normalizamos la modalidad para evitar problemas de mayúsculas/minúsculas
            const modalidadNormalizada = modalidad.charAt(0).toUpperCase() + modalidad.slice(1).toLowerCase();
            whereClause.modalidad = modalidadNormalizada;  // WHERE modalidad = 'Virtual'
        }

        // 🩺 FILTRO POR ESPECIALIDAD
        if (especialidad) {
            whereClause.especialidad = especialidad;  // WHERE especialidad = 'Cardiología'
        }

        // 👨‍⚕️ FILTRO POR DOCTOR
        if (doctorId) {
            whereClause.doctorId = doctorId;  // WHERE doctorId = 1
        }

        // 📊 FILTRO POR ESTADO
        if (estado) {
            whereClause.estado = estado;  // WHERE estado = 'confirmada'
        }

        // 📋 OPCIONES DE CONSULTA ADICIONALES
        const queryOptions = {
            where: whereClause,  // Aplica todos los filtros construidos arriba
            order: [
                ['fecha', 'ASC'],    // Ordena por fecha ascendente (más próximas primero)
                ['hora', 'ASC']      // En caso de misma fecha, ordena por hora ascendente
            ],
            // attributes: ['id', 'nombre', 'correo', 'fecha', 'hora', 'modalidad', 'estado']  // Campos específicos si se desea
        };

        // 🔍 EJECUCIÓN DE LA CONSULTA
        // findAll() ejecuta una consulta SELECT con todas las condiciones especificadas
        // Equivale a: SELECT * FROM citas WHERE [condiciones] ORDER BY fecha ASC, hora ASC
        const citas = await Cita.findAll(queryOptions);
        
        // 📊 ESTADÍSTICAS ADICIONALES DE LA CONSULTA
        const estadisticas = {
            totalCitas: citas.length,  // Número total de citas encontradas
            filtrosAplicados: Object.keys(whereClause),  // Lista de filtros que se aplicaron
            tiempoConsulta: new Date().toISOString()  // Timestamp de cuando se ejecutó la consulta
        };

        // ✅ RESPUESTA EXITOSA CON LAS CITAS Y METADATOS
        res.json({
            message: "Citas obtenidas exitosamente",
            citas: citas,  // Array de objetos cita
            estadisticas: estadisticas,  // Información adicional sobre la consulta
            filtros: whereClause  // Filtros aplicados para referencia del frontend
        });
        
    } catch (error) {
        // 🚨 MANEJO DE ERRORES
        console.error("❌ Error al obtener las citas:", error);
        res.status(500).json({ 
            message: "Error interno del servidor al obtener las citas",
            timestamp: new Date().toISOString()
        });
    }
};

// 🔍 FUNCIÓN PARA OBTENER UNA CITA ESPECÍFICA POR SU ID ÚNICO
// Esta función maneja las peticiones GET para buscar una cita individual
// Endpoint: GET /api/citas/:id (ej: GET /api/citas/123)
exports.getCitaById = async (req, res) => {
    // 📥 EXTRACCIÓN DEL ID DESDE LOS PARÁMETROS DE LA URL
    // req.params contiene los valores que están en la ruta después de los ':'
    // En la ruta /api/citas/:id, si la URL es /api/citas/123, entonces id = "123"
    const { id } = req.params;
    
    try {
        // 🔢 VALIDACIÓN DEL PARÁMETRO ID
        // Verificamos que el ID sea un número válido
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ 
                message: "ID de cita inválido. Debe ser un número.",
                ejemploURL: "/api/citas/123"
            });
        }

        // 🔍 BÚSQUEDA DE LA CITA POR CLAVE PRIMARIA
        // findByPk() es un método especializado de Sequelize para buscar por Primary Key
        // Es más eficiente que findOne() porque usa el índice de la clave primaria
        // Equivale a: SELECT * FROM citas WHERE id = 123
        const cita = await Cita.findByPk(id);
        
        // ❌ VALIDACIÓN DE EXISTENCIA
        // Si findByPk retorna null significa que no existe una cita con ese ID
        if (!cita) {
            return res.status(404).json({ 
                message: `No se encontró una cita con el ID ${id}`,
                sugerencia: "Verifique que el ID sea correcto o que la cita no haya sido eliminada"
            });
        }

        // 📋 INFORMACIÓN ADICIONAL SOBRE LA CITA ENCONTRADA
        const informacionCita = {
            // Datos principales de la cita
            cita: cita,
            
            // Metadatos útiles para el frontend
            metadatos: {
                fechaConsulta: new Date().toISOString(),  // Cuándo se consultó esta información
                estadoCita: cita.estado || 'pendiente',   // Estado actual de la cita
                tiempoHastaCita: calcularTiempoHastaCita(cita.fecha, cita.hora),  // Días/horas hasta la cita
                esCitaPasada: new Date() > new Date(`${cita.fecha}T${cita.hora}`)  // Si la cita ya pasó
            }
        };
        
        // ✅ RESPUESTA EXITOSA CON LA CITA ENCONTRADA
        res.json({
            message: "Cita encontrada exitosamente",
            ...informacionCita  // Spread operator para incluir todos los campos de informacionCita
        });
        
    } catch (error) {
        // 🚨 MANEJO DE ERRORES
        console.error(`❌ Error al obtener la cita con ID ${id}:`, error);
        res.status(500).json({ 
            message: "Error interno del servidor al obtener la cita",
            citaId: id,
            timestamp: new Date().toISOString()
        });
    }
};

// 🕐 FUNCIÓN AUXILIAR PARA CALCULAR TIEMPO HASTA LA CITA
// Esta función no se exporta, es solo para uso interno del controlador
function calcularTiempoHastaCita(fecha, hora) {
    try {
        // Creamos objeto Date con la fecha y hora de la cita
        const fechaCita = new Date(`${fecha}T${hora}`);
        // Obtenemos la fecha/hora actual
        const ahora = new Date();
        
        // Calculamos la diferencia en milisegundos
        const diferencia = fechaCita.getTime() - ahora.getTime();
        
        // Si la diferencia es negativa, la cita ya pasó
        if (diferencia < 0) {
            return "La cita ya pasó";
        }
        
        // Convertimos milisegundos a días y horas
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        // Formateamos el mensaje según el tiempo restante
        if (dias > 0) {
            return `${dias} días y ${horas} horas`;
        } else if (horas > 0) {
            return `${horas} horas`;
        } else {
            return "Menos de 1 hora";
        }
    } catch (error) {
        return "No se pudo calcular";
    }
}

// ✏️ FUNCIÓN PARA ACTUALIZAR UNA CITA EXISTENTE
// Esta función maneja las peticiones PUT/PATCH para modificar citas
// Endpoint: PUT /api/citas/:id (ej: PUT /api/citas/123)
exports.updateCita = async (req, res) => {
    // 📥 EXTRACCIÓN DEL ID DE LA CITA A ACTUALIZAR
    // req.params.id contiene el ID que viene en la URL después de /citas/
    const { id } = req.params;
    
    try {
        // 🔢 VALIDACIÓN DEL ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ 
                message: "ID de cita inválido",
                idRecibido: id
            });
        }

        // 🔍 VERIFICACIÓN DE EXISTENCIA DE LA CITA
        // Primero verificamos que la cita existe antes de intentar actualizarla
        const cita = await Cita.findByPk(id);
        if (!cita) {
            return res.status(404).json({ 
                message: `No se encontró una cita con el ID ${id}`,
                accion: "No se puede actualizar una cita que no existe"
            });
        }

        // 📋 EXTRACCIÓN DE LOS CAMPOS A ACTUALIZAR
        // req.body contiene los nuevos valores enviados desde el frontend
        // Solo se actualizarán los campos que vengan en req.body
        const {
            nombre,         // String: Nuevo nombre del paciente (opcional)
            correo,         // String: Nuevo email del paciente (opcional)
            telefono,       // String: Nuevo teléfono del paciente (opcional)
            doctorId,       // Number: Nuevo ID del doctor (opcional)
            especialidad,   // String: Nueva especialidad (opcional)
            modalidad,      // String: Nueva modalidad ("Virtual" o "Presencial") (opcional)
            fecha,          // String: Nueva fecha en formato YYYY-MM-DD (opcional)
            hora,           // String: Nueva hora en formato HH:MM (opcional)
            notas,          // String: Nuevas notas o comentarios (opcional)
            estado          // String: Nuevo estado de la cita (opcional)
        } = req.body;

        // 🛡️ VALIDACIONES ESPECÍFICAS DE CAMPOS (si vienen datos)
        const erroresValidacion = [];
        
        // Validación de email si se envía
        if (correo) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                erroresValidacion.push("El formato del email es inválido");
            }
        }
        
        // Validación de fecha si se envía
        if (fecha) {
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(fecha)) {
                erroresValidacion.push("El formato de fecha debe ser YYYY-MM-DD");
            } else {
                // Verificar que la fecha no sea en el pasado
                const fechaCita = new Date(fecha);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);  // Resetear horas para comparar solo fechas
                
                if (fechaCita < hoy) {
                    erroresValidacion.push("No se puede agendar una cita en una fecha pasada");
                }
            }
        }
        
        // Validación de hora si se envía
        if (hora) {
            const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!horaRegex.test(hora)) {
                erroresValidacion.push("El formato de hora debe ser HH:MM (24 horas)");
            }
        }
        
        // Validación de modalidad si se envía
        if (modalidad && !['Virtual', 'Presencial'].includes(modalidad)) {
            erroresValidacion.push("La modalidad debe ser 'Virtual' o 'Presencial'");
        }

        // Si hay errores de validación, devolvemos error 400
        if (erroresValidacion.length > 0) {
            return res.status(400).json({
                message: "Errores de validación encontrados",
                errores: erroresValidacion
            });
        }

        // 📝 PREPARACIÓN DE LOS DATOS A ACTUALIZAR
        // Solo incluimos los campos que efectivamente vienen en req.body
        const datosActualizacion = {};
        
        // Construimos dinámicamente el objeto con solo los campos a actualizar
        if (nombre !== undefined) datosActualizacion.nombre = nombre;
        if (correo !== undefined) datosActualizacion.correo = correo;
        if (telefono !== undefined) datosActualizacion.telefono = telefono;
        if (doctorId !== undefined) datosActualizacion.doctorId = doctorId;
        if (especialidad !== undefined) datosActualizacion.especialidad = especialidad;
        if (modalidad !== undefined) datosActualizacion.modalidad = modalidad;
        if (fecha !== undefined) datosActualizacion.fecha = fecha;
        if (hora !== undefined) datosActualizacion.hora = hora;
        if (notas !== undefined) datosActualizacion.notas = notas;
        if (estado !== undefined) datosActualizacion.estado = estado;

        // Verificamos que al menos un campo se vaya a actualizar
        if (Object.keys(datosActualizacion).length === 0) {
            return res.status(400).json({
                message: "No se proporcionaron campos para actualizar",
                sugerencia: "Envíe al menos un campo a modificar en el cuerpo de la petición"
            });
        }

        // 💾 EJECUCIÓN DE LA ACTUALIZACIÓN
        // update() actualiza solo los campos especificados en datosActualizacion
        // Sequelize automáticamente actualiza el campo updatedAt
        await cita.update(datosActualizacion);
        
        // 📊 REGISTRO DE LA ACTUALIZACIÓN PARA AUDITORÍA
        console.log(`✅ Cita ID ${id} actualizada exitosamente`);
        console.log('Campos actualizados:', Object.keys(datosActualizacion));
        
        // ✅ RESPUESTA EXITOSA CON LA CITA ACTUALIZADA
        res.json({ 
            message: "Cita actualizada exitosamente",
            cita: cita,  // Objeto cita con los nuevos valores
            camposActualizados: Object.keys(datosActualizacion),  // Lista de campos que se modificaron
            fechaActualizacion: new Date().toISOString()  // Timestamp de la actualización
        });
        
    } catch (error) {
        // 🚨 MANEJO DE ERRORES
        console.error(`❌ Error al actualizar la cita ID ${id}:`, error);
        res.status(500).json({ 
            message: "Error interno del servidor al actualizar la cita",
            citaId: id,
            timestamp: new Date().toISOString()
        });
    }
};

// 🗑️ FUNCIÓN PARA ELIMINAR UNA CITA DE FORMA PERMANENTE
// Esta función maneja las peticiones DELETE para borrar citas
// Endpoint: DELETE /api/citas/:id (ej: DELETE /api/citas/123)
exports.deleteCita = async (req, res) => {
    // 📥 EXTRACCIÓN DEL ID DE LA CITA A ELIMINAR
    const { id } = req.params;
    
    try {
        // 🔢 VALIDACIÓN DEL ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ 
                message: "ID de cita inválido para eliminación",
                idRecibido: id,
                formatoEsperado: "Número entero positivo"
            });
        }

        // 🔍 VERIFICACIÓN DE EXISTENCIA ANTES DE ELIMINAR
        // Es importante verificar que la cita existe antes de intentar eliminarla
        const cita = await Cita.findByPk(id);
        if (!cita) {
            return res.status(404).json({ 
                message: `No se encontró una cita con el ID ${id}`,
                accion: "No se puede eliminar una cita que no existe"
            });
        }

        // 📋 CAPTURA DE INFORMACIÓN ANTES DE LA ELIMINACIÓN
        // Guardamos datos importantes antes de eliminar para registro/auditoría
        const informacionCita = {
            id: cita.id,
            nombrePaciente: cita.nombre,
            correo: cita.correo,
            fecha: cita.fecha,
            hora: cita.hora,
            doctorId: cita.doctorId,
            especialidad: cita.especialidad,
            modalidad: cita.modalidad,
            estado: cita.estado,
            fechaCreacion: cita.createdAt,
            fechaEliminacion: new Date().toISOString()
        };

        // ⚠️ VERIFICACIONES DE SEGURIDAD ANTES DE ELIMINAR
        const verificaciones = [];
        
        // Verificar si la cita ya pasó (para posible auditoría)
        const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
        const ahora = new Date();
        
        if (fechaCita < ahora) {
            verificaciones.push("La cita ya pasó - se eliminará de los registros históricos");
        } else {
            verificaciones.push("La cita está programada a futuro - se cancelará y eliminará");
        }
        
        // Verificar si hay recetas asociadas (esto requeriría consulta adicional)
        // En una implementación más robusta, verificaríamos dependencias antes de eliminar
        
        // 🗂️ REGISTRO DE AUDITORÍA ANTES DE LA ELIMINACIÓN
        console.log(`🗑️ Iniciando eliminación de cita ID ${id}`);
        console.log('Información de la cita a eliminar:', {
            paciente: informacionCita.nombrePaciente,
            fecha: informacionCita.fecha,
            doctor: informacionCita.doctorId,
            estado: informacionCita.estado
        });

        // 💥 EJECUCIÓN DE LA ELIMINACIÓN
        // destroy() elimina permanentemente el registro de la base de datos
        // Esta operación NO es reversible - el registro se pierde para siempre
        await cita.destroy();
        
        // 📝 REGISTRO DE AUDITORÍA POST-ELIMINACIÓN
        console.log(`✅ Cita ID ${id} eliminada exitosamente de la base de datos`);
        
        // ✅ RESPUESTA EXITOSA DE CONFIRMACIÓN
        res.json({ 
            message: "Cita eliminada exitosamente",
            citaEliminada: {
                id: informacionCita.id,
                paciente: informacionCita.nombrePaciente,
                fecha: informacionCita.fecha,
                hora: informacionCita.hora
            },
            verificaciones: verificaciones,  // Información sobre las verificaciones realizadas
            timestamp: informacionCita.fechaEliminacion,  // Marca de tiempo de la eliminación
            advertencia: "Esta operación no es reversible"
        });
        
    } catch (error) {
        // 🚨 MANEJO DE ERRORES
        console.error(`❌ Error al eliminar la cita ID ${id}:`, error);
        
        // Verificamos si es un error de constraint (por ejemplo, si hay recetas asociadas)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({
                message: "No se puede eliminar la cita porque tiene registros asociados",
                sugerencia: "Elimine primero las recetas asociadas a esta cita",
                citaId: id
            });
        }
        
        // Error genérico del servidor
        res.status(500).json({ 
            message: "Error interno del servidor al eliminar la cita",
            citaId: id,
            timestamp: new Date().toISOString()
        });
    }
};

// ✅ FUNCIÓN PARA CONFIRMAR UNA CITA (CAMBIO DE ESTADO A 'CONFIRMADA')
// Esta función maneja las peticiones PATCH/PUT para confirmar citas médicas
// Endpoint: PATCH /api/citas/:id/confirmar (ej: PATCH /api/citas/123/confirmar)
exports.confirmarCita = async (req, res) => {
    try {
        // 📥 EXTRACCIÓN DEL ID DE LA CITA A CONFIRMAR
        // req.params.id contiene el ID que viene en la URL
        const { id } = req.params;
        
        // 📊 REGISTRO DE AUDITORÍA - LOG DE INICIO DEL PROCESO
        // console.log es útil para debugging y monitoreo del sistema
        console.log(`🔄 Iniciando proceso de confirmación de cita con ID: ${id}`);
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        
        // 🔢 VALIDACIÓN BÁSICA DEL ID
        if (!id || isNaN(parseInt(id))) {
            console.log(`❌ ID inválido recibido: ${id}`);
            return res.status(400).json({ 
                message: 'ID de cita inválido para confirmación',
                idRecibido: id,
                formatoEsperado: 'Número entero positivo'
            });
        }

        // 🔍 BÚSQUEDA DE LA CITA EN LA BASE DE DATOS
        // findByPk busca por Primary Key (más eficiente que findOne)
        // Equivale a: SELECT * FROM citas WHERE id = [id]
        const cita = await Cita.findByPk(id);
        
        // ❌ VERIFICACIÓN DE EXISTENCIA DE LA CITA
        if (!cita) {
            console.log(`❌ No se encontró cita con ID: ${id}`);
            return res.status(404).json({ 
                message: `No se encontró una cita con el ID ${id}`,
                sugerencia: 'Verifique que el ID sea correcto'
            });
        }

        // 📋 INFORMACIÓN DE LA CITA ANTES DE LA CONFIRMACIÓN
        const estadoAnterior = cita.estado || 'pendiente';  // Estado actual (por defecto 'pendiente')
        console.log(`📋 Cita encontrada - Paciente: ${cita.nombre}, Estado actual: ${estadoAnterior}`);

        // ⚠️ VALIDACIONES DE LÓGICA DE NEGOCIO
        const validacionesConfirmacion = [];
        
        // Verificar si la cita ya está confirmada
        if (estadoAnterior === 'confirmada') {
            validacionesConfirmacion.push('La cita ya está confirmada');
        }
        
        // Verificar si la cita está cancelada
        if (estadoAnterior === 'cancelada') {
            validacionesConfirmacion.push('No se puede confirmar una cita cancelada');
        }
        
        // Verificar si la fecha de la cita ya pasó
        const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
        const ahora = new Date();
        
        if (fechaCita < ahora) {
            validacionesConfirmacion.push('No se puede confirmar una cita que ya pasó');
        }

        // Si hay validaciones que impiden la confirmación
        if (validacionesConfirmacion.length > 0) {
            console.log(`⚠️ Validaciones fallidas:`, validacionesConfirmacion);
            return res.status(400).json({
                message: 'No se puede confirmar la cita',
                razones: validacionesConfirmacion,
                estadoActual: estadoAnterior,
                fechaCita: `${cita.fecha} ${cita.hora}`
            });
        }

        // 💾 ACTUALIZACIÓN DEL ESTADO A 'CONFIRMADA'
        // update() modifica solo el campo especificado sin afectar otros campos
        // Sequelize automáticamente actualiza el timestamp 'updatedAt'
        await cita.update({ 
            estado: 'confirmada',
            // Podríamos agregar más campos si fuera necesario:
            // fechaConfirmacion: new Date(),
            // usuarioQueConfirma: req.user?.id  // Si tuviéramos autenticación
        });
        
        // 📊 REGISTRO DE AUDITORÍA - CONFIRMACIÓN EXITOSA
        console.log(`✅ Cita ID ${id} confirmada exitosamente`);
        console.log(`👤 Paciente: ${cita.nombre}`);
        console.log(`📅 Fecha/Hora: ${cita.fecha} ${cita.hora}`);
        console.log(`🏥 Doctor ID: ${cita.doctorId}`);
        console.log(`🔄 Estado: ${estadoAnterior} → confirmada`);
        
        // 📧 AQUÍ PODRÍAMOS ENVIAR NOTIFICACIÓN AL PACIENTE
        // Ejemplo de integración futura:
        // await enviarNotificacionConfirmacion({
        //     email: cita.correo,
        //     nombre: cita.nombre,
        //     fecha: cita.fecha,
        //     hora: cita.hora
        // });

        // ✅ RESPUESTA EXITOSA AL CLIENTE
        res.json({ 
            message: 'Cita confirmada exitosamente',
            cita: {
                id: cita.id,
                nombre: cita.nombre,
                correo: cita.correo,
                fecha: cita.fecha,
                hora: cita.hora,
                doctorId: cita.doctorId,
                especialidad: cita.especialidad,
                modalidad: cita.modalidad,
                estadoAnterior: estadoAnterior,
                estadoActual: 'confirmada'
            },
            // Información adicional útil para el frontend
            metadatos: {
                fechaConfirmacion: new Date().toISOString(),
                tiempoHastaCita: calcularTiempoHastaCita(cita.fecha, cita.hora),
                proximasAcciones: ['Enviar recordatorio 24h antes', 'Preparar documentos médicos']
            }
        });
        
    } catch (error) {
        // 🚨 MANEJO DETALLADO DE ERRORES
        const errorId = `ERROR_${Date.now()}`; // ID único para rastrear el error
        console.error(`❌ ${errorId} - Error al confirmar la cita:`, error);
        console.error(`📋 Detalles del error:`, {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n')[0]  // Solo la primera línea del stack trace
        });
        
        // Respuesta de error personalizada según el tipo de error
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Error de validación al confirmar la cita',
                errores: error.errors?.map(e => e.message),
                errorId: errorId
            });
        }
        
        // Error genérico del servidor
        res.status(500).json({ 
            message: 'Error interno del servidor al confirmar la cita',
            errorId: errorId,  // ID para que el frontend pueda reportar el error específico
            timestamp: new Date().toISOString()
        });
    }
};

// ❌ FUNCIÓN PARA CANCELAR UNA CITA (CAMBIO DE ESTADO A 'CANCELADA')
// Esta función maneja las peticiones PATCH/PUT para cancelar citas médicas
// Endpoint: PATCH /api/citas/:id/cancelar (ej: PATCH /api/citas/123/cancelar)
exports.cancelarCita = async (req, res) => {
    try {
        // 📥 EXTRACCIÓN DEL ID DE LA CITA A CANCELAR
        const { id } = req.params;
        
        // 📋 EXTRACCIÓN DE RAZÓN DE CANCELACIÓN (OPCIONAL)
        // El frontend puede enviar el motivo de la cancelación en el body
        const { razonCancelacion, canceladoPor } = req.body || {};
        
        // 📊 REGISTRO DE AUDITORÍA - LOG DE INICIO DEL PROCESO
        console.log(`🔄 Iniciando proceso de cancelación de cita con ID: ${id}`);
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        if (razonCancelacion) {
            console.log(`📝 Razón de cancelación: ${razonCancelacion}`);
        }
        
        // 🔢 VALIDACIÓN BÁSICA DEL ID
        if (!id || isNaN(parseInt(id))) {
            console.log(`❌ ID inválido recibido para cancelación: ${id}`);
            return res.status(400).json({ 
                message: 'ID de cita inválido para cancelación',
                idRecibido: id,
                formatoEsperado: 'Número entero positivo'
            });
        }

        // 🔍 BÚSQUEDA DE LA CITA EN LA BASE DE DATOS
        const cita = await Cita.findByPk(id);
        
        // ❌ VERIFICACIÓN DE EXISTENCIA DE LA CITA
        if (!cita) {
            console.log(`❌ No se encontró cita con ID: ${id} para cancelar`);
            return res.status(404).json({ 
                message: `No se encontró una cita con el ID ${id}`,
                accion: 'cancelación',
                sugerencia: 'Verifique que el ID sea correcto'
            });
        }

        // 📋 INFORMACIÓN DE LA CITA ANTES DE LA CANCELACIÓN
        const estadoAnterior = cita.estado || 'pendiente';
        console.log(`📋 Cita encontrada para cancelar:`);
        console.log(`   👤 Paciente: ${cita.nombre}`);
        console.log(`   📧 Email: ${cita.correo}`);
        console.log(`   📅 Fecha: ${cita.fecha} ${cita.hora}`);
        console.log(`   🏥 Doctor ID: ${cita.doctorId}`);
        console.log(`   📊 Estado actual: ${estadoAnterior}`);

        // ⚠️ VALIDACIONES DE LÓGICA DE NEGOCIO PARA CANCELACIÓN
        const validacionesCancelacion = [];
        
        // Verificar si la cita ya está cancelada
        if (estadoAnterior === 'cancelada') {
            validacionesCancelacion.push('La cita ya está cancelada');
        }
        
        // Verificar si la fecha de la cita ya pasó
        const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
        const ahora = new Date();
        
        if (fechaCita < ahora) {
            validacionesCancelacion.push('No se puede cancelar una cita que ya pasó');
        }

        // Verificar tiempo mínimo para cancelación (ejemplo: 24 horas antes)
        const horasAntesDeCita = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
        const horasMinimasParaCancelar = 24;  // Política de negocio: 24 horas de anticipación
        
        if (horasAntesDeCita < horasMinimasParaCancelar && horasAntesDeCita > 0) {
            validacionesCancelacion.push(
                `Se requieren al menos ${horasMinimasParaCancelar} horas de anticipación para cancelar`
            );
        }

        // Si hay validaciones que impiden la cancelación
        if (validacionesCancelacion.length > 0) {
            console.log(`⚠️ Validaciones fallidas para cancelación:`, validacionesCancelacion);
            return res.status(400).json({
                message: 'No se puede cancelar la cita',
                razones: validacionesCancelacion,
                estadoActual: estadoAnterior,
                fechaCita: `${cita.fecha} ${cita.hora}`,
                politicas: {
                    horasMinimasParaCancelar: horasMinimasParaCancelar,
                    horasRestantes: Math.max(0, Math.floor(horasAntesDeCita))
                }
            });
        }

        // 💾 PREPARACIÓN DE DATOS PARA LA ACTUALIZACIÓN
        const datosActualizacion = {
            estado: 'cancelada',
            // Campos adicionales que podríamos agregar:
            fechaCancelacion: new Date(),
            razonCancelacion: razonCancelacion || 'No especificada',
            canceladoPor: canceladoPor || 'Sistema'
            // ultimaModificacion: new Date()  // Sequelize maneja esto automáticamente con updatedAt
        };

        // 💾 ACTUALIZACIÓN DEL ESTADO A 'CANCELADA'
        await cita.update(datosActualizacion);
        
        // 📊 REGISTRO DE AUDITORÍA - CANCELACIÓN EXITOSA
        console.log(`✅ Cita ID ${id} cancelada exitosamente`);
        console.log(`🔄 Estado: ${estadoAnterior} → cancelada`);
        console.log(`📝 Razón: ${razonCancelacion || 'No especificada'}`);
        console.log(`👤 Cancelada por: ${canceladoPor || 'Sistema'}`);
        
        // 🔔 INFORMACIÓN PARA POSIBLES NOTIFICACIONES FUTURAS
        const informacionNotificacion = {
            emailPaciente: cita.correo,
            nombrePaciente: cita.nombre,
            fechaOriginal: cita.fecha,
            horaOriginal: cita.hora,
            doctorId: cita.doctorId,
            especialidad: cita.especialidad,
            razonCancelacion: razonCancelacion
        };

        // 📧 AQUÍ PODRÍAMOS ENVIAR NOTIFICACIÓN DE CANCELACIÓN AL PACIENTE
        // await enviarNotificacionCancelacion(informacionNotificacion);
        
        // 📊 ESTADÍSTICAS Y MÉTRICAS DE LA CANCELACIÓN
        const estadisticasCancelacion = {
            tiempoAnticipacion: `${Math.floor(horasAntesDeCita)} horas`,
            fechaCancelacion: new Date().toISOString(),
            estadoOriginal: estadoAnterior,
            requiereReprogramacion: true,  // Flag para el frontend
            liberaHorario: true  // El horario del doctor queda libre
        };

        // ✅ RESPUESTA EXITOSA AL CLIENTE
        res.json({ 
            message: 'Cita cancelada exitosamente',
            cita: {
                id: cita.id,
                nombre: cita.nombre,
                correo: cita.correo,
                telefono: cita.telefono,
                fecha: cita.fecha,
                hora: cita.hora,
                doctorId: cita.doctorId,
                especialidad: cita.especialidad,
                modalidad: cita.modalidad,
                estadoAnterior: estadoAnterior,
                estadoActual: 'cancelada',
                razonCancelacion: razonCancelacion || 'No especificada',
                fechaCancelacion: new Date().toISOString()
            },
            // Información adicional útil para el frontend
            estadisticas: estadisticasCancelacion,
            proximasAcciones: [
                'Horario liberado para otros pacientes',
                'Paciente puede reprogramar si lo desea',
                'Notificación enviada al paciente'
            ]
        });
        
    } catch (error) {
        // 🚨 MANEJO DETALLADO DE ERRORES
        const errorId = `CANCEL_ERROR_${Date.now()}`;
        console.error(`❌ ${errorId} - Error al cancelar la cita:`, error);
        console.error(`📋 Detalles del error de cancelación:`, {
            citaId: req.params.id,
            errorName: error.name,
            errorMessage: error.message,
            timestamp: new Date().toISOString()
        });
        
        // Manejo específico de errores de validación de Sequelize
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Error de validación al cancelar la cita',
                errores: error.errors?.map(e => ({
                    campo: e.path,
                    mensaje: e.message,
                    valorRecibido: e.value
                })),
                errorId: errorId
            });
        }
        
        // Error genérico del servidor
        res.status(500).json({ 
            message: 'Error interno del servidor al cancelar la cita',
            errorId: errorId,
            sugerencia: 'Contacte al administrador del sistema con el ID de error',
            timestamp: new Date().toISOString()
        });
    }
};
