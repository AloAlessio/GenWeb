const Cita = require('../models/Cita'); // Asegúrate de que el modelo está bien importado

exports.crearCita = async (req, res) => {
    try {
        const { nombre, correo, telefono, doctorId, especialidad, modalidad, fecha, hora, notas } = req.body;

        // Validación básica
        if (!nombre || !correo || !telefono || !doctorId || !especialidad || !modalidad || !fecha || !hora) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const nuevaCita = await Cita.create({
            nombre, correo, telefono, doctorId, especialidad, modalidad, fecha, hora, notas
        });

        res.status(201).json({ message: "Cita creada exitosamente", cita: nuevaCita });

    } catch (error) {
        console.error("Error al guardar la cita:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener todas las citas
exports.getAllCitas = async (req, res) => {
    try {        const { fecha, modalidad } = req.query;

        const whereClause = {};
        if (fecha) {
            whereClause.fecha = fecha;
        }
        if (modalidad) {
            whereClause.modalidad = modalidad;
        }

        const citas = await Cita.findAll({ where: whereClause });
        res.json(citas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las citas", error });
    }
};

// Obtener una cita por su ID
exports.getCitaById = async (req, res) => {
    const { id } = req.params;
    try {
        const cita = await Cita.findByPk(id);
        if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
        res.json(cita);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la cita", error });
    }
};

// Actualizar una cita
exports.updateCita = async (req, res) => {
    const { id } = req.params;
    try {
        const cita = await Cita.findByPk(id);
        if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
        await cita.update(req.body);
        res.json({ message: "Cita actualizada exitosamente", cita });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la cita", error });
    }
};

// Eliminar una cita
exports.deleteCita = async (req, res) => {
    const { id } = req.params;
    try {
        const cita = await Cita.findByPk(id);
        if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
        await cita.destroy();
        res.json({ message: "Cita eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la cita", error });
    }
};

// Confirmar una cita
exports.confirmarCita = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Confirmando cita con ID:', id); // Debug
        
        const cita = await Cita.findByPk(id);
        
        if (!cita) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        
        await cita.update({ estado: 'confirmada' });
        console.log('Cita confirmada exitosamente'); // Debug
        
        res.json({ 
            message: 'Cita confirmada exitosamente', 
            cita: cita 
        });
    } catch (error) {
        console.error('Error al confirmar la cita:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
};

// Cancelar una cita
exports.cancelarCita = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Cancelando cita con ID:', id); // Debug
        
        const cita = await Cita.findByPk(id);
        
        if (!cita) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        
        await cita.update({ estado: 'cancelada' });
        console.log('Cita cancelada exitosamente'); // Debug
        
        res.json({ 
            message: 'Cita cancelada exitosamente', 
            cita: cita 
        });
    } catch (error) {
        console.error('Error al cancelar la cita:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
};
