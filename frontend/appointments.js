// Función para cargar y renderizar las citas
async function loadCitas() {
    try {
        const response = await fetch(`${API_URL}/citas`);
        const citas = await response.json();
        const citasList = document.getElementById("citasList");
        citasList.innerHTML = "";

        if (citas.length === 0) {
            citasList.innerHTML = "<p>No hay citas registradas.</p>";
            return;
        }

        citas.forEach(cita => {
            const citaCard = document.createElement("div");
            citaCard.className = "result-card";
            citaCard.innerHTML = `
                <div>
                    <h3>${cita.nombre}</h3>
                    <p><strong>Correo:</strong> ${cita.correo}</p>
                    <p><strong>Teléfono:</strong> ${cita.telefono}</p>
                    <p><strong>Fecha:</strong> ${cita.fecha} - <strong>Hora:</strong> ${cita.hora}</p>
                    <p><strong>Notas:</strong> ${cita.notas || "Sin notas"}</p>
                </div>
                <div>
                    <button onclick="openEditModal(${cita.id})" class="btn-cta">Editar</button>
                    <button onclick="deleteCita(${cita.id})" class="btn-cta" style="background-color:#e74c3c;">Eliminar</button>
                </div>
            `;
            citasList.appendChild(citaCard);
        });
    } catch (error) {
        console.error("Error al cargar las citas:", error);
        Swal.fire({
            title: "Error",
            text: "No se pudieron cargar las citas. Intenta más tarde.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

// Abrir el modal y cargar los datos de la cita seleccionada
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/citas/${id}`);
        const cita = await response.json();

        document.getElementById("editCitaId").value = cita.id;
        document.getElementById("editNombre").value = cita.nombre;
        document.getElementById("editCorreo").value = cita.correo;
        document.getElementById("editTelefono").value = cita.telefono;
        document.getElementById("editDoctorId").value = cita.doctorId;
        document.getElementById("editEspecialidad").value = cita.especialidad;
        document.getElementById("editModalidad").value = cita.modalidad;
        document.getElementById("editFecha").value = cita.fecha;
        document.getElementById("editHora").value = cita.hora;
        document.getElementById("editNotas").value = cita.notas || "";

        document.getElementById("citaModal").style.display = "flex";
    } catch (error) {
        console.error("Error al obtener la cita:", error);
        Swal.fire({
            title: "Error",
            text: "No se pudieron cargar los datos de la cita.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

// Cerrar modal al hacer clic en la "X"
document.querySelector(".modal .close").addEventListener("click", () => {
    document.getElementById("citaModal").style.display = "none";
});

// Manejar el envío del formulario para actualizar la cita
document.getElementById("editCitaForm").addEventListener("submit", async (e) => {
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
        const response = await fetch(`${API_URL}/citas/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCita)
        });
        const data = await response.json();
        if (response.ok) {
            Swal.fire({
                title: "¡Actualizado!",
                text: data.message || "La cita ha sido actualizada con éxito.",
                icon: "success",
                confirmButtonText: "Aceptar"
            }).then(() => {
                document.getElementById("citaModal").style.display = "none";
                loadCitas();
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
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/citas/${id}`, {
                    method: "DELETE"
                });
                const data = await response.json();
                if (response.ok) {
                    Swal.fire({
                        title: "¡Eliminada!",
                        text: data.message || "La cita ha sido eliminada.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    }).then(() => {
                        loadCitas();
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

// Cargar citas al iniciar la página
document.addEventListener("DOMContentLoaded", loadCitas);
