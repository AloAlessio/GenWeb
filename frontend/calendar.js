const API_URL = "http://localhost:5000/api";

    document.addEventListener('DOMContentLoaded', () => {
      const calendarEl = document.getElementById('calendar');
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        editable: true,
        selectable: true,
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
        events: async (info, success, failure) => {
          try {
            const res = await fetch(`${API_URL}/citas`);
            const citas = await res.json();
            const events = citas.map(cita => ({
              id: cita.id,
              title: `${cita.nombre} – ${cita.especialidad}`,
              start: `${cita.fecha}T${cita.hora}`,
              extendedProps: cita,
              backgroundColor: cita.modalidad === 'Virtual' ? '#1e90ff' : '#28a745',
              // Store stripe color separately
              borderColor: cita.modalidad === 'Virtual' ? '#1e90ff' : '#28a745'
            }));
            success(events);
          } catch (err) { console.error(err); failure(err); }
        },
        eventDidMount: info => {
          // Apply custom border-left stripe
          const el = info.el;
          el.style.borderLeft = `4px solid ${info.event.extendedProps.modalidad === 'Virtual' ? '#1e90ff' : '#28a745'}`;
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
        }
      });
      calendar.render();

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
            calendar.refetchEvents();
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