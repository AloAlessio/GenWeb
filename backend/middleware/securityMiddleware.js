// securityMiddleware.js - Middleware para seguridad y control de acceso

// Almacenamiento en memoria de intentos fallidos
// En producción esto debería estar en Redis o una base de datos
const loginAttempts = new Map();

// Función para limpiar los intentos después del tiempo de bloqueo
function clearLoginAttempts(email) {
    setTimeout(() => {
        loginAttempts.delete(email);
    }, 60000); // 1 minuto
}

// Middleware para controlar intentos de login
const loginAttemptsMiddleware = async (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'El email es requerido' });
    }

    // Obtener los intentos actuales
    const attempts = loginAttempts.get(email) || {
        count: 0,
        lastAttempt: Date.now(),
        isBlocked: false
    };

    // Verificar si está bloqueado
    if (attempts.isBlocked) {
        const timeElapsed = Date.now() - attempts.lastAttempt;
        const timeRemaining = 60000 - timeElapsed; // 1 minuto de bloqueo

        if (timeElapsed < 60000) { // Menos de 1 minuto
            console.log('🔒 Intento de acceso a cuenta bloqueada:', {
                email,
                attempts: attempts.count,
                lastAttempt: new Date(attempts.lastAttempt).toISOString(),
                timeElapsed: `${Math.floor(timeElapsed / 1000)} segundos`,
                timeRemaining: `${Math.ceil(timeRemaining / 1000)} segundos`,
                ip: req.ip
            });

            return res.status(429).json({
                message: 'Cuenta temporalmente bloqueada por múltiples intentos fallidos',
                timeRemaining: Math.ceil(timeRemaining / 1000), // Tiempo restante en segundos
                attempts: attempts.count,
                maxAttempts: 5
            });
        } else {
            // Si ya pasó el tiempo de bloqueo, reiniciar intentos
            console.log('🔓 Desbloqueando cuenta:', {
                email,
                previousAttempts: attempts.count,
                blockedTime: `${Math.floor(timeElapsed / 1000)} segundos`,
                ip: req.ip
            });
            loginAttempts.delete(email);
        }
    }

    // Agregar los intentos al request para usarlos en el controlador
    req.loginAttempts = attempts;
    next();
};

// Función para registrar un intento fallido
const recordFailedAttempt = (email) => {
    const attempts = loginAttempts.get(email) || {
        count: 0,
        lastAttempt: Date.now(),
        isBlocked: false,
        history: []
    };

    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    attempts.history.push(Date.now());

    // Mantener solo los últimos 10 intentos en el historial
    if (attempts.history.length > 10) {
        attempts.history = attempts.history.slice(-10);
    }

    if (attempts.count >= 5) {
        attempts.isBlocked = true;
        console.log('🚫 Cuenta bloqueada por múltiples intentos:', {
            email,
            totalAttempts: attempts.count,
            attemptHistory: attempts.history.map(time => new Date(time).toISOString()),
            blockedAt: new Date().toISOString()
        });
        clearLoginAttempts(email); // Programar la limpieza después de 1 minuto
    } else {
        console.log('⚠️ Intento fallido de inicio de sesión:', {
            email,
            currentAttempts: attempts.count,
            remainingAttempts: 5 - attempts.count,
            lastAttempt: new Date(attempts.lastAttempt).toISOString()
        });
    }

    loginAttempts.set(email, attempts);
    return attempts;
};

// Función para registrar un intento exitoso
const recordSuccessfulLogin = (email) => {
    loginAttempts.delete(email);
};

module.exports = {
    loginAttemptsMiddleware,
    recordFailedAttempt,
    recordSuccessfulLogin
};
