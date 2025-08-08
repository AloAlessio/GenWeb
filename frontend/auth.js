// auth.js - Utilidades de autenticación

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean} - true si hay un usuario autenticado, false si no
 */
function isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token !== null && user !== null;
}

/**
 * Redirige a usuarios no autenticados al login
 * @param {string} [returnUrl] - URL a la que redirigir después del login
 */
function requireAuth(returnUrl = window.location.pathname) {
    if (!isAuthenticated()) {
        // Guardar la URL actual para redirigir después del login
        localStorage.setItem('returnUrl', returnUrl);
        window.location.href = '/login.html';
    }
}

/**
 * Redirige al usuario a la página guardada después del login
 * Si no hay página guardada, redirige a la página principal
 */
function redirectAfterLogin() {
    const returnUrl = localStorage.getItem('returnUrl') || '/index.html';
    localStorage.removeItem('returnUrl'); // Limpiar la URL guardada
    window.location.href = returnUrl;
}
