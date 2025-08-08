// calendar.js - Configuración y gestión del calendario interactivo
// Utiliza FullCalendar para mostrar, crear y gestionar citas médicas

// ===== CONFIGURACIÓN GLOBAL =====

window.API_URL = "http://localhost:5000/api"; // URL base de la API del backend
window.calendar = null; // Variable global para almacenar la instancia del calendario

// ===== INICIALIZACIÓN DEL CALENDARIO =====

/**
 * Event listener que inicializa el calendario cuando el DOM está listo
 * Configura FullCalendar con todas sus funcionalidades y eventos
 */
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencia al elemento contenedor del calendario
    const calendarEl = document.getElementById('calendar');
    
    // ===== CONFIGURACIÓN DE FULLCALENDAR =====
    
    // Crear nueva instancia de FullCalendar con configuración personalizada
    window.calendar = new FullCalendar.Calendar(calendarEl, {
        // ===== CONFIGURACIÓN BÁSICA =====
        initialView: 'dayGridMonth',     // Vista inicial: mes completo
        locale: 'es',                    // Idioma español para fechas y textos
        
        // ===== CONFIGURACIÓN DE LA BARRA DE HERRAMIENTAS =====
        headerToolbar: { 
            left: 'prev,next today',                      // Izquierda: navegación anterior/siguiente/hoy
            center: 'title',                              // Centro: título del mes/semana/día
            right: 'dayGridMonth,timeGridWeek,timeGridDay' // Derecha: botones de vista mes/semana/día
        },
        
        // ===== CONFIGURACIÓN DE INTERACTIVIDAD =====
        editable: false,    // Deshabilitar edición por drag and drop (comentado para futuro uso)
        selectable: true,   // Permitir selección de fechas para crear nuevas citas
        
        // ===== CONFIGURACIÓN DE FORMATO DE TIEMPO =====
        eventTimeFormat: { 
            hour: '2-digit',    // Formato de hora con 2 dígitos
            minute: '2-digit',  // Formato de minutos con 2 dígitos
            hour12: false       // Formato 24 horas (no AM/PM)
        },
        
        // ===== EVENT HANDLER: CLIC EN FECHA =====
        /**
         * Se ejecuta cuando el usuario hace clic en una fecha del calendario
         * Abre el modal para crear una nueva cita en la fecha seleccionada
         * @param {Object} info - Información de la fecha clickeada
         */
        dateClick: function(info) {
            // Abrir modal para crear nueva cita con la fecha preseleccionada
            openNuevaCitaModal(info.dateStr);
        },
        
        // ===== FUNCIÓN DE CARGA DE EVENTOS =====
        /**
         * Función que carga las citas desde el backend y las convierte en eventos del calendario
         * Se ejecuta automáticamente cuando FullCalendar necesita datos
         * @param {Object} info - Información del rango de fechas
         * @param {Function} success - Callback para datos exitosos
         * @param {Function} failure - Callback para errores
         */
        events: async (info, success, failure) => {
            try {
                // Realizar petición GET al backend para obtener todas las citas
                const res = await fetch(`${API_URL}/citas`);
                const data = await res.json();
                const citas = data.citas || []; // Extraer el array de citas de la respuesta
                
                // Transformar citas del backend en eventos de FullCalendar
                const events = citas.map(cita => ({
                    id: cita.id,                                        // ID único del evento
                    title: `${cita.nombre} – ${cita.especialidad}`,     // Título mostrado en el calendario
                    start: `${cita.fecha}T${cita.hora}`,               // Fecha y hora de inicio (formato ISO)
                    extendedProps: cita,                                // Propiedades adicionales (toda la info de la cita)
                    backgroundColor: getEventColor(cita.estado || 'pendiente'), // Color de fondo según estado
                    borderColor: getEventColor(cita.estado || 'pendiente')      // Color del borde según estado
                }));
                
                // Enviar eventos procesados a FullCalendar
                success(events);
            } catch (err) { 
                console.error(err); 
                failure(err); // Notificar error a FullCalendar
            }
        },
        
        // ===== EVENT HANDLER: RENDERIZADO DE EVENTOS =====
        /**
         * Se ejecuta cuando cada evento se renderiza en el calendario
         * Permite personalizar la apariencia visual de cada cita
         * @param {Object} info - Información del evento renderizado
         */
        eventDidMount: info => {
            // Aplicar borde izquierdo personalizado basado en el estado de la cita
            const el = info.el; // Elemento DOM del evento
            const estado = info.event.extendedProps.estado || 'pendiente';
            el.style.borderLeft = `4px solid ${getEventColor(estado)}`; // Stripe visual del estado
        },
        
        // ===== EVENT HANDLER: CLIC EN EVENTO =====
        /**
         * Se ejecuta cuando el usuario hace clic en una cita del calendario
         * Abre el modal de edición con los datos de la cita seleccionada
         * @param {Object} info - Información del evento clickeado
         */
        eventClick: info => {
            // Extraer datos de la cita desde las propiedades extendidas del evento
            const d = info.event.extendedProps;
            
            // Construir objeto cita con formato esperado por el modal de edición
            const cita = {
                id: info.event.id,
                nombre: d.nombre,
                correo: d.correo,
                telefono: d.telefono,
                doctorId: d.doctorId,
                especialidad: d.especialidad,
                modalidad: d.modalidad,
                fecha: info.event.startStr.slice(0,10), // Extraer solo la fecha (YYYY-MM-DD)
                hora: info.event.startStr.slice(11,16), // Extraer solo la hora (HH:MM)
                notas: d.notas,
                estado: d.estado
            };
            
            // Llamar a la función de appointments.js para abrir modal de edición
            if (typeof openEditModal === 'function') {
                openEditModal(cita, true); // true = modo solo lectura (opcional)
            }
        },
        
        // ===== EVENT HANDLERS: DRAG & DROP (COMENTADOS PARA FUTURO USO) =====
        /**
         * Se ejecuta cuando se arrastra y suelta un evento (cita)
         * Actualiza automáticamente la fecha/hora en el backend
         */
        eventDrop: info => {
            updateDateTime(info.event.id, info.event.startStr.slice(0,10), info.event.startStr.slice(11,16));
        },
        
        /**
         * Se ejecuta cuando se redimensiona un evento
         * Actualiza la duración de la cita en el backend
         */
        eventResize: info => {
            updateDateTime(info.event.id, info.event.startStr.slice(0,10), info.event.endStr.slice(11,16));
        }
    });
    
    // ===== RENDERIZADO Y EXPOSICIÓN GLOBAL =====
    
    // Hacer el calendario disponible globalmente para que pueda ser actualizado desde otros scripts
    window.calendar = window.calendar;
    
    // Renderizar el calendario en el DOM
    window.calendar.render();    // ===== EVENT LISTENERS PARA MODALES (LEGACY) =====
    // Nota: Estos event listeners pueden estar duplicados con appointments.js
    
    // Cerrar modal al hacer clic en la X
    document.querySelector('.modal .close').addEventListener('click', () => 
        document.getElementById('citaModal').style.display = 'none'
    );
    
    // Manejar envío del formulario de edición de citas
    document.getElementById('editCitaForm').addEventListener('submit', async e => {
        e.preventDefault(); // Prevenir envío estándar del formulario
        
        // Obtener ID de la cita a actualizar
        const id = document.getElementById('editCitaId').value;
        
        // Construir objeto con datos actualizados
        const data = {
            nombre: document.getElementById('editNombre').value,
            correo: document.getElementById('editCorreo').value,
            telefono: document.getElementById('editTelefono').value,
            fecha: document.getElementById('editFecha').value,
            hora: document.getElementById('editHora').value,
            notas: document.getElementById('editNotas').value
        };
        
        try {
            // Enviar datos actualizados al backend
            const res = await fetch(`${API_URL}/citas/${id}`, { 
                method:'PUT', 
                headers:{'Content-Type':'application/json'}, 
                body:JSON.stringify(data) 
            });
            
            if (res.ok) {
                // Mostrar mensaje de éxito
                Swal.fire('Actualizado','Cita actualizada','success');
                // Refrescar eventos del calendario
                window.calendar.refetchEvents();
                // Cerrar modal
                document.getElementById('citaModal').style.display = 'none';
            }
        } catch (err) { 
            console.error(err); 
        }
    });
});

