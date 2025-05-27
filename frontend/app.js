// 📌 Configuración de la URL base del backend
const API_URL = "http://localhost:5000/api";

// 🟢 FUNCIÓN PARA VERIFICAR SI EL USUARIO ESTÁ AUTENTICADO
function checkSession() {
    return localStorage.getItem('token') !== null;
}

// 🟢 FUNCIÓN PARA CERRAR SESIÓN
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// 🟢 FUNCIÓN PARA REDIRIGIR A CITAS O LOGIN SEGÚN SESIÓN (BOTÓN "AGENDAR CITA")
function handleAgendarCita() {
    if (checkSession()) {
        window.location.href = "citas.html";
    } else {
        alert("Debes iniciar sesión para agendar una cita.");
        window.location.href = "login.html";
    }
}

// 🟢 ASIGNAR EVENTO AL BOTÓN DE "AGENDAR CITA"
document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM completamente cargado");
    
    const btnAgendarCita = document.getElementById("btnAgendarCita");
    if (btnAgendarCita) {
        btnAgendarCita.addEventListener("click", handleAgendarCita);
    }

    // Verificar si estamos en login.html y asignar eventos
    if (document.getElementById('loginForm')) {
        console.log("🟢 Página de login detectada.");
        document.getElementById('loginForm').addEventListener("submit", handleLogin);
        document.getElementById('registerForm').addEventListener("submit", handleRegister);
        showLogin();
    }

    // Verificar si estamos en citas.html
    if (document.getElementById('results')) {
        console.log("🟢 Página de citas detectada.");
        loadDoctors();
    }

    // Verificar si estamos en citas_forms.html
    if (document.getElementById('appointmentForm')) {
        console.log("🟢 Página de formulario de citas detectada.");
        document.getElementById('appointmentForm').addEventListener("submit", guardarCita);
    }

    // Actualizar navbar si el usuario está autenticado
    if (document.getElementById('userInfoContainer')) {
        updateNavbarUser();
    }
});

// 🟢 FUNCIÓN PARA ACTUALIZAR EL NAVBAR CON EL USUARIO LOGUEADO
function updateNavbarUser() {
    const userInfoContainer = document.getElementById('userInfoContainer');
    if (checkSession() && userInfoContainer) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
            // Crear contenedor de información del usuario
            const userDisplay = document.createElement('div');
            userDisplay.className = 'user-info-display';
            
            // Crear avatar con la primera letra del nombre
            const avatar = document.createElement('div');
            avatar.className = 'user-avatar';
            avatar.textContent = currentUser.nombre.charAt(0).toUpperCase();
            
            // Crear nombre del usuario
            const userName = document.createElement('span');
            userName.className = 'user-name';
            userName.textContent = currentUser.nombre;
            
            // Agregar elementos al display
            userDisplay.appendChild(avatar);
            userDisplay.appendChild(userName);
            
            // Crear botón de logout
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'btn-logout';
            logoutBtn.onclick = logout;
            logoutBtn.innerHTML = 'Cerrar Sesión';
            
            // Limpiar contenedor y agregar elementos
            userInfoContainer.innerHTML = '';
            userInfoContainer.appendChild(userDisplay);
            userInfoContainer.appendChild(logoutBtn);
        }
    } else if (userInfoContainer) {
        userInfoContainer.innerHTML = '';
    }
}

// 🟢 FUNCIÓN PARA MOSTRAR EL FORMULARIO DE INICIO DE SESIÓN
function showLogin() {
    document.getElementById('loginForm').classList.add('visible');
    document.getElementById('registerForm').classList.remove('visible');
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
}

// 🟢 FUNCIÓN PARA MOSTRAR EL FORMULARIO DE REGISTRO
function showRegister() {
    document.getElementById('registerForm').classList.add('visible');
    document.getElementById('loginForm').classList.remove('visible');
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
}

