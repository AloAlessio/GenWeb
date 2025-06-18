// appointments.js - Script principal para la gestión de citas médicas
// Funcionalidades: CRUD de citas, filtros, calendario, recetas médicas

// ===== FUNCIONES UTILITARIAS =====

/**
 * Mapeo de IDs de doctores a nombres completos
 * Permite convertir IDs numéricos o strings de doctores a nombres legibles
 * @param {string|number} doctorId - ID del doctor (puede ser numérico o string)
 * @returns {string} - Nombre completo del doctor
 */
function obtenerNombreDoctor(doctorId) {
    // Objeto que mapea diferentes formatos de ID a nombres de doctores
    const doctores = {
        // IDs numéricos para compatibilidad con base de datos
        0: "Dr. Gonzalo Mendoza",
        1: "Dr. Alonso Jimenez", 
        2: "Dra. Melissa Lara",
        3: "Dr. Diego Hernandez",
        4: "Dra. Kelly Palomares", 
        5: "Dr. Mauricio Rocha",
        6: "Dr. Alexis Hernandez",
        // IDs de string para compatibilidad con formularios
        "Dr. Alonso Jimenez": "Dr. Alonso Jimenez",
        "Dra. Melissa Lara": "Dra. Melissa Lara",
        "Dr. Diego Hernandez": "Dr. Diego Hernandez", 
        "Dra. Kelly Palomares": "Dra. Kelly Palomares",
        "Dr. Mauricio Rocha": "Dr. Mauricio Rocha",
        "Dr. Alexis Hernandez": "Dr. Alexis Hernandez",
        "Dr. Gonzalo Mendoza": "Dr. Gonzalo Mendoza"
    };
    
    // Retorna el nombre del doctor si existe, sino retorna un mensaje con el ID
    return doctores[doctorId] || `Doctor ID: ${doctorId}`;
}

// ===== GESTIÓN DE CITAS =====

/**
 * Función principal para cargar y renderizar las citas médicas
 * Aplica filtros opcionales y muestra las citas en un carrusel interactivo
 * @param {Object} filtros - Objeto con filtros opcionales (fecha, tipo)
 */
