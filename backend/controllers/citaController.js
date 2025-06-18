// Importamos el modelo Cita para interactuar con la tabla de citas médicas
const Cita = require('../models/Cita'); // Asegúrate de que el modelo está bien importado

// Función para crear una nueva cita médica
exports.crearCita = async (req, res) => {
    try {
        // Destructuramos todos los datos necesarios del cuerpo de la petición
        const { nombre, correo, telefono, doctorId, especialidad, modalidad, fecha, hora, notas } = req.body;

        // Validación básica: verificamos que todos los campos obligatorios estén presentes
        // Las notas son opcionales, por eso no las incluimos en la validación
        if (!nombre || !correo || !telefono || !doctorId || !especialidad || !modalidad || !fecha || !hora) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Creamos la nueva cita en la base de datos con todos los datos
        // Sequelize automáticamente asigna un ID único y timestamps si están configurados
        const nuevaCita = await Cita.create({
            nombre, correo, telefono, doctorId, especialidad, modalidad, fecha, hora, notas
        });

        // Devolvemos respuesta exitosa con status 201 (Created) y la cita creada
        res.status(201).json({ message: "Cita creada exitosamente", cita: nuevaCita });

    } catch (error) {
        // Registramos el error en consola para debugging del desarrollador
        console.error("Error al guardar la cita:", error);
        // Devolvemos error genérico 500 al cliente
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Función para obtener todas las citas con filtros opcionales
exports.getAllCitas = async (req, res) => {
    try {
        // Extraemos parámetros de consulta opcionales para filtrar
        // Ejemplo: /api/citas?fecha=2025-06-17&modalidad=Virtual
        const { fecha, modalidad } = req.query;

        // Creamos objeto para las condiciones de búsqueda (WHERE en SQL)
        const whereClause = {};
        
        // Si viene el parámetro fecha, lo agregamos al filtro
        if (fecha) {
            whereClause.fecha = fecha;
        }
        
        // Si viene el parámetro modalidad, lo agregamos al filtro
        if (modalidad) {
            whereClause.modalidad = modalidad;
        }

        // Buscamos todas las citas que cumplan con los filtros
        // Si whereClause está vacío, devuelve todas las citas
        const citas = await Cita.findAll({ where: whereClause });
        
        // Devolvemos las citas encontradas
        res.json(citas);
    } catch (error) {
        // Manejo de errores del servidor
        res.status(500).json({ message: "Error al obtener las citas", error });
    }
};

// Función para obtener una cita específica por su ID
exports.getCitaById = async (req, res) => {
    // Extraemos el ID de los parámetros de la URL (/api/citas/:id)
    const { id } = req.params;
    try {
        // findByPk busca un registro por su clave primaria (Primary Key)
        const cita = await Cita.findByPk(id);
        
        // Si no se encuentra la cita, devolvemos error 404 (Not Found)
        if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
        
        // Si se encuentra, devolvemos la cita
        res.json(cita);
    } catch (error) {
        // Manejo de errores del servidor
        res.status(500).json({ message: "Error al obtener la cita", error });
    }
};

// Función para actualizar una cita existente
exports.updateCita = async (req, res) => {
    // Extraemos el ID de los parámetros de la URL
    const { id } = req.params;
    try {
        // Primero buscamos si la cita existe
        const cita = await Cita.findByPk(id);
        if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
        
        // update() actualiza el registro con los datos del cuerpo de la petición
        // Solo actualiza los campos que vienen en req.body
        await cita.update(req.body);
        
        // Devolvemos confirmación con la cita actualizada
        res.json({ message: "Cita actualizada exitosamente", cita });
    } catch (error) {
        // Manejo de errores del servidor
        res.status(500).json({ message: "Error al actualizar la cita", error });
    }
};

// Función para eliminar una cita
exports.deleteCita = async (req, res) => {
    // Extraemos el ID de los parámetros de la URL
    const { id } = req.params;
    try {
        // Primero verificamos que la cita existe
        const cita = await Cita.findByPk(id);
        if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
        
        // destroy() elimina permanentemente el registro de la base de datos
        await cita.destroy();
        
        // Confirmamos la eliminación
        res.json({ message: "Cita eliminada exitosamente" });
    } catch (error) {
        // Manejo de errores del servidor
        res.status(500).json({ message: "Error al eliminar la cita", error });
    }
};

// Función para confirmar una cita (cambiar estado a 'confirmada')
exports.confirmarCita = async (req, res) => {
    try {
        // Extraemos el ID de los parámetros de la URL
        const { id } = req.params;
        // Log para debugging - ayuda a rastrear qué cita se está confirmando
        console.log('Confirmando cita con ID:', id);
        
        // Buscamos la cita por su ID
        const cita = await Cita.findByPk(id);
        
        // Si no existe la cita, devolvemos error 404
        if (!cita) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        
        // Actualizamos solo el campo 'estado' a 'confirmada'
        // update() permite actualizar campos específicos sin afectar el resto
        await cita.update({ estado: 'confirmada' });
        console.log('Cita confirmada exitosamente'); // Log de confirmación
        
        // Devolvemos respuesta exitosa con la cita actualizada
        res.json({ 
            message: 'Cita confirmada exitosamente', 
            cita: cita 
        });
    } catch (error) {
        // Log del error para debugging del desarrollador
        console.error('Error al confirmar la cita:', error);
        // Respuesta de error al cliente
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
};

// Función para cancelar una cita (cambiar estado a 'cancelada')
exports.cancelarCita = async (req, res) => {
    try {
        // Extraemos el ID de los parámetros de la URL
        const { id } = req.params;
        // Log para debugging - ayuda a rastrear qué cita se está cancelando
        console.log('Cancelando cita con ID:', id);
        
        // Buscamos la cita por su ID
        const cita = await Cita.findByPk(id);
        
        // Si no existe la cita, devolvemos error 404
        if (!cita) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        
        // Actualizamos solo el campo 'estado' a 'cancelada'
        await cita.update({ estado: 'cancelada' });
        console.log('Cita cancelada exitosamente'); // Log de confirmación
        
        // Devolvemos respuesta exitosa con la cita actualizada
        res.json({ 
            message: 'Cita cancelada exitosamente', 
            cita: cita 
        });
    } catch (error) {
        // Log del error para debugging del desarrollador
        console.error('Error al cancelar la cita:', error);
        // Respuesta de error al cliente
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
};