// 🟢 FUNCIÓN PARA REGISTRARSE
async function handleRegister(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!nombre || !email || !password || !confirmPassword) {
        Swal.fire({
          title: "Advertencia",
          text: "Por favor, completa todos los campos.",
          icon: "warning",
          confirmButtonText: "Aceptar"
        });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({
          title: "Advertencia",
          text: "Las contraseñas no coinciden.",
          icon: "warning",
          confirmButtonText: "Aceptar"
        });
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            Swal.fire({
              title: "¡Registro Exitoso!",
              text: "Usuario registrado correctamente",
              icon: "success",
              confirmButtonText: "Iniciar Sesión"
            }).then(() => {
              // Redirige al login o cambia la vista
              window.location.href = "login.html";
            });
        } else {
            Swal.fire({
              title: "Error",
              text: data.message || "Error en el registro.",
              icon: "error",
              confirmButtonText: "Aceptar"
            });
        }
    } catch (error) {
        console.error("Error en el registro:", error);
        Swal.fire({
          title: "Error",
          text: "Error inesperado. Inténtalo de nuevo.",
          icon: "error",
          confirmButtonText: "Aceptar"
        });
    }
}


// 🟢 FUNCIÓN PARA INICIAR SESIÓN
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            // Guardar token o usuario, etc.
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Mostrar alerta de éxito con SweetAlert
            Swal.fire({
              title: "¡Bienvenido!",
              text: "Inicio de sesión exitoso",
              icon: "success",
              confirmButtonText: "Aceptar"
            }).then(() => {
              window.location.href = "index.html";
            });
        } else {
            Swal.fire({
              title: "Error",
              text: data.message || "Error en el inicio de sesión.",
              icon: "error",
              confirmButtonText: "Aceptar"
            });
        }
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        Swal.fire({
          title: "Error",
          text: "Error inesperado. Inténtalo de nuevo.",
          icon: "error",
          confirmButtonText: "Aceptar"
        });
    }
}

// 🟢 FUNCIÓN PARA CARGAR LISTA DE DOCTORES
async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        const doctors = await response.json();

        const resultsContainer = document.getElementById('results');
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';

        doctors.forEach(doctor => {
            resultsContainer.innerHTML += `
                <div class="result-card" onclick="redirectToForm(${doctor.id}, '${doctor.nombre}', '${doctor.especialidad}', '${doctor.modalidad}')">
                    <div class="doctor-photo">
                        <img src="${doctor.imagen}" alt="Foto de ${doctor.nombre}">
                    </div>
                    <div class="doctor-info">
                        <h3>${doctor.nombre}</h3>
                        <p>Especialista en ${doctor.especialidad}</p>
                        <p>Modalidad: ${doctor.modalidad}</p>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error("Error cargando doctores:", error);
    }
}

// 🟢 FUNCIÓN PARA FILTRAR ESPECIALISTAS
async function filtrarResultados() {
    let especialidad = document.getElementById('especialidad')?.value.trim() || "";
    let modalidad = document.getElementById('modo')?.value.trim() || "";

    // 🔹 No incluir "Cualquier modalidad" en la URL
    if (modalidad === "" || modalidad.toLowerCase() === "cualquier modalidad") {
        modalidad = null;
    }

    // 🔹 Si no hay especialidad ni modalidad, cargar todos los doctores
    if (!especialidad && !modalidad) {
        console.log("📌 No se aplicaron filtros, mostrando todos los doctores.");
        return loadDoctors();
    }

    console.log("📌 Filtros seleccionados:", { especialidad, modalidad });

    try {
        const params = new URLSearchParams();
        if (especialidad) params.append("especialidad", especialidad);
        if (modalidad) params.append("modalidad", modalidad);

        let apiUrl = `${API_URL}/doctors/filter`;
        if (params.toString()) {
            apiUrl += `?${params.toString()}`;
        }

        console.log("🔹 URL de la API:", apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            if (response.status === 404) {
                mostrarMensajeNoResultados();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const doctors = await response.json();
        console.log("✅ Doctores filtrados:", doctors);

        if (doctors.length === 0) {
            mostrarMensajeNoResultados();
            return;
        }

        renderDoctors(doctors);
    } catch (error) {
        console.error("❌ Error filtrando doctores:", error);
        mostrarMensajeNoResultados();
    }
}

function renderDoctors(doctors) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    doctors.forEach(doctor => {
        resultsContainer.innerHTML += `
            <div class="result-card" onclick="redirectToForm(${doctor.id}, '${doctor.nombre}', '${doctor.especialidad}', '${doctor.modalidad}')">
                <div class="doctor-photo">
                    <img src="${doctor.imagen}" alt="Foto de ${doctor.nombre}">
                </div>
                <div class="doctor-info">
                    <h3>${doctor.nombre}</h3>
                    <p>Especialista en ${doctor.especialidad}</p>
                    <p>Modalidad: ${doctor.modalidad}</p>
                </div>
            </div>`;
    });
}



function mostrarMensajeNoResultados() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="alert-message">
            <p>⚠️ No se encontraron especialistas con los filtros seleccionados.</p>
        </div>`;
}


function redirectToForm(doctorId, nombre, especialidad, modalidad) {
    console.log(`🔹 Redirigiendo a formulario con: ID: ${doctorId}, Nombre: ${nombre}, Especialidad: ${especialidad}, Modalidad: ${modalidad}`);

    const url = `citas_forms.html?doctorId=${doctorId}&nombre=${encodeURIComponent(nombre)}&especialidad=${encodeURIComponent(especialidad)}&modalidad=${encodeURIComponent(modalidad)}`;
    
    console.log("🔹 URL generada:", url);
    
    window.location.href = url;
}



document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("citas_forms.html")) {
        console.log("✅ Página de formulario de citas detectada.");
        llenarFormularioCita();
    }
});

