document.addEventListener('DOMContentLoaded', () => {
    fetchDoctors();
});

async function fetchDoctors() {
    try {
        const response = await fetch("http://localhost:5000/api/doctors");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const doctors = await response.json();
        console.log("Doctores cargados:", doctors);

        const resultsContainer = document.getElementById("results");
        if (!resultsContainer) {
            console.error("Error: No se encontró el contenedor de resultados (#results)");
            return;
        }

        resultsContainer.innerHTML = '';

        if (doctors.length === 0) {
            resultsContainer.innerHTML = "<p>No hay doctores disponibles.</p>";
            return;
        }

        doctors.forEach(doctor => {
            resultsContainer.innerHTML += `
                <div class="result-card">
                    <div class="doctor-photo">
                        <img src="${doctor.imagen}" alt="Foto de ${doctor.nombre}">
                    </div>
                    <div class="doctor-info">
                        <h3>${doctor.nombre}</h3>
                        <p>Especialista en ${doctor.especialidad}</p>
                        <p>Modalidad: ${doctor.modalidad}</p>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error cargando doctores:", error);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const resultsContainer = document.getElementById("results");
    
    if (!resultsContainer) {
        console.error("Error: No se encontró el contenedor de resultados (#results)");
        return;
    }

    // Llamar a la función para cargar doctores al cargar la página
    fetchDoctors();
});
