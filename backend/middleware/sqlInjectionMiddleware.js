// sqlInjectionMiddleware.js - Middleware para prevenir inyecciones SQL

const validator = require('validator');

// Lista de patrones SQL maliciosos
const SQL_INJECTION_PATTERNS = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,          // Caracteres especiales básicos
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i, // Patrones de igualdad seguidos de caracteres maliciosos
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i, // Patrones de OR
    /((\%27)|(\'))union/i,                      // UNION attacks
    /exec(\s|\+)+(s|x)p\w+/i,                   // Ejecución de stored procedures
    /SLEEP\([^\)]*\)/i,                         // Time-based attacks
];

// Función para sanitizar un string
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    // Escapar caracteres especiales
    return validator.escape(str);
}

// Función para detectar posibles inyecciones SQL
function detectSQLInjection(str) {
    if (typeof str !== 'string') return false;
    if (str.length === 0) return false;

    // No validar contraseñas ni campos sensibles
    if (str.includes('password')) return false;
    
    // Verificar patrones maliciosos
    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(str));
}

// Función recursiva para sanitizar objetos completos
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return sanitizeString(obj);
    }

    const sanitized = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            // Sanitizar recursivamente cada propiedad
            sanitized[key] = sanitizeObject(obj[key]);
        }
    }

    return sanitized;
}

// Middleware principal de protección contra inyecciones SQL
const sqlInjectionProtection = (req, res, next) => {
    try {
        // Verificar y sanitizar body
        if (req.body) {
            // Verificar inyecciones SQL en los valores
            const checkInjection = (obj) => {
                if (typeof obj !== 'object' || obj === null) {
                    // No validar campos de contraseña o autenticación
                    if (req.path.includes('/auth/') && (typeof obj === 'string' && obj.length < 100)) {
                        return;
                    }
                    if (detectSQLInjection(obj)) {
                        throw new Error('Detectado intento de inyección SQL');
                    }
                    return;
                }

                Object.values(obj).forEach(value => {
                    checkInjection(value);
                });
            };

            // Verificar todo el body
            checkInjection(req.body);

            // Sanitizar el body
            req.body = sanitizeObject(req.body);
        }

        // Verificar y sanitizar query params
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                if (detectSQLInjection(req.query[key])) {
                    throw new Error('Detectado intento de inyección SQL en query params');
                }
            });
            req.query = sanitizeObject(req.query);
        }

        // Verificar y sanitizar params
        if (req.params) {
            Object.keys(req.params).forEach(key => {
                if (detectSQLInjection(req.params[key])) {
                    throw new Error('Detectado intento de inyección SQL en params');
                }
            });
            req.params = sanitizeObject(req.params);
        }

        next();
    } catch (error) {
        // Registrar el intento de inyección SQL
        console.error('🚨 Intento de inyección SQL detectado:', {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            method: req.method,
            path: req.path,
            body: req.body,
            query: req.query,
            params: req.params,
            error: error.message
        });
        
        // Log detallado para depuración
        console.log('🔍 Detalles de la detección:');
        if (req.body) {
            Object.entries(req.body).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    console.log(`   Campo '${key}':`, value);
                    console.log(`   ¿Detectado como malicioso?:`, detectSQLInjection(value));
                    if (detectSQLInjection(value)) {
                        console.log(`   Patrones detectados:`, 
                            SQL_INJECTION_PATTERNS
                                .filter(pattern => pattern.test(value))
                                .map(pattern => pattern.toString())
                        );
                    }
                }
            });
        }

        // Responder con error 400
        return res.status(400).json({
            error: 'Solicitud inválida',
            message: 'Se ha detectado contenido potencialmente malicioso'
        });
    }
};

module.exports = {
    sqlInjectionProtection,
    sanitizeString,
    detectSQLInjection
};