// ===== FUNCIONES UTILITARIAS =====

/**
 * Función para actualizar fecha y hora de una cita mediante drag & drop
 * @param {number} id - ID de la cita a actualizar
 * @param {string} fecha - Nueva fecha en formato YYYY-MM-DD
 * @param {string} hora - Nueva hora en formato HH:MM
 */
async function updateDateTime(id, fecha, hora) {
    try {
        // Enviar actualización al backend
        await fetch(`${API_URL}/citas/${id}`, { 
            method:'PUT', 
            headers:{'Content-Type':'application/json'}, 
            body:JSON.stringify({ fecha, hora }) 
        });
        
        // Mostrar confirmación al usuario
        Swal.fire('Reprogramada','Cita reprogramada','success');
    } catch (err) { 
        console.error(err); 
        Swal.fire('Error','No se pudo actualizar','error'); 
    }
}

/**
 * Función para abrir modal de nueva cita con fecha preseleccionada
 * Se ejecuta cuando el usuario hace clic en una fecha del calendario
 * @param {string} fecha - Fecha seleccionada en formato YYYY-MM-DD
 */
function openNuevaCitaModal(fecha) {
    // Preseleccionar la fecha en el formulario
    document.getElementById('nuevaFecha').value = fecha;
    // Mostrar modal de nueva cita
    document.getElementById('nuevaCitaModal').style.display = 'flex';
}

