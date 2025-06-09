// controllers/recetaController.js
const Receta = require('../models/Receta');
const Cita = require('../models/Cita');
const { enviarEmailReceta } = require('../services/emailService');

class RecetaController {    // Crear una nueva receta
    static async crearReceta(req, res) {
        try {
            const { citaId, nombrePaciente, doctorId, medicamento, dosis, frecuencia, duracion, indicaciones } = req.body;
            
            // Validar campos requeridos
            if (!citaId || !nombrePaciente || !doctorId || !medicamento || !dosis || !frecuencia || !duracion) {
                return res.status(400).json({ 
                    error: 'Todos los campos son requeridos excepto las indicaciones' 
                });
            }

            // Verificar que la cita existe y obtener información del paciente
            const cita = await Cita.findByPk(citaId);
            if (!cita) {
                return res.status(404).json({ error: 'La cita no existe' });
            }

            // Verificar si ya existe una receta para esta cita
            const recetaExistente = await Receta.findOne({ where: { citaId } });
            if (recetaExistente) {
                return res.status(400).json({ 
                    error: 'Ya existe una receta para esta cita',
                    recetaId: recetaExistente.id
                });
            }

            const recetaData = {
                citaId,
                nombrePaciente,
                doctorId,
                medicamento,
                dosis,
                frecuencia,
                duracion,
                indicaciones,
                fecha: new Date().toISOString().split('T')[0]
            };

            const nuevaReceta = await Receta.create(recetaData);

            // Mapeo de doctores para obtener el nombre
            const obtenerNombreDoctor = (doctorId) => {
                const doctores = {
                    0: "Dr. Gonzalo Mendoza",
                    1: "Dr. Alonso Jimenez", 
                    2: "Dra. Melissa Lara",
                    3: "Dr. Diego Hernandez",
                    4: "Dra. Kelly Palomares", 
                    5: "Dr. Mauricio Rocha",
                    6: "Dr. Alexis Hernandez",
                    "Dr. Alonso Jimenez": "Dr. Alonso Jimenez",
                    "Dra. Melissa Lara": "Dra. Melissa Lara",
                    "Dr. Diego Hernandez": "Dr. Diego Hernandez", 
                    "Dra. Kelly Palomares": "Dra. Kelly Palomares",
                    "Dr. Mauricio Rocha": "Dr. Mauricio Rocha",
                    "Dr. Alexis Hernandez": "Dr. Alexis Hernandez",
                    "Dr. Gonzalo Mendoza": "Dr. Gonzalo Mendoza"
                };
                return doctores[doctorId] || `Doctor ID: ${doctorId}`;
            };

            // Enviar email de notificación al paciente
            try {
                const datosEmail = {
                    emailPaciente: cita.correo,
                    nombrePaciente: cita.nombre,
                    nombreDoctor: obtenerNombreDoctor(doctorId),
                    medicamento,
                    dosis,
                    frecuencia,
                    duracion,
                    indicaciones,
                    fechaEmision: new Date().toLocaleDateString('es-ES')
                };

                const resultadoEmail = await enviarEmailReceta(datosEmail);
                
                if (resultadoEmail.success) {
                    console.log('✅ Email de receta enviado exitosamente');
                } else {
                    console.error('⚠️ Error al enviar email:', resultadoEmail.error);
                    // No falla la creación de receta si el email falla
                }
            } catch (emailError) {
                console.error('⚠️ Error en el servicio de email:', emailError);
                // No falla la creación de receta si el email falla
            }
            
            res.status(201).json({
                message: 'Receta creada exitosamente',
                receta: nuevaReceta,
                emailEnviado: true // Indicador de que se intentó enviar el email
            });
        } catch (error) {
            console.error('Error al crear receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Obtener receta por ID de cita
    static async obtenerRecetaPorCita(req, res) {
        try {
            const { citaId } = req.params;
            
            if (!citaId) {
                return res.status(400).json({ error: 'ID de cita es requerido' });
            }

            const receta = await Receta.findOne({ where: { citaId } });
            
            if (!receta) {
                return res.status(404).json({ error: 'No se encontró receta para esta cita' });
            }

            res.json(receta);
        } catch (error) {
            console.error('Error al obtener receta por cita:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Obtener receta por ID
    static async obtenerRecetaPorId(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({ error: 'ID de receta es requerido' });
            }

            const receta = await Receta.findByPk(id);
            
            if (!receta) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            res.json(receta);
        } catch (error) {
            console.error('Error al obtener receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Obtener todas las recetas de un doctor
    static async obtenerRecetasPorDoctor(req, res) {
        try {
            const { doctorId } = req.params;
            
            if (!doctorId) {
                return res.status(400).json({ error: 'ID de doctor es requerido' });
            }

            const recetas = await Receta.findAll({ 
                where: { doctorId },
                order: [['createdAt', 'DESC']]
            });
            
            res.json(recetas);
        } catch (error) {
            console.error('Error al obtener recetas por doctor:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Verificar si existe receta para una cita
    static async verificarRecetaExiste(req, res) {
        try {
            const { citaId } = req.params;
            
            if (!citaId) {
                return res.status(400).json({ error: 'ID de cita es requerido' });
            }

            const receta = await Receta.findOne({ where: { citaId } });
            const existe = !!receta;
            
            res.json({ existe });
        } catch (error) {
            console.error('Error al verificar existencia de receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Actualizar una receta
    static async actualizarReceta(req, res) {
        try {
            const { id } = req.params;
            const { medicamento, dosis, frecuencia, duracion, indicaciones } = req.body;
            
            if (!id) {
                return res.status(400).json({ error: 'ID de receta es requerido' });
            }

            // Verificar que la receta existe
            const receta = await Receta.findByPk(id);
            if (!receta) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            const datosActualizacion = {};
            if (medicamento) datosActualizacion.medicamento = medicamento;
            if (dosis) datosActualizacion.dosis = dosis;
            if (frecuencia) datosActualizacion.frecuencia = frecuencia;
            if (duracion) datosActualizacion.duracion = duracion;
            if (indicaciones !== undefined) datosActualizacion.indicaciones = indicaciones;

            await receta.update(datosActualizacion);
            
            res.json({
                message: 'Receta actualizada exitosamente',
                receta
            });
        } catch (error) {
            console.error('Error al actualizar receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Eliminar una receta
    static async eliminarReceta(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({ error: 'ID de receta es requerido' });
            }

            // Verificar que la receta existe
            const receta = await Receta.findByPk(id);
            if (!receta) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            await receta.destroy();
            
            res.json({
                message: 'Receta eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = {
    crearReceta: RecetaController.crearReceta,
    obtenerRecetaPorId: RecetaController.obtenerRecetaPorId,
    obtenerRecetaPorCita: RecetaController.obtenerRecetaPorCita,
    obtenerRecetasPorDoctor: RecetaController.obtenerRecetasPorDoctor,
    verificarRecetaExiste: RecetaController.verificarRecetaExiste,
    actualizarReceta: RecetaController.actualizarReceta,
    eliminarReceta: RecetaController.eliminarReceta
};