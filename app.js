/************************************
 * Datos de Especialistas Reales    *
 ************************************/
const doctorsData = [
    {
        id: 1,
        name: "Dr. Alonso Jimenez",
        specialty: "Neurología",
        image: "doc1.png",
        modality: "Presencial y Online",
        location: "Ciudad de México"
    },
    {
        id: 2,
        name: "Dra. Melissa Lara",
        specialty: "Pediatría",
        image: "doc3.png",
        modality: "Presencial",
        location: "Monterrey"
    },
    {
        id: 3,
        name: "Dr. Diego Hernandez",
        specialty: "Cardiología",
        image: "doc2.png",
        modality: "Presencial y Online",
        location: "Guadalajara"
    },
    {
        id: 4,
        name: "Dra. Kelly Palomares",
        specialty: "Dermatología",
        image: "doc7.png",
        modality: "Presencial",
        location: "Ciudad de México"
    },
    {
        id: 5,
        name: "Dr. Mauricio Rocha",
        specialty: "Infectología",
        image: "doc6.png",
        modality: "Online",
        location: "Monterrey"
    },
    {
        id: 6,
        name: "Dr. Alexis Hernandez",
        specialty: "Otorrinolaringología",
        image: "doc5.png",
        modality: "Presencial",
        location: "Guadalajara"
    },
    {
        id: 7,
        name: "Dr. Gonzalo Mendoza",
        specialty: "Anestesiología",
        image: "doc4.png",
        modality: "Presencial y Online",
        location: "Ciudad de México"
    }
];

/************************************
 * Función para normalizar cadenas  *
 * (quita acentos y diacríticos)    *
 ************************************/
function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/************************************
 * Función para renderizar tarjetas *
 * de especialistas en citas.html   *
 ************************************/
function renderDoctors(doctors) {
    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = ''; // Limpiar el contenedor

    doctors.forEach(doctor => {
        const cardHTML = `
            <div class="result-card" onclick="redirectToForm(${doctor.id})" style="cursor: pointer;">
                <div class="doctor-photo">
                    <img src="${doctor.image}" alt="Foto de ${doctor.name}">
                </div>
                <div class="doctor-info">
                    <h3>${doctor.name}</h3>
                    <p>Especialista en ${doctor.specialty}</p>
                </div>
            </div>
        `;
        resultsContainer.innerHTML += cardHTML;
    });
}

/************************************
 * Función para redirigir al form   *
 ************************************/
function redirectToForm(doctorId) {
    // Recupera los valores de los filtros de búsqueda
    const filterSpecialty = document.getElementById('especialidad') ? document.getElementById('especialidad').value : "";
    const filterDate = document.getElementById('fecha') ? document.getElementById('fecha').value : "";
    
    // Redirige a citas_forms.html pasando el id del especialista,
    // la especialidad y la fecha seleccionada (codificados en URL)
    window.location.href = `citas_forms.html?especialista=${doctorId}&especialidad=${encodeURIComponent(filterSpecialty)}&fecha=${encodeURIComponent(filterDate)}`;
}

/************************************
 * Función para leer parámetros de la *
 * URL (para autocompletar en form)   *
 ************************************/
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split("&");
    pairs.forEach(pair => {
        const [key, value] = pair.split("=");
        if (key) {
            params[key] = decodeURIComponent(value);
        }
    });
    return params;
}

document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en citas_forms.html, autocompletar campos con parámetros de la URL
    const params = getQueryParams();
    if (params.especialidad) {
        const specialtyField = document.getElementById('especialidad');
        if (specialtyField) {
            specialtyField.value = params.especialidad;
        }
    }
    if (params.fecha) {
        const dateField = document.getElementById('fechaCita');
        if (dateField) {
            dateField.value = params.fecha;
        }
    }
});

/************************************
 * Función para filtrar resultados  *
 ************************************/