// 🟢 FUNCIÓN PARA CARGAR LOS PARÁMETROS DE LA URL EN EL FORMULARIO
function llenarFormularioCita() {
    const params = new URLSearchParams(window.location.search);
    const doctorId = params.get("doctorId");
    const nombre = params.get("nombre");
    const especialidad = params.get("especialidad");
    const modalidad = params.get("modalidad");

    console.log("📌 Datos recibidos para la cita:", { doctorId, nombre, especialidad, modalidad });

    if (document.getElementById("doctorId")) {
        document.getElementById("doctorId").value = doctorId || "";
    }
    if (document.getElementById("doctorName")) {
        document.getElementById("doctorName").value = nombre || "";
    }
    if (document.getElementById("doctorSpecialty")) {
        document.getElementById("doctorSpecialty").value = especialidad || "";
    }
    if (document.getElementById("doctorMode")) {
        document.getElementById("doctorMode").value = modalidad || "";
    }
}

// 🟢 FUNCIÓN PARA GUARDAR LA CITA EN LA BASE DE DATOS
async function guardarCita(event) {
    event.preventDefault(); // Evita el comportamiento por defecto del formulario

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const doctorId = document.getElementById('doctorId').value.trim();
    const especialidad = document.getElementById('doctorSpecialty').value.trim();
    const modalidad = document.getElementById('doctorMode').value.trim();
    const fechaCita = document.getElementById('fechaCita').value.trim();
    const horaCita = document.getElementById('horaCita').value.trim();
    const notas = document.getElementById('notas').value.trim();

    if (!nombre || !correo || !telefono || !doctorId || !especialidad || !modalidad || !fechaCita || !horaCita) {
        alert("⚠️ Todos los campos son obligatorios.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/citas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre, correo, telefono, doctorId, especialidad, modalidad, fecha: fechaCita, hora: horaCita, notas
            })
        });

        const data = await response.json();
        if (response.ok) {
            /* alert("✅ Cita agendada correctamente.");
            window.location.href = "index.html"; */
            Swal.fire({
                title: "✅ Cita agendada correctamente",
                text: "Tu cita ha sido registrada con éxito.",
                icon: "success",
                confirmButtonText: "Aceptar"
            }).then(() => {
                window.location.href = "index.html";
            });
        } else {
            /* alert(`❌ Error al agendar cita: ${data.message}`); */
            Swal.fire({
                title: "❌ Error al agendar cita",
                text: data.message,
                icon: "error",
                confirmButtonText: "Intentar de nuevo"
            });
        }
    } catch (error) {
        console.error("❌ Error en la solicitud:", error);
        /* alert("❌ Hubo un error al enviar la cita. Intenta nuevamente."); */
        Swal.fire({
            title: "❌ Error en la solicitud",
            text: "Hubo un error al enviar la cita. Intenta nuevamente.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}


// 🟢 ASIGNAR EVENTOS AL CARGAR EL DOM
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("citas_forms.html")) {
        console.log("✅ Página de formulario de citas detectada.");
        llenarFormularioCita();

        const formulario = document.getElementById("appointmentForm");
        if (formulario) {
            formulario.addEventListener("submit", guardarCita);
        } else {
            console.error("⚠️ No se encontró el formulario de citas.");
        }
    }
});
