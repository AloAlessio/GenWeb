document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    requireAuth();
    
    // Cargar los datos del doctor seleccionado
    const doctorData = JSON.parse(sessionStorage.getItem('selectedDoctor'));
    if (doctorData) {
        // Rellenar campos del doctor
        document.getElementById('doctorName').value = doctorData.nombre || '';
        document.getElementById('doctorSpecialty').value = doctorData.especialidad || '';
        document.getElementById('doctorMode').value = doctorData.modalidad || '';
        document.getElementById('doctorId').value = doctorData.id || '';

        // Mostrar imagen del doctor si existe el elemento
        const doctorImage = document.getElementById('doctorImage');
        if (doctorImage) {
            doctorImage.src = doctorData.imagen || 'default-doctor.png';
            doctorImage.alt = `Foto de ${doctorData.nombre}`;
        }

        // Deshabilitar los campos del doctor para que no se puedan editar
        document.getElementById('doctorNombre').disabled = true;
        document.getElementById('especialidad').disabled = true;
        document.getElementById('modalidad').disabled = true;
        if (costoField) {
            costoField.disabled = true;
        }
    } else {
        // Si no hay doctor seleccionado, redirigir a la página de selección
        window.location.href = 'citas.html';
    }

    // Configurar el formulario
    const citaForm = document.getElementById('appointmentForm');
    if (citaForm) {
        citaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Recoger todos los datos del formulario
            const formData = {
                doctorId: document.getElementById('doctorId').value,
                doctorNombre: document.getElementById('doctorName').value,
                especialidad: document.getElementById('doctorSpecialty').value,
                modalidad: document.getElementById('doctorMode').value,
                fecha: document.getElementById('fechaCita').value,
                hora: document.getElementById('horaCita').value,
                pacienteNombre: document.getElementById('nombre').value,
                pacienteEmail: document.getElementById('correo').value,
                pacienteTelefono: document.getElementById('telefono').value,
                notas: document.getElementById('notas').value
            };

            try {
                const response = await fetch('http://localhost:5000/api/citas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Error al agendar la cita');
                }

                const result = await response.json();
                
                // Mostrar mensaje de éxito
                alert('¡Cita agendada con éxito!');
                
                // Limpiar sessionStorage
                sessionStorage.removeItem('selectedDoctor');
                
                // Redirigir a la página de confirmación o inicio
                window.location.href = 'index.html';

            } catch (error) {
                console.error('Error:', error);
                alert('Error al agendar la cita. Por favor, intente nuevamente.');
            }
        });
    }
});