function filtrarResultados() {
    const especialidadInput = document.getElementById('especialidad').value.toLowerCase();
    const especialidadNorm = normalizeString(especialidadInput);
    const modo = document.getElementById('modo').value.toLowerCase();

    const filteredDoctors = doctorsData.filter(doctor => {
        let match = true;
        // Normalizar el specialty del doctor
        const doctorSpecialtyNorm = normalizeString(doctor.specialty.toLowerCase());
        if (especialidadNorm && !doctorSpecialtyNorm.includes(especialidadNorm)) {
            match = false;
        }
        // Filtrar por modalidad
        if (modo) {
            const doctorModalityNorm = normalizeString(doctor.modality.toLowerCase());
            if (modo === 'presencial' && !doctorModalityNorm.includes('presencial')) {
                match = false;
            }
            if (modo === 'online' && !doctorModalityNorm.includes('online')) {
                match = false;
            }
        }
        return match;
    });
    
    renderDoctors(filteredDoctors);
}

/************************************
 * Función para cargar todos los    *
 * especialistas al inicio          *
 ************************************/
function loadDoctors() {
    renderDoctors(doctorsData);
}

/************************************
 * Lógica de Login y Registro       *
 ************************************/
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    if (loginForm) loginForm.classList.add('visible');
    if (registerForm) registerForm.classList.remove('visible');
    if (loginTab) loginTab.classList.add('active');
    if (registerTab) registerTab.classList.remove('active');
}

function showRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    if (registerForm) registerForm.classList.add('visible');
    if (loginForm) loginForm.classList.remove('visible');
    if (registerTab) registerTab.classList.add('active');
    if (loginTab) loginTab.classList.remove('active');
}

function handleLogin(event) {
    event.preventDefault();
    const emailOrPhone = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const userFound = usuarios.find(u => (u.email === emailOrPhone || u.telefono === emailOrPhone) && u.password === password);
    
    if (userFound) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(userFound));
        alert('Inicio de sesión exitoso');
        window.location.href = 'index.html';
    } else {
        alert('Credenciales incorrectas');
    }
    return false;
}

function handleRegister(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (!nombre || !email || !password || !confirmPassword) {
        alert('Por favor, completa todos los campos requeridos.');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        return false;
    }
    
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return false;
    }
    
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return false;
    }
    
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const existe = usuarios.find(u => u.email === email);
    if (existe) {
        alert('Este correo ya está registrado.');
        return false;
    }
    
    const newUser = { nombre, email, telefono, password };
    usuarios.push(newUser);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Limpiar campos (opcional)
    document.getElementById('nombre').value = "";
    document.getElementById('registerEmail').value = "";
    document.getElementById('telefono').value = "";
    document.getElementById('registerPassword').value = "";
    document.getElementById('confirmPassword').value = "";
    
    alert('Registro exitoso.');
    showLogin();
    return false;
}

function checkSession() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

/************************************
 * Función para actualizar el navbar*
 ************************************/
function updateNavbarUser() {
    const userInfoContainer = document.getElementById('userInfoContainer');
    if (checkSession() && userInfoContainer) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            userInfoContainer.innerHTML = `
                <span class="user-name">Bienvenido, ${currentUser.nombre}</span>
                <button onclick="logout()" class="btn-logout">Cerrar Sesión</button>
            `;
        }
    } else if (userInfoContainer) {
        userInfoContainer.innerHTML = '';
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

/************************************
 * Lógica para el botón "Agendar Cita" en index *
 ************************************/
document.addEventListener('DOMContentLoaded', () => {
    // Si existe el botón "Agendar Cita" en index, agregar evento
    const btnAgendarCita = document.getElementById('btnAgendarCita');
    if (btnAgendarCita) {
        btnAgendarCita.addEventListener('click', (e) => {
            e.preventDefault();
            if (checkSession()) {
                window.location.href = 'citas.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    // Si estamos en la página de citas, cargar especialistas
    if (document.getElementById('results')) {
        loadDoctors();
    }
    
    // Actualizar navbar si existe
    if (document.getElementById('userInfoContainer')) {
        updateNavbarUser();
    }
});