/**
 * Función para obtener colores según el estado de la cita
 * Define la paleta de colores para el código visual del calendario
 * @param {string} estado - Estado de la cita (pendiente, confirmada, cancelada)
 * @returns {string} - Código de color hexadecimal
 */
function getEventColor(estado) {
    switch(estado) {
        case 'confirmada':
            return '#28a745'; // Verde - cita confirmada
        case 'cancelada':
            return '#dc3545'; // Rojo - cita cancelada
        default:
            return '#ffc107'; // Amarillo - cita pendiente (estado por defecto)
    }
}

// ===== EVENT LISTENERS PARA MODAL DE NUEVA CITA =====

/**
 * Configuración de event listeners para el modal de creación de citas
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', function() {
    // ===== CERRAR MODAL DE NUEVA CITA =====
    
    // Event listener para el botón de cierre del modal
    const closeNuevaCita = document.getElementById('closeNuevaCita');
    if (closeNuevaCita) {
        closeNuevaCita.addEventListener('click', () => {
            document.getElementById('nuevaCitaModal').style.display = 'none';
        });
    }

    // ===== CERRAR MODAL AL HACER CLIC FUERA =====
    
    // Event listener para cerrar modal al hacer clic en el overlay
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('nuevaCitaModal');
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ===== MANEJAR ENVÍO DEL FORMULARIO DE NUEVA CITA =====
    
    // Event listener para el formulario de creación de citas
    const nuevaCitaForm = document.getElementById('nuevaCitaForm');
    if (nuevaCitaForm) {
        nuevaCitaForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevenir envío estándar del formulario
            
            // ===== CONSTRUCCIÓN DEL OBJETO NUEVA CITA =====
            
            // Recopilar datos del formulario
            const nuevaCita = {
                nombre: document.getElementById('nuevoNombre').value,
                correo: document.getElementById('nuevoCorreo').value,
                telefono: document.getElementById('nuevoTelefono').value,
                doctorId: document.getElementById('nuevoDoctorId').value,
                especialidad: document.getElementById('nuevaEspecialidad').value,
                modalidad: document.getElementById('nuevaModalidad').value,
                fecha: document.getElementById('nuevaFecha').value,
                hora: document.getElementById('nuevaHora').value,
                notas: document.getElementById('nuevasNotas').value || '', // Campo opcional
                estado: 'pendiente' // Estado inicial por defecto
            };

            try {
                // ===== ENVÍO AL BACKEND =====
                
                // Realizar petición POST para crear nueva cita
                const response = await fetch(`${window.API_URL}/citas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(nuevaCita)
                });

                // Parsear respuesta del servidor
                const data = await response.json();

                if (response.ok) {
                    // ===== ÉXITO EN LA CREACIÓN =====
                    
                    // Mostrar alerta de éxito
                    Swal.fire({
                        title: '¡Cita Creada!',
                        text: 'La cita ha sido agendada exitosamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        // Acciones post-creación
                        
                        // Cerrar modal
                        document.getElementById('nuevaCitaModal').style.display = 'none';
                        
                        // Limpiar formulario para próximo uso
                        nuevaCitaForm.reset();
                        
                        // Actualizar calendario para mostrar la nueva cita
                        if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                            window.calendar.refetchEvents();
                        }
                        
                        // Actualizar lista de citas si la función existe (appointments.js)
                        if (typeof loadCitas === 'function') {
                            loadCitas();
                        }
                    });
                } else {
                    // ===== ERROR EN LA CREACIÓN =====
                    
                    // Mostrar alerta de error con mensaje del servidor
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'Error al crear la cita.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                }
            } catch (error) {
                // ===== ERROR DE CONEXIÓN =====
                
                console.error('Error al crear la cita:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error inesperado. Inténtalo de nuevo.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    }
});