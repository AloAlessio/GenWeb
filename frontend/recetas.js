// Función para abrir el modal de receta
function abrirModalReceta(citaId) {
    const cita = obtenerCitaPorId(citaId); // Debes implementar esta función
    if (!cita) return;

    // Rellenar los campos del modal con la información de la cita
    document.getElementById('recetaCitaId').value = citaId;
    document.getElementById('recetaNombrePaciente').value = cita.pacienteNombre;
    document.getElementById('recetaDoctorId').value = cita.doctorNombre;

    // Mostrar el modal
    document.getElementById('recetaModal').style.display = 'block';
}

// Función para cerrar el modal de receta
function cerrarModalReceta() {
    document.getElementById('recetaModal').style.display = 'none';
}

// Función para generar la receta
async function generarReceta(event) {
    event.preventDefault();

    // Recopilar todos los datos del formulario
    const emailPaciente = document.querySelector('[data-email]')?.textContent || 
                         sessionStorage.getItem('pacienteEmail') || 
                         document.getElementById('editCorreo')?.value;
    
    console.log('Email del paciente encontrado:', emailPaciente); // Log temporal para debugging
    
    const recetaData = {
        citaId: document.getElementById('recetaCitaId').value,
        paciente: document.getElementById('recetaNombrePaciente').value,
        doctor: document.getElementById('recetaDoctorId').value,
        medicamento: document.getElementById('recetaMedicamento').value,
        dosis: document.getElementById('recetaDosis').value,
        frecuencia: document.getElementById('recetaFrecuencia').value,
        duracion: document.getElementById('recetaDuracion').value,
        indicaciones: document.getElementById('recetaIndicaciones').value,
        fecha: new Date().toLocaleDateString(),
        emailPaciente: emailPaciente
    };

    // Guardar inmediatamente en sessionStorage para no perder los datos
    sessionStorage.setItem('ultimaReceta', JSON.stringify(recetaData));

    try {
        const response = await fetch('http://localhost:5000/api/recetas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recetaData)
        });

        if (!response.ok) {
            throw new Error('Error al generar la receta');
        }

        const result = await response.json();
        
        // Combinar los datos originales con la respuesta del servidor
        const recetaCompleta = {
            ...recetaData,
            id: result.id,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        };
        
        // Guardar la receta completa
        sessionStorage.setItem('ultimaReceta', JSON.stringify(recetaCompleta));
        
        // Mostrar mensaje de éxito
        Swal.fire({
            title: '¡Receta generada!',
            text: 'La receta médica se ha generado correctamente',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Ver Receta',
            cancelButtonText: 'Cerrar'
        }).then((result) => {
            if (result.isConfirmed) {
                verReceta();
            }
            cerrarModalReceta();
        });

    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo generar la receta. Por favor, intente nuevamente.',
            icon: 'error'
        });
    }
}

// Función para ver la receta
function verReceta() {
    let recetaData = JSON.parse(sessionStorage.getItem('ultimaReceta'));
    console.log('Datos de la receta recuperados:', recetaData); // Para depuración
    
    // Si no hay receta en sessionStorage, intentar obtener los datos del formulario
    if (!recetaData || !recetaData.medicamento) {
        recetaData = {
            paciente: document.getElementById('recetaNombrePaciente')?.value,
            doctor: document.getElementById('recetaDoctorId')?.value,
            medicamento: document.getElementById('recetaMedicamento')?.value,
            dosis: document.getElementById('recetaDosis')?.value,
            frecuencia: document.getElementById('recetaFrecuencia')?.value,
            duracion: document.getElementById('recetaDuracion')?.value,
            indicaciones: document.getElementById('recetaIndicaciones')?.value,
            fecha: new Date().toLocaleDateString()
        };
        console.log('Datos obtenidos del formulario:', recetaData); // Para depuración
    }

    // Verificar que tengamos los datos mínimos necesarios
    if (!recetaData.paciente || !recetaData.doctor || !recetaData.medicamento) {
        Swal.fire({
            title: 'Error',
            text: 'No se encontraron los datos de la receta',
            icon: 'error'
        });
        return;
    }

    console.log('Generando HTML con datos:', recetaData); // Para depuración

    // Crear el contenido HTML de la receta
    const recetaHTML = `
        <div class="receta-medica" style="padding: 20px; max-width: 800px; margin: auto;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2>Receta Médica</h2>
                <p>Fecha: ${recetaData.fecha || new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p><strong>Paciente:</strong> ${recetaData.paciente}</p>
                <p><strong>Doctor:</strong> ${recetaData.doctor}</p>
            </div>
            
            <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 20px;">
                <p><strong>Medicamento:</strong> ${recetaData.medicamento}</p>
                <p><strong>Dosis:</strong> ${recetaData.dosis}</p>
                <p><strong>Frecuencia:</strong> ${recetaData.frecuencia}</p>
                <p><strong>Duración:</strong> ${recetaData.duracion}</p>
                ${recetaData.indicaciones ? `<p><strong>Indicaciones especiales:</strong> ${recetaData.indicaciones}</p>` : ''}
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
                <div style="border-top: 1px solid #000; width: 200px; margin: auto;">
                    <p style="margin-top: 5px;">Firma del médico</p>
                </div>
            </div>
        </div>
    `;

    // Mostrar la receta en un modal de SweetAlert2
    Swal.fire({
        title: 'Receta Médica',
        html: recetaHTML,
        width: 800,
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Imprimir',
        showCancelButton: true,
        cancelButtonText: 'Cerrar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Imprimir la receta
            const ventanaImpresion = window.open('', '_blank');
            ventanaImpresion.document.write(`
                <html>
                    <head>
                        <title>Receta Médica</title>
                    </head>
                    <body>
                        ${recetaHTML}
                    </body>
                </html>
            `);
            ventanaImpresion.document.close();
            ventanaImpresion.print();
        }
    });
}

// Función auxiliar para obtener una cita por su ID
function obtenerCitaPorId(citaId) {
    // Intentar obtener la cita del sessionStorage
    const citasGuardadas = JSON.parse(sessionStorage.getItem('citas') || '[]');
    const cita = citasGuardadas.find(c => c.id === citaId);

    if (cita) {
        return {
            id: citaId,
            pacienteNombre: cita.pacienteNombre,
            doctorNombre: cita.doctorNombre
        };
    }

    // Si no se encuentra en sessionStorage, intentar obtener de los campos del formulario
    const nombrePaciente = document.getElementById('editNombre')?.value;
    const nombreDoctor = document.getElementById('editDoctorId')?.value;

    if (nombrePaciente && nombreDoctor) {
        return {
            id: citaId,
            pacienteNombre: nombrePaciente,
            doctorNombre: nombreDoctor
        };
    }

    // Si todo falla, intentar obtener del modal actual
    return {
        id: citaId,
        pacienteNombre: document.querySelector('[data-paciente]')?.textContent,
        doctorNombre: document.querySelector('[data-doctor]')?.textContent
    };
}
