window.API_URL = "http://localhost:5000/api";
window.calendar = null; // Variable global para el calendario

document.addEventListener('DOMContentLoaded', () => {
      const calendarEl = document.getElementById('calendar');
      window.calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        editable: true,
        selectable: true,
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
        dateClick: function(info) {
          // Abrir modal para crear nueva cita con la fecha seleccionada
          openNuevaCitaModal(info.dateStr);
        },
        events: async (info, success, failure) => {
          try {
            const res = await fetch(`${API_URL}/citas`);
            const citas = await res.json();
            const events = citas.map(cita => ({
              id: cita.id,
              title: `${cita.nombre} – ${cita.especialidad}`,
              start: `${cita.fecha}T${cita.hora}`,
              extendedProps: cita,
              backgroundColor: getEventColor(cita.estado || 'pendiente'),
              borderColor: getEventColor(cita.estado || 'pendiente')
            }));
            success(events);
          } catch (err) { console.error(err); failure(err); }
        },        eventDidMount: info => {
          // Apply custom border-left stripe based on status
          const el = info.el;
          const estado = info.event.extendedProps.estado || 'pendiente';
          el.style.borderLeft = `4px solid ${getEventColor(estado)}`;
        },
        eventClick: info => {
          const d = info.event.extendedProps;
          const cita = {
            id: info.event.id,
            nombre: d.nombre,
            correo: d.correo,
            telefono: d.telefono,
            doctorId: d.doctorId,
            especialidad: d.especialidad,
            modalidad: d.modalidad,
            fecha: info.event.startStr.slice(0,10),
            hora: info.event.startStr.slice(11,16),
            notas: d.notas
          };
          openEditModal(cita);
        },
        eventDrop: info => {
          updateDateTime(info.event.id, info.event.startStr.slice(0,10), info.event.startStr.slice(11,16));
        },
        eventResize: info => {
          updateDateTime(info.event.id, info.event.startStr.slice(0,10), info.event.endStr.slice(11,16));
        }      });
      
      // Hacer el calendario disponible globalmente para que pueda ser actualizado desde appointments.js
      window.calendar = window.calendar;
      
      window.calendar.render();

      // Modal handlers
      document.querySelector('.modal .close').addEventListener('click', () => document.getElementById('citaModal').style.display = 'none');
      document.getElementById('editCitaForm').addEventListener('submit', async e => {
        e.preventDefault();
        const id = document.getElementById('editCitaId').value;
        const data = {
          nombre: document.getElementById('editNombre').value,
          correo: document.getElementById('editCorreo').value,
          telefono: document.getElementById('editTelefono').value,
          fecha: document.getElementById('editFecha').value,
          hora: document.getElementById('editHora').value,
          notas: document.getElementById('editNotas').value
        };
        try {
          const res = await fetch(`${API_URL}/citas/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
          if (res.ok) {
            Swal.fire('Actualizado','Cita actualizada','success');
            window.calendar.refetchEvents();
            document.getElementById('citaModal').style.display = 'none';
          }
        } catch (err) { console.error(err); }
      });
    });

    function openEditModal(cita) {
      document.getElementById('editCitaId').value = cita.id;
      document.getElementById('editNombre').value = cita.nombre;
      document.getElementById('editCorreo').value = cita.correo;
      document.getElementById('editTelefono').value = cita.telefono;
      document.getElementById('editDoctorId').value = cita.doctorId;
      document.getElementById('editEspecialidad').value = cita.especialidad;
      document.getElementById('editModalidad').value = cita.modalidad;
      document.getElementById('editFecha').value = cita.fecha;
      document.getElementById('editHora').value = cita.hora;
      document.getElementById('editNotas').value = cita.notas;
      document.getElementById('citaModal').style.display = 'flex';
    }

    async function updateDateTime(id, fecha, hora) {
      try {
        await fetch(`${API_URL}/citas/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ fecha, hora }) });
        Swal.fire('Reprogramada','Cita reprogramada','success');
      } catch (err) { console.error(err); Swal.fire('Error','No se pudo actualizar','error'); }
    }

    // Función para abrir modal de nueva cita con fecha preseleccionada
function openNuevaCitaModal(fecha) {
    document.getElementById('nuevaFecha').value = fecha;
    document.getElementById('nuevaCitaModal').style.display = 'flex';
}

// Función para obtener colores según el estado
function getEventColor(estado) {
    switch(estado) {
        case 'confirmada':
            return '#28a745'; // Verde
        case 'cancelada':
            return '#dc3545'; // Rojo
        default:
            return '#ffc107'; // Amarillo para pendiente
    }
}

// Event listeners para el modal de nueva cita
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal de nueva cita
    const closeNuevaCita = document.getElementById('closeNuevaCita');
    if (closeNuevaCita) {
        closeNuevaCita.addEventListener('click', () => {
            document.getElementById('nuevaCitaModal').style.display = 'none';
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('nuevaCitaModal');
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Manejar envío del formulario de nueva cita
    const nuevaCitaForm = document.getElementById('nuevaCitaForm');
    if (nuevaCitaForm) {
        nuevaCitaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nuevaCita = {
                nombre: document.getElementById('nuevoNombre').value,
                correo: document.getElementById('nuevoCorreo').value,
                telefono: document.getElementById('nuevoTelefono').value,
                doctorId: document.getElementById('nuevoDoctorId').value,
                especialidad: document.getElementById('nuevaEspecialidad').value,
                modalidad: document.getElementById('nuevaModalidad').value,
                fecha: document.getElementById('nuevaFecha').value,
                hora: document.getElementById('nuevaHora').value,
                notas: document.getElementById('nuevasNotas').value || '',
                estado: 'pendiente'
            };

            try {
                const response = await fetch(`${window.API_URL}/citas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(nuevaCita)
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire({
                        title: '¡Cita Creada!',
                        text: 'La cita ha sido agendada exitosamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        // Cerrar modal
                        document.getElementById('nuevaCitaModal').style.display = 'none';
                        
                        // Limpiar formulario
                        nuevaCitaForm.reset();
                        
                        // Actualizar calendario
                        if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                            window.calendar.refetchEvents();
                        }
                        
                        // Actualizar lista de citas si existe
                        if (typeof loadCitas === 'function') {
                            loadCitas();
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'Error al crear la cita.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                }
            } catch (error) {
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