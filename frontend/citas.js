// Variable global para almacenar todos los doctores
let allDoctors = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando carga de doctores...');
    // Cargar doctores al inicio
    fetchDoctors();

    // Configurar event listeners para los filtros
    const especialidadSelect = document.getElementById('especialidad');
    const modalidadSelect = document.getElementById('modo');
    const fechaInput = document.getElementById('fecha');
    const buscarBtn = document.getElementById('buscarBtn');

    if (buscarBtn) {
        buscarBtn.addEventListener('click', aplicarFiltros);
    }

    // Event listeners para actualización en tiempo real (opcional)
    if (especialidadSelect) {
        especialidadSelect.addEventListener('change', aplicarFiltros);
    }
    if (modalidadSelect) {
        modalidadSelect.addEventListener('change', aplicarFiltros);
    }
    if (fechaInput) {
        fechaInput.addEventListener('change', aplicarFiltros);
    }
});

async function fetchDoctors() {
    try {
        console.log('Realizando petición a la API de doctores...');
        const response = await fetch("http://localhost:5000/api/doctors");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Respuesta del servidor:", data);
        
        // Guardar todos los doctores en la variable global
        allDoctors = data.doctors || [];
        console.log("Doctores cargados:", allDoctors);

        // Mostrar los doctores con los filtros actuales
        aplicarFiltros();

    } catch (error) {
        console.error("Error cargando doctores:", error);
        mostrarError("Error al cargar los especialistas. Por favor, intenta de nuevo más tarde.");
    }
}

function aplicarFiltros() {
    console.log('Aplicando filtros...');
    
    // Obtener valores de los filtros
    const especialidad = document.getElementById('especialidad')?.value || '';
    const modalidad = document.getElementById('modo')?.value || '';
    const fecha = document.getElementById('fecha')?.value || '';

    console.log('Filtros seleccionados:', { especialidad, modalidad, fecha });

    // Filtrar doctores
    let doctoresFiltrados = allDoctors;

    if (especialidad) {
        doctoresFiltrados = doctoresFiltrados.filter(doctor => 
            doctor.especialidad.toLowerCase() === especialidad.toLowerCase()
        );
    }

    if (modalidad) {
        doctoresFiltrados = doctoresFiltrados.filter(doctor => 
            doctor.modalidad.toLowerCase() === modalidad.toLowerCase()
        );
    }

    // Mostrar resultados filtrados
    mostrarDoctores(doctoresFiltrados);
}

function mostrarDoctores(doctores) {
    const resultsContainer = document.querySelector(".search-results") || document.getElementById("results");
    if (!resultsContainer) {
        console.error("Error: No se encontró el contenedor de resultados");
        return;
    }

    resultsContainer.innerHTML = '';

    if (!doctores.length) {
        resultsContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                No se encontraron especialistas con los filtros seleccionados.
            </div>`;
        return;
    }

    // Aplicar estilo al contenedor de resultados para mostrar las tarjetas en grid
    resultsContainer.style.display = 'grid';
    resultsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    resultsContainer.style.gap = '40px';
    resultsContainer.style.padding = '40px';
    resultsContainer.style.maxWidth = '1400px';
    resultsContainer.style.margin = '0 auto';

    doctores.forEach(doctor => {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        // Estilos para la tarjeta individual
        card.style.border = '1px solid #ddd';
        card.style.borderRadius = '8px';
        card.style.overflow = 'hidden';
        card.style.backgroundColor = '#fff';
        card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        card.style.transition = 'transform 0.2s ease-in-out';

        card.innerHTML = `
            <div class="doctor-photo" style="
                width: 180px;
                height: 180px;
                margin: 20px auto;
                border-radius: 50%;
                overflow: hidden;
                position: relative;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <img src="${doctor.imagen || 'default-doctor.png'}" 
                     alt="Foto de ${doctor.nombre}" 
                     onerror="this.src='default-doctor.png'"
                     style="width: 100%; 
                            height: 100%; 
                            object-fit: cover;
                            object-position: center center;">
            </div>
            <div class="doctor-info" style="padding: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 1.2em;">${doctor.nombre}</h3>
                <p class="specialty" style="margin: 5px 0; color: #34495e;">
                    <i class="fas fa-stethoscope" style="margin-right: 8px; color: #3498db;"></i>
                    ${doctor.especialidad}
                </p>
                <p class="modality" style="margin: 5px 0; color: #34495e;">
                    <i class="fas fa-laptop-medical" style="margin-right: 8px; color: #3498db;"></i>
                    ${doctor.modalidad}
                </p>
                ${doctor.experiencia ? `
                    <p class="experience" style="margin: 5px 0; color: #34495e;">
                        <i class="fas fa-user-md" style="margin-right: 8px; color: #3498db;"></i>
                        ${doctor.experiencia} años de experiencia
                    </p>
                ` : ''}
                ${doctor.costo ? `
                    <p class="cost" style="margin: 5px 0; color: #34495e;">
                        <i class="fas fa-dollar-sign" style="margin-right: 8px; color: #3498db;"></i>
                        Consulta: $${doctor.costo}
                    </p>
                ` : ''}
                <button class="btn-primary" 
                        onclick="seleccionarDoctor(${JSON.stringify(doctor).replace(/"/g, '&quot;')})"
                        style="width: 100%; 
                               padding: 10px; 
                               margin-top: 15px;
                               background-color: #3498db;
                               color: white;
                               border: none;
                               border-radius: 5px;
                               cursor: pointer;
                               transition: background-color 0.2s ease;">
                    Seleccionar
                </button>
            </div>
        `;

        // Agregar efecto hover a la tarjeta
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';
        resultsContainer.appendChild(card);
    });
}

function mostrarError(mensaje) {
    const resultsContainer = document.querySelector(".search-results") || document.getElementById("results");
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                ${mensaje}
            </div>`;
    }
}

// Función para seleccionar un doctor y continuar con el proceso de cita
function seleccionarDoctor(doctor) {
    // Guardar la selección en sessionStorage con más detalles
    const doctorData = {
        id: doctor.id,
        nombre: doctor.nombre,
        especialidad: doctor.especialidad,
        modalidad: doctor.modalidad,
        costo: doctor.costo || '',
        imagen: doctor.imagen || 'default-doctor.png'
    };
    
    sessionStorage.setItem('selectedDoctor', JSON.stringify(doctorData));
    // Redirigir al formulario de cita
    window.location.href = 'citas_forms.html';
}