async function loadCitas(filtros = {}) {
    try {
        // Log para depuración de filtros aplicados
        console.log('loadCitas llamada con filtros:', filtros);
        
        // Construcción de la URL base para la API de citas
        let url = `${window.API_URL}/citas`;
        const params = new URLSearchParams(); // Objeto para manejar parámetros de consulta

        // Aplicar filtro por fecha si está presente
        if (filtros.fecha) {
            console.log('Agregando filtro fecha:', filtros.fecha);
            params.append('fecha', filtros.fecha);
        }
        
        // Aplicar filtro por tipo/modalidad si está presente y no está vacío
        if (filtros.tipo && filtros.tipo !== "") {
            console.log('Agregando filtro tipo:', filtros.tipo);
            params.append('modalidad', filtros.tipo);
        }

        // Agregar parámetros a la URL si existen filtros
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        // Log de la URL final para depuración
        console.log('URL de búsqueda:', url, 'Filtros:', filtros);

        // Realizar petición HTTP GET al backend
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.status}`);
        }

        // Parsear respuesta JSON
        const citas = await response.json();
        if (!Array.isArray(citas)) {
            throw new Error('La respuesta del servidor no es un array de citas.');
        }

        // Obtener referencia al contenedor de las citas
        const citasList = document.getElementById("citasList");
        citasList.innerHTML = ""; // Limpiar contenido previo

        // Mostrar mensaje si no hay citas
        if (citas.length === 0) {
            citasList.innerHTML = "<p class='no-results'>No hay citas registradas.</p>";
            return;
        }

        // ===== CONSTRUCCIÓN DEL CARRUSEL =====
        
        // Crear contenedor principal del carrusel
        const carouselContainer = document.createElement("div");
        carouselContainer.className = "carousel-container";

        // Crear wrapper/contenedor deslizable para las tarjetas
        const carouselWrapper = document.createElement("div");
        carouselWrapper.className = "carousel-wrapper";

        // Crear botón de navegación anterior (izquierda)
        const prevButton = document.createElement("button");
        prevButton.innerHTML = "<i class='fas fa-chevron-left'></i>";
        prevButton.className = "carousel-button prev";

        // Crear botón de navegación siguiente (derecha)
        const nextButton = document.createElement("button");
        nextButton.innerHTML = "<i class='fas fa-chevron-right'></i>";
        nextButton.className = "carousel-button next";        // ===== GENERACIÓN DE TARJETAS DE CITAS =====
        
        // Iterar sobre cada cita y crear su tarjeta correspondiente
        citas.forEach(async cita => {
            // Crear elemento div para la tarjeta de la cita
            const card = document.createElement("div");
            card.className = "carousel-card";
            
            // ===== DETERMINACIÓN DEL ESTADO DE LA CITA =====
            
            // Determinar el color y texto del badge según el estado de la cita
            let estadoBadge = '';
            switch(cita.estado) {
                case 'confirmada':
                    // Badge verde para citas confirmadas
                    estadoBadge = '<span class="estado-badge estado-confirmada">Confirmada</span>';
                    break;
                case 'cancelada':
                    // Badge rojo para citas canceladas
                    estadoBadge = '<span class="estado-badge estado-cancelada">Cancelada</span>';
                    break;
                default:
                    // Badge amarillo para citas pendientes (estado por defecto)
                    estadoBadge = '<span class="estado-badge estado-pendiente">Pendiente</span>';
            }
            
            // ===== BOTONES DE ACCIÓN SEGÚN ESTADO =====
            
            // Generar botones de acción basados en el estado actual de la cita
            let botonesAccion = '';
            if (cita.estado === 'pendiente') {
                // Solo mostrar botones de confirmar/cancelar si la cita está pendiente
                botonesAccion = `
                    <button class="btn-confirmar" onclick="confirmarCita(${cita.id})">
                        <i class="fa fa-check"></i> Confirmar
                    </button>
                    <button class="btn-cancelar" onclick="cancelarCita(${cita.id})">
                        <i class="fa fa-times"></i> Cancelar
                    </button>
                `;
            }

            // ===== VERIFICACIÓN Y BOTÓN DE RECETAS =====
            
            // Verificar si ya existe una receta para esta cita
            let botonReceta = '';
            try {
                // Consultar al backend si existe receta para la cita actual
                const responseReceta = await fetch(`${window.API_URL}/recetas/existe/${cita.id}`);
                const dataReceta = await responseReceta.json();
                
                if (dataReceta.existe) {
                    // Si existe receta, mostrar botón para verla
                    botonReceta = `
                        <button class="btn-ver-receta" onclick="verReceta(${cita.id})">
                            <i class="fa fa-eye"></i> Ver Receta
                        </button>
                    `;
                } else {
                    // Si no existe receta, mostrar botón para crearla
                    botonReceta = `
                        <button class="btn-recetar" onclick="abrirModalReceta(${cita.id}, '${cita.nombre}', '${cita.doctorId}')">
                            <i class="fa fa-prescription-bottle-medical"></i> Recetar
                        </button>
                    `;
                }
            } catch (error) {
                console.error('Error al verificar receta:', error);
                // Si hay error al verificar, mostrar botón de recetar por defecto
                botonReceta = `
                    <button class="btn-recetar" onclick="abrirModalReceta(${cita.id}, '${cita.nombre}', '${cita.doctorId}')">
                        <i class="fa fa-prescription-bottle-medical"></i> Recetar
                    </button>
                `;
            }

            // ===== CONSTRUCCIÓN DEL HTML DE LA TARJETA =====
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #2C3E50;">${cita.nombre}</h3>
                    ${estadoBadge}
                </div>
                <p><i class="fa fa-envelope" style="color: #1e90ff; margin-right: 8px;"></i>${cita.correo}</p>
                <p><i class="fa fa-phone" style="color: #1e90ff; margin-right: 8px;"></i>${cita.telefono}</p>
                <p><i class="fa fa-user-md" style="color: #1e90ff; margin-right: 8px;"></i>${obtenerNombreDoctor(cita.doctorId)}</p>
                <p><i class="fa fa-stethoscope" style="color: #1e90ff; margin-right: 8px;"></i>${cita.especialidad}</p>
                <p><i class="fa fa-laptop-medical" style="color: #1e90ff; margin-right: 8px;"></i>${cita.modalidad}</p>
                <p><i class="fa fa-calendar" style="color: #1e90ff; margin-right: 8px;"></i>${cita.fecha}</p>
                <p><i class="fa fa-clock" style="color: #1e90ff; margin-right: 8px;"></i>${cita.hora}</p>
                ${cita.notas ? `<p><i class="fa fa-sticky-note" style="color: #1e90ff; margin-right: 8px;"></i>${cita.notas}</p>` : ''}
                <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    ${botonesAccion}
                    <button class="btn-cta" onclick="openEditModal(${JSON.stringify(cita).replace(/"/g, '&quot;')})">
                        <i class="fa fa-edit"></i> Ver/Editar
                    </button>
                    ${botonReceta}
                    <button class="btn-cta btn-delete" onclick="deleteCita(${cita.id})">
                        <i class="fa fa-trash"></i> Eliminar
                    </button>
                </div>
            `;
            /* Explicación de los elementos de la tarjeta:
             * - Encabezado: nombre del paciente y badge de estado
             * - Información de contacto: correo y teléfono con iconos
             * - Información médica: doctor, especialidad, modalidad
             * - Información temporal: fecha y hora
             * - Notas: se muestran solo si existen
             * - Botones de acción: confirmar/cancelar (solo pendientes), editar, recetar, eliminar
             * - JSON.stringify().replace() escapa las comillas para evitar errores en onclick
             */
            
            // Agregar la tarjeta al wrapper del carrusel
            carouselWrapper.appendChild(card);
        });        // ===== ENSAMBLAJE DEL CARRUSEL =====
        
        // Agregar elementos al DOM en el orden correcto
        carouselContainer.appendChild(prevButton);    // Botón anterior a la izquierda
        carouselContainer.appendChild(carouselWrapper); // Contenedor deslizable en el centro
        carouselContainer.appendChild(nextButton);     // Botón siguiente a la derecha
        citasList.appendChild(carouselContainer);      // Agregar todo al contenedor principal

        // ===== CONFIGURACIÓN DE NAVEGACIÓN DEL CARRUSEL =====
        
        // Event listener para el botón de navegación anterior (izquierda)
        prevButton.addEventListener('click', () => {
            carouselWrapper.scrollBy({
                left: -320, // Desplazamiento hacia la izquierda (320px = ancho de una tarjeta)
                behavior: 'smooth' // Animación suave del desplazamiento
            });
        });

        // Event listener para el botón de navegación siguiente (derecha)
        nextButton.addEventListener('click', () => {
            carouselWrapper.scrollBy({
                left: 320, // Desplazamiento hacia la derecha (320px = ancho de una tarjeta)
                behavior: 'smooth' // Animación suave del desplazamiento
            });
        });

        // ===== GESTIÓN DEL ESTADO DE BOTONES DE NAVEGACIÓN =====
        
        /**
         * Función para actualizar la visibilidad/estado de los botones de navegación
         * Los botones se desactivan cuando se llega al inicio o final del carrusel
         */
        function updateButtonStates() {
            // Posición actual del scroll (0 = inicio)
            const scrollLeft = carouselWrapper.scrollLeft;
            // Máximo scroll posible (ancho total - ancho visible)
            const maxScroll = carouselWrapper.scrollWidth - carouselWrapper.clientWidth;
            
            // Desactivar botón anterior si está al inicio
            prevButton.style.opacity = scrollLeft <= 0 ? "0.5" : "1";
            prevButton.style.pointerEvents = scrollLeft <= 0 ? "none" : "auto";
            
            // Desactivar botón siguiente si está al final
            nextButton.style.opacity = scrollLeft >= maxScroll ? "0.5" : "1";
            nextButton.style.pointerEvents = scrollLeft >= maxScroll ? "none" : "auto";
        }

        // Escuchar eventos de scroll para actualizar estado de botones
        carouselWrapper.addEventListener('scroll', updateButtonStates);
        
        // Inicializar estado de botones después de que se renderice el carrusel
        setTimeout(updateButtonStates, 100);
        
    } catch (error) {
        // ===== MANEJO DE ERRORES =====
        
        console.error("Error al cargar las citas:", error);
        // Mostrar alerta de error al usuario usando SweetAlert2
        Swal.fire({
            title: "Error",
            text: "No se pudieron cargar las citas. Intenta más tarde.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

// ===== MODAL DE EDICIÓN DE CITAS =====

/**
 * Abrir el modal de edición y cargar los datos de la cita seleccionada
 * Puede recibir un objeto cita completo o solo un ID para buscar la cita
 * @param {Object|number} citaOrId - Objeto cita completo o ID de la cita
 */
async function openEditModal(citaOrId) {
    try {
        let cita;

        // Determinar si se recibió un objeto cita o un ID
        if (typeof citaOrId === 'object') {
            // Si se pasa un objeto cita directamente, usarlo
            cita = citaOrId;
        } else {
            // Si se pasa un ID, hacer petición al backend para obtener la cita
            const response = await fetch(`${window.API_URL}/citas/${citaOrId}`);
            cita = await response.json();
        }

        // ===== LLENAR CAMPOS DEL FORMULARIO DE EDICIÓN =====
        
        // Campos ocultos para identificación
        document.getElementById("editCitaId").value = cita.id;
        document.getElementById("editEstado").value = cita.estado || 'pendiente';
        
        // Campos de información del paciente
        document.getElementById("editNombre").value = cita.nombre;
        document.getElementById("editCorreo").value = cita.correo;
        document.getElementById("editTelefono").value = cita.telefono;
        
        // Campos de información médica
        document.getElementById("editDoctorId").value = cita.doctorId;
        document.getElementById("editEspecialidad").value = cita.especialidad;
        document.getElementById("editModalidad").value = cita.modalidad;
        
        // Campos de fecha y hora
        document.getElementById("editFecha").value = cita.fecha;
        document.getElementById("editHora").value = cita.hora;
        
        // Campo de notas (opcional)
        document.getElementById("editNotas").value = cita.notas || "";
        
        // ===== ACTUALIZACIÓN DEL ESTADO EN EL MODAL =====
        
        // Obtener estado actual de la cita
        const estado = cita.estado || 'pendiente';
        
        // Actualizar badge de estado en el modal
        const estadoBadgeModal = document.getElementById("estadoBadgeModal");
        estadoBadgeModal.className = `estado-badge estado-${estado}`;
        
        // Actualizar texto del badge según el estado
        switch(estado) {
            case 'confirmada':
                estadoBadgeModal.textContent = 'CONFIRMADA';
                break;
            case 'cancelada':
                estadoBadgeModal.textContent = 'CANCELADA';
                break;
            default:
                estadoBadgeModal.textContent = 'PENDIENTE';
        }
        
        // ===== MOSTRAR/OCULTAR BOTONES SEGÚN ESTADO =====
        
        // Obtener referencias a los botones de acción del modal
        const btnConfirmarModal = document.getElementById("btnConfirmarModal");
        const btnCancelarModal = document.getElementById("btnCancelarModal");
        
        // Solo mostrar botones de confirmar/cancelar si la cita está pendiente
        if (estado === 'pendiente') {
            btnConfirmarModal.style.display = 'inline-block';
            btnCancelarModal.style.display = 'inline-block';
        } else {
            // Ocultar botones si la cita ya está confirmada o cancelada
            btnConfirmarModal.style.display = 'none';
            btnCancelarModal.style.display = 'none';
        }

        // Mostrar el modal
        document.getElementById("citaModal").style.display = "flex";
        
    } catch (error) {
        console.error("Error al obtener la cita:", error);
        // Mostrar alerta de error al usuario
        Swal.fire({
            title: "Error",
            text: "No se pudieron cargar los datos de la cita.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

// ===== EVENT LISTENERS DEL MODAL =====

// Event listener para cerrar modal al hacer clic en la "X"
const closeModalBtn = document.querySelector(".modal .close");
if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        document.getElementById("citaModal").style.display = "none";
    });
}

// Event listeners para botones del modal - Se ejecutan cuando el DOM está listo
document.addEventListener("DOMContentLoaded", function() {
    // ===== BOTÓN CONFIRMAR DEL MODAL =====
    const btnConfirmarModal = document.getElementById("btnConfirmarModal");
    if (btnConfirmarModal) {
        btnConfirmarModal.addEventListener("click", () => {
            // Obtener ID de la cita desde el campo oculto
            const citaId = document.getElementById("editCitaId").value;
            // Llamar función de confirmación específica del modal
            confirmarCitaDesdeModal(citaId);
        });
    }
    
    // ===== BOTÓN CANCELAR DEL MODAL =====
    const btnCancelarModal = document.getElementById("btnCancelarModal");
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener("click", () => {
            // Obtener ID de la cita desde el campo oculto
            const citaId = document.getElementById("editCitaId").value;
            // Llamar función de cancelación específica del modal
            cancelarCitaDesdeModal(citaId);
        });
    }
});

// ===== FUNCIONES DE CAMBIO DE ESTADO DE CITAS =====

/**
 * Función para confirmar una cita desde el modal de edición
 * Realiza petición PATCH al backend para cambiar estado a 'confirmada'
 * @param {number} id - ID de la cita a confirmar
 */
async function confirmarCitaDesdeModal(id) {
    try {
        // Logs para depuración del proceso de confirmación
        console.log('Intentando confirmar cita con ID:', id);
        console.log('URL:', `${window.API_URL}/citas/${id}/confirmar`);
        
        // Realizar petición PATCH al endpoint de confirmación
        const response = await fetch(`${window.API_URL}/citas/${id}/confirmar`, {
            method: "PATCH", // Método HTTP para actualización parcial
            headers: {
                'Content-Type': 'application/json' // Especificar tipo de contenido JSON
            }
        });
        
        // Logs adicionales para depuración de la respuesta
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        // Parsear respuesta JSON
        const data = await response.json();
        console.log('Success data:', data);
        
        // Mostrar alerta de éxito al usuario
        Swal.fire({
            title: "¡Confirmada!",
            text: data.message || "La cita ha sido confirmada exitosamente.",
            icon: "success",
            confirmButtonText: "Aceptar"
        }).then(() => {
            // Acciones después de confirmar la alerta
            
            // Cerrar el modal de edición
            document.getElementById("citaModal").style.display = "none";
            
            // Recargar las citas para mostrar el estado actualizado
            loadCitas();
            
            // También actualizar el calendario si está disponible y tiene la función
            if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                console.log('Refreshing calendar events from modal...');
                window.calendar.refetchEvents();
            }
        });
    } catch (error) {
        // Manejo de errores durante la confirmación
        console.error("Error al confirmar la cita:", error);
        Swal.fire({
            title: "Error",
            text: `Error al confirmar la cita: ${error.message}`,
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

/**
 * Función para cancelar una cita desde el modal de edición
 * Muestra confirmación al usuario antes de proceder con la cancelación
 * @param {number} id - ID de la cita a cancelar
 */
async function cancelarCitaDesdeModal(id) {
    // Mostrar diálogo de confirmación antes de proceder
    Swal.fire({
        title: "¿Cancelar cita?",
        text: "¿Estás seguro de que quieres cancelar esta cita?",
        icon: "warning",
        showCancelButton: true, // Mostrar botón de cancelar
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No, mantener"
    }).then(async (result) => {
        // Proceder solo si el usuario confirmó la acción
        if (result.isConfirmed) {
            try {
                // Logs para depuración del proceso de cancelación
                console.log('Intentando cancelar cita con ID:', id);
                console.log('URL:', `${window.API_URL}/citas/${id}/cancelar`);
                
                // Realizar petición PATCH al endpoint de cancelación
                const response = await fetch(`${window.API_URL}/citas/${id}/cancelar`, {
                    method: "PATCH", // Método HTTP para actualización parcial
                    headers: {
                        'Content-Type': 'application/json' // Especificar tipo de contenido JSON
                    }
                });
                
                console.log('Response status:', response.status);
                
                // Verificar si la respuesta fue exitosa
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                // Parsear respuesta JSON
                const data = await response.json();
                console.log('Success data:', data);
                
                // Mostrar alerta de éxito al usuario
                Swal.fire({
                    title: "¡Cancelada!",
                    text: data.message || "La cita ha sido cancelada.",
                    icon: "success",
                    confirmButtonText: "Aceptar"
                }).then(() => {
                    // Acciones después de cancelar la cita
                    
                    // Cerrar el modal de edición
                    document.getElementById("citaModal").style.display = "none";
                    
                    // Recargar las citas para mostrar el estado actualizado
                    loadCitas();
                    
                    // También actualizar el calendario si está disponible
                    if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                        console.log('Refreshing calendar events from modal...');
                        window.calendar.refetchEvents();
                    }
                });
            } catch (error) {
                // Manejo de errores durante la cancelación
                console.error("Error al cancelar la cita:", error);
                Swal.fire({
                    title: "Error",
                    text: `Error al cancelar la cita: ${error.message}`,
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        }
    });
}

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener("click", (event) => {
    const modal = document.getElementById("citaModal");
    if (modal && event.target === modal) {
        modal.style.display = "none";
    }
});

// Manejar el envío del formulario para actualizar la cita
const editCitaForm = document.getElementById("editCitaForm");
if (editCitaForm) {
    editCitaForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("editCitaId").value;
        const updatedCita = {
            nombre: document.getElementById("editNombre").value,
            correo: document.getElementById("editCorreo").value,
            telefono: document.getElementById("editTelefono").value,
            fecha: document.getElementById("editFecha").value,
            hora: document.getElementById("editHora").value,
            notas: document.getElementById("editNotas").value,
        };

        try {
            const response = await fetch(`${window.API_URL}/citas/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedCita)
            });
            const data = await response.json();
            if (response.ok) {                Swal.fire({
                    title: "¡Actualizado!",
                    text: data.message || "La cita ha sido actualizada con éxito.",
                    icon: "success",
                    confirmButtonText: "Aceptar"
                }).then(() => {
                    document.getElementById("citaModal").style.display = "none";
                    loadCitas();
                    
                    // También actualizar el calendario si está disponible
                    if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                        console.log('Refreshing calendar events after edit...');
                        window.calendar.refetchEvents();
                    }
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: data.message || "Error al actualizar la cita.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        } catch (error) {
            console.error("Error al actualizar la cita:", error);
            Swal.fire({
                title: "Error",
                text: "Error inesperado. Inténtalo de nuevo.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    });
}

// Función para eliminar una cita
async function deleteCita(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(async (result) => {
        if (result.isConfirmed) {            try {
                const response = await fetch(`${window.API_URL}/citas/${id}`, {
                    method: "DELETE"
                });
                const data = await response.json();
                if (response.ok) {                    Swal.fire({
                        title: "¡Eliminada!",
                        text: data.message || "La cita ha sido eliminada.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    }).then(() => {
                        loadCitas();
                        
                        // También actualizar el calendario si está disponible
                        if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                            console.log('Refreshing calendar events after deletion...');
                            window.calendar.refetchEvents();
                        }
                    });
                } else {
                    Swal.fire({
                        title: "Error",
                        text: data.message || "Error al eliminar la cita.",
                        icon: "error",
                        confirmButtonText: "Aceptar"
                    });
                }
            } catch (error) {
                console.error("Error al eliminar la cita:", error);
                Swal.fire({
                    title: "Error",
                    text: "Error inesperado. Inténtalo de nuevo.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        }
    });
}

// Función para confirmar una cita
async function confirmarCita(id) {
    try {
        const response = await fetch(`${window.API_URL}/citas/${id}/confirmar`, {
            method: "PATCH"
        });
        const data = await response.json();
        
        if (response.ok) {
            Swal.fire({
                title: "¡Confirmada!",
                text: data.message || "La cita ha sido confirmada exitosamente.",
                icon: "success",
                confirmButtonText: "Aceptar"
            }).then(() => {
                loadCitas(); // Recargar las citas para mostrar el estado actualizado
                
                // También actualizar el calendario si está disponible
                if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                    console.log('Refreshing calendar events after confirmation...');
                    window.calendar.refetchEvents();
                }
            });
        } else {
            Swal.fire({
                title: "Error",
                text: data.message || "Error al confirmar la cita.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    } catch (error) {
        console.error("Error al confirmar la cita:", error);
        Swal.fire({
            title: "Error",
            text: "Error inesperado. Inténtalo de nuevo.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

// Función para cancelar una cita
async function cancelarCita(id) {
    Swal.fire({
        title: "¿Cancelar cita?",
        text: "¿Estás seguro de que quieres cancelar esta cita?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No, mantener"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${window.API_URL}/citas/${id}/cancelar`, {
                    method: "PATCH"
                });
                const data = await response.json();
                
                if (response.ok) {
                    Swal.fire({
                        title: "¡Cancelada!",
                        text: data.message || "La cita ha sido cancelada.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    }).then(() => {
                        loadCitas(); // Recargar las citas para mostrar el estado actualizado
                        
                        // También actualizar el calendario si está disponible
                        if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                            console.log('Refreshing calendar events after cancellation...');
                            window.calendar.refetchEvents();
                        }
                    });
                } else {
                    Swal.fire({
                        title: "Error",
                        text: data.message || "Error al cancelar la cita.",
                        icon: "error",
                        confirmButtonText: "Aceptar"
                    });
                }
            } catch (error) {
                console.error("Error al cancelar la cita:", error);
                Swal.fire({
                    title: "Error",
                    text: "Error inesperado. Inténtalo de nuevo.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        }
    });
}

// Filtros y búsqueda de citas
function aplicarFiltrosYCargarCitas() {
    const fecha = document.getElementById("filtroFecha")?.value || "";
    const tipo = document.getElementById("filtroTipo")?.value || "";
    
    console.log('Aplicando filtros:', { fecha, tipo }); // Para depuración
    
    const filtros = {};
    if (fecha) filtros.fecha = fecha;
    if (tipo && tipo !== "") filtros.tipo = tipo;
    
    console.log('Filtros finales:', filtros); // Para depuración
    
    loadCitas(filtros);
}

function limpiarFiltros() {
    const filtroFecha = document.getElementById("filtroFecha");
    const filtroTipo = document.getElementById("filtroTipo");
    
    if (filtroFecha) filtroFecha.value = "";
    if (filtroTipo) filtroTipo.value = "";
    
    loadCitas();
    
    // También actualizar el calendario
    if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
        window.calendar.refetchEvents();
    }
}

// Función global para refrescar el calendario
function refreshCalendar() {
    if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
        console.log('Refreshing calendar events...');
        window.calendar.refetchEvents();
    } else {
        console.log('Calendar not available for refresh');
    }
}

// Inicialización y eventos
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM Content Loaded - Initializing appointments...'); // Debugging
    
    // Cargar citas iniciales
    loadCitas();
      // Configurar event listeners después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
        const btnLimpiar = document.getElementById('btnLimpiar');
        const filtroFecha = document.getElementById('filtroFecha');
        const filtroTipo = document.getElementById('filtroTipo');
        
        console.log('Elementos encontrados:', {
            btnLimpiar: !!btnLimpiar,
            filtroFecha: !!filtroFecha,
            filtroTipo: !!filtroTipo
        });
        
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', limpiarFiltros);
            console.log('Event listener agregado a btnLimpiar');
        }
        
        if (filtroFecha) {
            filtroFecha.addEventListener('change', aplicarFiltrosYCargarCitas);
            console.log('Event listener agregado a filtroFecha');
        }
        
        if (filtroTipo) {
            filtroTipo.addEventListener('change', aplicarFiltrosYCargarCitas);
            console.log('Event listener agregado a filtroTipo');
        }
    }, 100);
});

// Función para abrir el modal de receta
function abrirModalReceta(citaId, nombrePaciente, doctorId) {
    document.getElementById('recetaCitaId').value = citaId;
    document.getElementById('recetaNombrePaciente').value = nombrePaciente;
    document.getElementById('recetaDoctorId').value = obtenerNombreDoctor(doctorId);
    document.getElementById('recetaModal').style.display = 'block';
}

// Función para cerrar el modal de receta
function cerrarModalReceta() {
    // Restaurar el título original del modal
    const tituloModal = document.querySelector('#recetaModal h3');
    if (tituloModal) {
        tituloModal.innerHTML = '<i class="fa fa-prescription-bottle-medical"></i> Generar Receta Médica';
    }
    
    // Restaurar los botones originales
    const formReceta = document.getElementById('recetaForm');
    const botonesContainer = formReceta.querySelector('div[style*="display: flex"]');
    if (botonesContainer) {
        botonesContainer.innerHTML = `
            <button type="submit" class="btn-cta" style="flex: 1;">
                <i class="fa fa-file-medical"></i> Generar Receta
            </button>
            <button type="button" class="btn-cancelar" onclick="cerrarModalReceta()" style="flex: 1;">
                <i class="fa fa-times"></i> Cancelar
            </button>
        `;
    }
    
    // Restaurar campos editables
    const campos = [
        'recetaMedicamento',
        'recetaDosis', 
        'recetaFrecuencia',
        'recetaDuracion',
        'recetaIndicaciones'
    ];
    
    campos.forEach(campoId => {
        const elemento = document.getElementById(campoId);
        if (elemento) {
            elemento.removeAttribute('readonly');
            elemento.style.backgroundColor = '';
            elemento.style.cursor = '';
        }
    });
    
    // Ocultar modal y limpiar formulario
    document.getElementById('recetaModal').style.display = 'none';
    document.getElementById('recetaForm').reset();
}

// Función para generar receta médica
async function generarReceta(event) {
    event.preventDefault();
    
    const citaId = document.getElementById('recetaCitaId').value;
    const nombrePaciente = document.getElementById('recetaNombrePaciente').value;
    const doctorId = document.getElementById('recetaDoctorId').value;
    const medicamento = document.getElementById('recetaMedicamento').value;
    const dosis = document.getElementById('recetaDosis').value;
    const frecuencia = document.getElementById('recetaFrecuencia').value;
    const duracion = document.getElementById('recetaDuracion').value;
    const indicaciones = document.getElementById('recetaIndicaciones').value;
    
    const recetaData = {
        citaId: parseInt(citaId),
        nombrePaciente,
        doctorId,
        medicamento,
        dosis,
        frecuencia,
        duracion,
        indicaciones
    };
    
    try {
        // Enviar la receta al backend
        const response = await fetch(`${window.API_URL}/recetas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recetaData)
        });
        
        const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Error al crear la receta');
        }
        
        // Mostrar mensaje de éxito con información sobre el email
        const mensaje = data.emailEnviado ? 
            `Receta médica generada exitosamente para ${nombrePaciente}.\n\n📧 Se ha enviado una copia por correo electrónico.` :
            `Receta médica generada exitosamente para ${nombrePaciente}.`;
            
        Swal.fire({
            title: 'Receta generada',
            text: mensaje,
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            // Recargar las citas para actualizar los botones
            loadCitas();
            
            // También actualizar el calendario si está disponible
            if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
                window.calendar.refetchEvents();
            }
        });
        
        // Generar PDF de la receta
        const recetaConFecha = {
            ...recetaData,
            fecha: new Date().toISOString().split('T')[0]
        };
        generarPDFReceta(recetaConFecha);
          cerrarModalReceta();
        
    } catch (error) {
        console.error('Error al generar receta:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo generar la receta médica',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Función para ver receta existente
async function verReceta(citaId) {
    try {
        const response = await fetch(`${window.API_URL}/recetas/cita/${citaId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                Swal.fire({
                    title: 'No encontrada',
                    text: 'No se encontró receta para esta cita',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
                return;
            }
            throw new Error('Error al obtener la receta');
        }
        
        const receta = await response.json();
          // Abrir el modal con los datos de la receta (solo lectura)
        document.getElementById('recetaCitaId').value = receta.citaId;
        document.getElementById('recetaNombrePaciente').value = receta.nombrePaciente;
        document.getElementById('recetaDoctorId').value = obtenerNombreDoctor(receta.doctorId);
        document.getElementById('recetaMedicamento').value = receta.medicamento;
        document.getElementById('recetaDosis').value = receta.dosis;
        document.getElementById('recetaFrecuencia').value = receta.frecuencia;
        document.getElementById('recetaDuracion').value = receta.duracion;
        document.getElementById('recetaIndicaciones').value = receta.indicaciones || '';
        
        // Hacer todos los campos de solo lectura
        const campos = [
            'recetaMedicamento',
            'recetaDosis', 
            'recetaFrecuencia',
            'recetaDuracion',
            'recetaIndicaciones'
        ];
        
        campos.forEach(campoId => {
            const elemento = document.getElementById(campoId);
            if (elemento) {
                elemento.setAttribute('readonly', true);
                elemento.style.backgroundColor = '#f8f9fa';
                elemento.style.cursor = 'not-allowed';
            }
        });
        
        // Cambiar el título del modal
        const tituloModal = document.querySelector('#recetaModal h3');
        if (tituloModal) {
            tituloModal.innerHTML = '<i class="fa fa-eye"></i> Ver Receta Médica';
        }
        
        // Cambiar los botones del modal
        const formReceta = document.getElementById('recetaForm');
        const botonesContainer = formReceta.querySelector('div[style*="display: flex"]');
        if (botonesContainer) {
            botonesContainer.innerHTML = `
                <button type="button" class="btn-cta" onclick="imprimirReceta()" style="flex: 1;">
                    <i class="fa fa-print"></i> Imprimir
                </button>
                <button type="button" class="btn-cancelar" onclick="cerrarModalReceta()" style="flex: 1;">
                    <i class="fa fa-times"></i> Cerrar
                </button>
            `;
        }
        
        // Mostrar el modal
        document.getElementById('recetaModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error al obtener receta:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo obtener la receta médica',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Función para imprimir receta desde el modal de visualización
function imprimirReceta() {
    const recetaData = {
        citaId: document.getElementById('recetaCitaId').value,
        nombrePaciente: document.getElementById('recetaNombrePaciente').value,
        doctorId: document.getElementById('recetaDoctorId').value,
        medicamento: document.getElementById('recetaMedicamento').value,
        dosis: document.getElementById('recetaDosis').value,
        frecuencia: document.getElementById('recetaFrecuencia').value,
        duracion: document.getElementById('recetaDuracion').value,
        indicaciones: document.getElementById('recetaIndicaciones').value,
        fecha: new Date().toISOString().split('T')[0]
    };
    
    generarPDFReceta(recetaData);
}

// Función para generar PDF de la receta (básica)
function generarPDFReceta(recetaData) {
    const ventanaReceta = window.open('', '_blank');
    ventanaReceta.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receta Médica</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #2C3E50; padding-bottom: 20px; margin-bottom: 30px; }
                .info { margin-bottom: 15px; }
                .medicamento { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>GenWeb - Hospital</h1>
                <h2>Receta Médica</h2>
            </div>
            
            <div class="info">
                <strong>Paciente:</strong> ${recetaData.nombrePaciente}
            </div>            <div class="info">
                <strong>Doctor:</strong> ${obtenerNombreDoctor(recetaData.doctorId)}
            </div>
            <div class="info">
                <strong>Fecha:</strong> ${recetaData.fecha}
            </div>
            <div class="info">
                <strong>Cita ID:</strong> ${recetaData.citaId}
            </div>
            
            <div class="medicamento">
                <h3>Prescripción</h3>
                <p><strong>Medicamento:</strong> ${recetaData.medicamento}</p>
                <p><strong>Dosis:</strong> ${recetaData.dosis}</p>
                <p><strong>Frecuencia:</strong> ${recetaData.frecuencia}</p>
                <p><strong>Duración:</strong> ${recetaData.duracion}</p>
                ${recetaData.indicaciones ? `<p><strong>Indicaciones especiales:</strong> ${recetaData.indicaciones}</p>` : ''}
            </div>
            
            <div class="footer">
                <p>Esta receta médica es válida únicamente con la firma y sello del médico tratante.</p>
                <p><strong>Firma del Médico:</strong> _________________________</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    ventanaReceta.document.close();
}
