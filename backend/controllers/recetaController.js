// Importamos el modelo Receta para interactuar con la tabla de recetas médicas
const Receta = require('../models/Receta');
// Importamos el modelo Cita para validar que la cita existe
const Cita = require('../models/Cita');
// Importamos el servicio de email para enviar recetas por correo
const { enviarEmailReceta } = require('../services/emailService');

// Definimos una clase para organizar mejor los métodos del controlador
class RecetaController {
    
    // Método estático para crear una nueva receta médica
    static async crearReceta(req, res) {
        try {
            // Destructuramos todos los datos necesarios del cuerpo de la petición
            const { citaId, nombrePaciente, doctorId, medicamento, dosis, frecuencia, duracion, indicaciones } = req.body;
            
            // Validar que todos los campos requeridos estén presentes
            // Las indicaciones son opcionales, por eso no las incluimos
            if (!citaId || !nombrePaciente || !doctorId || !medicamento || !dosis || !frecuencia || !duracion) {
                return res.status(400).json({ 
                    error: 'Todos los campos son requeridos excepto las indicaciones' 
                });
            }

            // Verificar que la cita existe y obtener información del paciente
            // Necesitamos la cita para obtener el email del paciente para enviar la receta
            const cita = await Cita.findByPk(citaId);
            if (!cita) {
                return res.status(404).json({ error: 'La cita no existe' });
            }

            // Verificar si ya existe una receta para esta cita
            // Una cita solo puede tener una receta (relación 1:1)
            const recetaExistente = await Receta.findOne({ where: { citaId } });
            if (recetaExistente) {
                return res.status(400).json({ 
                    error: 'Ya existe una receta para esta cita',
                    recetaId: recetaExistente.id
                });
            }

            // Preparamos los datos de la receta para crear el registro
            const recetaData = {
                citaId,
                nombrePaciente,
                doctorId,
                medicamento,
                dosis,
                frecuencia,
                duracion,
                indicaciones,
                // Obtenemos la fecha actual en formato YYYY-MM-DD
                fecha: new Date().toISOString().split('T')[0]
            };

            // Creamos la nueva receta en la base de datos
            const nuevaReceta = await Receta.create(recetaData);            // Mapeo de doctores para obtener el nombre completo
            // Este mapeo convierte IDs numéricos o nombres parciales a nombres completos
            const obtenerNombreDoctor = (doctorId) => {
                const doctores = {
                    // Mapeo por ID numérico
                    0: "Dr. Gonzalo Mendoza",
                    1: "Dr. Alonso Jimenez", 
                    2: "Dra. Melissa Lara",
                    3: "Dr. Diego Hernandez",
                    4: "Dra. Kelly Palomares", 
                    5: "Dr. Mauricio Rocha",
                    6: "Dr. Alexis Hernandez",
                    // Mapeo por nombre completo (por si ya viene el nombre)
                    "Dr. Alonso Jimenez": "Dr. Alonso Jimenez",
                    "Dra. Melissa Lara": "Dra. Melissa Lara",
                    "Dr. Diego Hernandez": "Dr. Diego Hernandez", 
                    "Dra. Kelly Palomares": "Dra. Kelly Palomares",
                    "Dr. Mauricio Rocha": "Dr. Mauricio Rocha",
                    "Dr. Alexis Hernandez": "Dr. Alexis Hernandez",
                    "Dr. Gonzalo Mendoza": "Dr. Gonzalo Mendoza"
                };
                // Si no encuentra el doctor, devuelve un formato genérico
                return doctores[doctorId] || `Doctor ID: ${doctorId}`;
            };

            // Enviar email de notificación al paciente con la receta
            try {
                // Preparamos los datos necesarios para el email
                const datosEmail = {
                    emailPaciente: cita.correo, // Email del paciente desde la cita
                    nombrePaciente: cita.nombre, // Nombre del paciente desde la cita
                    nombreDoctor: obtenerNombreDoctor(doctorId), // Nombre completo del doctor
                    medicamento,
                    dosis,
                    frecuencia,
                    duracion,
                    indicaciones,
                    // Fecha formateada en español (DD/MM/YYYY)
                    fechaEmision: new Date().toLocaleDateString('es-ES')
                };

                // Intentamos enviar el email usando el servicio de email
                const resultadoEmail = await enviarEmailReceta(datosEmail);
                
                // Si el email se envió correctamente
                if (resultadoEmail.success) {
                    console.log('✅ Email de receta enviado exitosamente');
                } else {
                    // Si falló el email, registramos el error pero no fallamos la creación
                    console.error('⚠️ Error al enviar email:', resultadoEmail.error);
                    // No falla la creación de receta si el email falla
                }
            } catch (emailError) {
                // Si hay error en el servicio de email, lo registramos pero continuamos
                console.error('⚠️ Error en el servicio de email:', emailError);
                // No falla la creación de receta si el email falla
            }
            
            // Devolvemos respuesta exitosa con la receta creada
            res.status(201).json({
                message: 'Receta creada exitosamente',
                receta: nuevaReceta,
                emailEnviado: true // Indicador de que se intentó enviar el email
            });
        } catch (error) {
            // Manejo de errores generales del servidor
            console.error('Error al crear receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }    // Método para obtener una receta específica por ID de cita
    static async obtenerRecetaPorCita(req, res) {
        try {
            // Extraemos el ID de la cita de los parámetros de la URL
            const { citaId } = req.params;
            
            // Validamos que se proporcionó el ID de la cita
            if (!citaId) {
                return res.status(400).json({ error: 'ID de cita es requerido' });
            }

            // Buscamos la receta asociada a esta cita
            // findOne busca un solo registro que coincida con la condición
            const receta = await Receta.findOne({ where: { citaId } });
            
            // Si no se encuentra receta para esta cita
            if (!receta) {
                return res.status(404).json({ error: 'No se encontró receta para esta cita' });
            }

            // Devolvemos la receta encontrada
            res.json(receta);
        } catch (error) {
            // Manejo de errores del servidor
            console.error('Error al obtener receta por cita:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Método para obtener una receta por su ID único
    static async obtenerRecetaPorId(req, res) {
        try {
            // Extraemos el ID de la receta de los parámetros de la URL
            const { id } = req.params;
            
            // Validamos que se proporcionó el ID
            if (!id) {
                return res.status(400).json({ error: 'ID de receta es requerido' });
            }

            // Buscamos la receta por su clave primaria
            const receta = await Receta.findByPk(id);
            
            // Si no se encuentra la receta
            if (!receta) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            // Devolvemos la receta encontrada
            res.json(receta);
        } catch (error) {
            // Manejo de errores del servidor
            console.error('Error al obtener receta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }    // Método para obtener todas las recetas de un doctor específico
    static async obtenerRecetasPorDoctor(req, res) {
        try {
            // Extraemos el ID del doctor de los parámetros de la URL
            const { doctorId } = req.params;
            
            // Validamos que se proporcionó el ID del doctor
            if (!doctorId) {
                return res.status(400).json({ error: 'ID de doctor es requerido' });
            }

            // Buscamos todas las recetas de este doctor
            // order: [['createdAt', 'DESC']] ordena por fecha de creación descendente (más recientes primero)
            const recetas = await Receta.findAll({ 
                where: { doctorId },
                order: [['createdAt', 'DESC']]
            });
            
            // Devolvemos todas las recetas del doctor (puede ser un array vacío)
            res.json(recetas);
        } catch (error) {
            // Manejo de errores del servidor
            console.error('Error al obtener recetas por doctor:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }    // Método para verificar si existe una receta para una cita específica
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