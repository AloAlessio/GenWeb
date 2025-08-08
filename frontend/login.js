// login.js - Manejo de autenticación de usuarios

// Funciones de validación de contraseña
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return {
        requirements,
        valid: Object.values(requirements).every(Boolean),
        strength: calculatePasswordStrength(requirements)
    };
}

function calculatePasswordStrength(requirements) {
    const totalRequirements = Object.keys(requirements).length;
    const fulfilledRequirements = Object.values(requirements).filter(Boolean).length;
    const percentage = (fulfilledRequirements / totalRequirements) * 100;
    
    if (percentage >= 100) return 'strong';
    if (percentage >= 60) return 'medium';
    return 'weak';
}

function updatePasswordStrength(password) {
    const strengthMeter = document.querySelector('.password-strength-meter');
    const requirements = document.querySelectorAll('.requirement');
    
    if (!strengthMeter || !requirements.length) return;
    
    const validation = validatePassword(password);
    
    // Actualizar barra de fortaleza
    strengthMeter.className = 'password-strength-meter';
    if (password) {
        strengthMeter.classList.add(`strength-${validation.strength}`);
    }
    
    // Actualizar requisitos
    requirements.forEach(req => {
        const type = req.dataset.requirement;
        if (validation.requirements[type]) {
            req.classList.add('valid');
        } else {
            req.classList.remove('valid');
        }
    });
    
    return validation.valid;
}

document.addEventListener('DOMContentLoaded', function() {
    // Si ya está autenticado, redirigir a la página principal
    if (isAuthenticated()) {
        window.location.href = '/index.html';
        return;
    }

    // Manejar validación de contraseña en tiempo real
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
        });
    }

    // Manejar el formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('registerEmail').value;
            const telefono = document.getElementById('telefono').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Email Inválido',
                    text: 'Por favor ingresa un correo electrónico válido'
                });
                return;
            }

            // Validar teléfono (opcional pero si se proporciona debe ser válido)
            if (telefono && !/^\d{10}$/.test(telefono.replace(/[\s()-]/g, ''))) {
                Swal.fire({
                    icon: 'error',
                    title: 'Teléfono Inválido',
                    text: 'Por favor ingresa un número de teléfono válido de 10 dígitos'
                });
                return;
            }

            // Validar fortaleza de contraseña
            if (!validatePassword(password).valid) {
                Swal.fire({
                    icon: 'error',
                    title: 'Contraseña Débil',
                    text: 'Por favor cumple con todos los requisitos de seguridad'
                });
                return;
            }

            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Las Contraseñas No Coinciden',
                    text: 'Por favor verifica que las contraseñas sean iguales'
                });
                return;
            }

            try {
                const response = await fetch(`${window.API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        nombre,
                        email,
                        telefono,
                        password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Registro Exitoso!',
                        text: 'Tu cuenta ha sido creada correctamente',
                        timer: 1500
                    });

                    // Autologin después del registro
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    redirectAfterLogin();
                } else {
                    throw new Error(data.message || 'Error al registrar usuario');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error al crear la cuenta'
                });
            }
        });
    }

    // Manejar el envío del formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${window.API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Guardar token y datos del usuario
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Mostrar mensaje de éxito
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: 'Has iniciado sesión correctamente',
                        timer: 1500
                    });

                    // Redirigir al usuario a la página guardada o a la principal
                    redirectAfterLogin();
                } else {
                    throw new Error(data.message || 'Error al iniciar sesión');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error al iniciar sesión'
                });
            }
        });
    }
});
