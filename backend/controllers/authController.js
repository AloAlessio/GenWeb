// 🔐 CONTROLADOR DE AUTENTICACIÓN
// Este archivo maneja todas las operaciones relacionadas con autenticación de usuarios
// Incluye registro, login y gestión de usuarios

// 📦 IMPORTACIONES DE DEPENDENCIAS EXTERNAS
// bcryptjs: Librería para hashear contraseñas de forma segura usando algoritmo bcrypt
const bcrypt = require('bcryptjs');
// jsonwebtoken: Librería para crear y verificar tokens JWT (JSON Web Tokens)
const jwt = require('jsonwebtoken');

// 📦 IMPORTACIONES DE MODELOS LOCALES
// User: Modelo de Sequelize que representa la tabla 'users' en la base de datos
const User = require('../models/User');
// Importar funciones de seguridad
const { recordFailedAttempt, recordSuccessfulLogin } = require('../middleware/securityMiddleware');
const { sanitizeString } = require('../middleware/sqlInjectionMiddleware');

// 🔑 CONFIGURACIÓN DE VARIABLES DE ENTORNO
// SECRET_KEY: Clave secreta para firmar los tokens JWT, viene del archivo .env
// Esta clave debe ser única y segura, nunca debe exponerse en el código
const SECRET_KEY = process.env.SECRET_KEY;

// � FUNCIÓN DE REGISTRO DE USUARIOS
// Esta función maneja las peticiones POST para crear nuevas cuentas de usuario
// Endpoint: POST /api/auth/register
exports.register = async (req, res) => {
    try {
        // 📥 EXTRACCIÓN Y DESTRUCTURACIÓN DE DATOS DEL CLIENTE
        // req.body contiene el JSON enviado desde el frontend con los datos del formulario
        let { 
            nombre,      // String: Nombre completo del usuario (ej: "Juan Pérez García")
            email,       // String: Dirección de correo electrónico (ej: "juan@email.com")
            password     // String: Contraseña en texto plano (será encriptada antes de guardar)
        } = req.body;

        // Sanitizar inputs manualmente para mayor seguridad
        nombre = sanitizeString(nombre);
        email = sanitizeString(email?.toLowerCase());
        // No sanitizamos password porque será hasheada

        // 🔍 VALIDACIONES BÁSICAS DE ENTRADA
        if (!nombre || !email || !password) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios",
                camposRequeridos: ["nombre", "email", "password"]
            });
        }

        // 📧 VALIDACIÓN DE FORMATO DE EMAIL
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "El formato del correo electrónico es inválido",
                ejemplo: "usuario@dominio.com"
            });
        }

        // 🔒 VALIDACIÓN DE FORTALEZA DE CONTRASEÑA
        if (password.length < 6) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 6 caracteres",
                longitudActual: password.length,
                longitudMinima: 6
            });
        }

        // 🔍 VERIFICACIÓN DE USUARIO EXISTENTE
        // findOne busca un registro que coincida con la condición especificada
        // where: { email } es equivalente a WHERE email = 'valor_del_email' en SQL
        let user = await User.findOne({ where: { email } });
        
        // Si ya existe un usuario con ese email, retornamos error 400 (Bad Request)
        if (user) {
            console.log(`⚠️ Intento de registro con email duplicado: ${email}`);
            return res.status(400).json({ 
                message: "El correo ya está registrado. Intenta con otro o inicia sesión.",
                email: email,
                sugerencia: "Use la opción 'Iniciar Sesión' si ya tiene una cuenta"
            });
        }

        // 🔐 ENCRIPTACIÓN DE LA CONTRASEÑA
        // bcrypt.hash(contraseña, saltRounds) genera un hash seguro de la contraseña
        // saltRounds = 10 es un buen balance entre seguridad y rendimiento
        // Un salt más alto = más seguro pero más lento de procesar
        console.log(`🔐 Iniciando encriptación de contraseña para usuario: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`✅ Contraseña encriptada exitosamente`);

        // 💾 CREACIÓN DEL USUARIO EN LA BASE DE DATOS
        // User.create() inserta un nuevo registro en la tabla 'users'
        // Sequelize automáticamente:
        // 1. Asigna un ID único (auto_increment)
        // 2. Agrega timestamps (createdAt, updatedAt)
        // 3. Valida los tipos de datos según el modelo
        console.log(`👤 Creando nuevo usuario en la base de datos: ${email}`);
        user = await User.create({ 
            nombre: nombre.trim(),           // Eliminamos espacios en blanco
            email: email.toLowerCase(),      // Convertimos email a minúsculas
            password: hashedPassword         // Guardamos la contraseña encriptada
        });

        // 📊 REGISTRO DE AUDITORÍA
        console.log(`✅ Usuario creado exitosamente:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Nombre: ${user.nombre}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Fecha: ${new Date().toISOString()}`);

        // 🚫 PREPARACIÓN DE RESPUESTA (SIN CONTRASEÑA)
        // Creamos una copia del objeto usuario sin la contraseña por seguridad
        const usuarioSeguro = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        // ✅ RESPUESTA EXITOSA AL CLIENTE
        res.status(201).json({ 
            message: "Usuario registrado exitosamente",
            user: usuarioSeguro,  // Usuario sin contraseña
            timestamp: new Date().toISOString(),
            proximoPaso: "Proceda a iniciar sesión con sus credenciales"
        });

    } catch (error) {
        // 🚨 MANEJO ESPECÍFICO DE ERRORES DE SEQUELIZE
        console.error(`❌ Error durante el registro:`, error);

        // Error de constraint único (email duplicado)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                message: "El correo ya está registrado. Use otro correo.",
                tipo: "email_duplicado",
                campoConflicto: error.errors?.[0]?.path || "email"
            });
        }

        // Error de validación de Sequelize
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: "Errores de validación encontrados",
                errores: error.errors?.map(e => ({
                    campo: e.path,
                    mensaje: e.message,
                    valorRecibido: e.value
                }))
            });
        }

        // Error genérico del servidor
        res.status(500).json({ 
            message: "Error interno del servidor durante el registro",
            timestamp: new Date().toISOString(),
            errorId: `REG_${Date.now()}`  // ID único para rastrear el error
        });
    }
};



// � FUNCIÓN DE INICIO DE SESIÓN (LOGIN)
// Esta función maneja las peticiones POST para autenticar usuarios existentes
// Endpoint: POST /api/auth/login
exports.login = async (req, res) => {
    try {
        // 📥 EXTRACCIÓN DE CREDENCIALES DEL CLIENTE
        // req.body contiene las credenciales enviadas desde el formulario de login
        const { 
            email,      // String: Dirección de correo del usuario registrado
            password    // String: Contraseña en texto plano (será comparada con el hash)
        } = req.body;
        
        // 🔍 VALIDACIONES BÁSICAS DE ENTRADA
        if (!email || !password) {
            return res.status(400).json({
                message: "Email y contraseña son obligatorios",
                camposFaltantes: [
                    !email ? "email" : null,
                    !password ? "password" : null
                ].filter(Boolean)
            });
        }

        // 📧 VALIDACIÓN DE FORMATO DE EMAIL
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Formato de email inválido",
                emailRecibido: email
            });
        }

        // 📊 REGISTRO DE INTENTO DE LOGIN (PARA AUDITORÍA)
        console.log(`🔐 Intento de login para email: ${email}`);
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`🌐 IP: ${req.ip || 'No disponible'}`);
        console.log(`🖥️ User-Agent: ${req.get('User-Agent') || 'No disponible'}`);
        
        // 🔍 BÚSQUEDA DEL USUARIO EN LA BASE DE DATOS
        // findOne busca un único registro que coincida con el email
        // Equivale a: SELECT * FROM users WHERE email = 'usuario@email.com'
        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        
        // ❌ VALIDACIÓN DE EXISTENCIA DEL USUARIO
        if (!user) {
            console.log(`❌ Usuario no encontrado: ${email}`);
            // Por seguridad, no especificamos si el email existe o no
            return res.status(400).json({ 
                message: "Credenciales inválidas",
                sugerencia: "Verifique su email y contraseña"
            });
        }

        // 📋 INFORMACIÓN DEL USUARIO ENCONTRADO (PARA LOGS)
        console.log(`👤 Usuario encontrado:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Nombre: ${user.nombre}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Fecha registro: ${user.createdAt}`);

        // 🔐 COMPARACIÓN DE CONTRASEÑAS
        // bcrypt.compare compara la contraseña en texto plano con el hash guardado
        // Internamente bcrypt:
        // 1. Extrae el salt del hash guardado
        // 2. Aplica el mismo salt a la contraseña ingresada
        // 3. Compara los hashes resultantes
        console.log(`🔍 Verificando contraseña para usuario: ${user.email}`);
        const isMatch = await bcrypt.compare(password, user.password);
        
        // ❌ VALIDACIÓN DE CONTRASEÑA INCORRECTA
        if (!isMatch) {
            console.log(`❌ Contraseña incorrecta para usuario: ${email}`);
            
            // Registrar el intento fallido
            const attempts = recordFailedAttempt(email);
            
            // Actualizar en la base de datos
            await user.update({
                failedLoginAttempts: attempts.count,
                isLocked: attempts.isBlocked,
                lockExpiry: attempts.isBlocked ? new Date(Date.now() + 60000) : null // 1 minuto si está bloqueado
            });
            
            // Mensaje personalizado basado en los intentos
            const remainingAttempts = 5 - attempts.count;
            
            if (attempts.isBlocked) {
                return res.status(429).json({
                    message: "Cuenta temporalmente bloqueada por múltiples intentos fallidos",
                    timeRemaining: Math.ceil((60000 - (Date.now() - attempts.lastAttempt)) / 1000) // segundos restantes
                });
            }
            
            return res.status(400).json({ 
                message: "Credenciales inválidas",
                sugerencia: `Verifique su email y contraseña. Le quedan ${remainingAttempts} intentos antes del bloqueo temporal.`
            });
        }
        
        // Si llegamos aquí, el login fue exitoso - limpiar intentos fallidos
        recordSuccessfulLogin(email);

        // ✅ CREDENCIALES VÁLIDAS - GENERACIÓN DE TOKEN JWT
        console.log(`✅ Credenciales válidas para usuario: ${email}`);

        // 🎫 CREACIÓN DEL PAYLOAD DEL TOKEN
        // El payload contiene la información que queremos incluir en el token
        // IMPORTANTE: No incluir información sensible como contraseñas
        const tokenPayload = {
            id: user.id,              // ID único del usuario en la base de datos
            email: user.email,        // Email del usuario (para identificación)
            nombre: user.nombre,      // Nombre para personalización en el frontend
            iat: Math.floor(Date.now() / 1000)  // Issued At - cuándo se creó el token
        };

        // 🔐 OPCIONES DEL TOKEN JWT
        const tokenOptions = {
            expiresIn: '1h',          // Token expira en 1 hora por seguridad
            issuer: 'Gen Web App',    // Quién emitió el token
            audience: 'Gen Web Users' // Para quién está destinado el token
        };

        // 🎫 GENERACIÓN DEL TOKEN JWT
        // jwt.sign(payload, secretKey, options) crea un token firmado digitalmente
        // La firma garantiza que:
        // 1. El token no ha sido modificado
        // 2. Solo nuestro servidor puede crear tokens válidos
        // 3. Podemos verificar la autenticidad del token
        const token = jwt.sign(tokenPayload, SECRET_KEY, tokenOptions);

        // 📊 REGISTRO DE LOGIN EXITOSO
        console.log(`🎫 Token JWT generado exitosamente para usuario: ${user.email}`);
        console.log(`⏰ Token expira en: 1 hora`);
        console.log(`🔑 Token ID: ${tokenPayload.iat}`);

        // 🚫 PREPARACIÓN DE DATOS DEL USUARIO (SIN CONTRASEÑA)
        // Por seguridad, nunca enviamos la contraseña al frontend
        const usuarioSeguro = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        // 🍪 INFORMACIÓN ADICIONAL PARA EL FRONTEND
        const sesionInfo = {
            inicioSesion: new Date().toISOString(),
            expiraEn: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora desde ahora
            dispositivo: req.get('User-Agent')?.substring(0, 50) || 'Desconocido'
        };

        // Actualizar información de login exitoso en la base de datos
        await user.update({
            failedLoginAttempts: 0,
            isLocked: false,
            lockExpiry: null,
            lastLogin: new Date()
        });

        // ✅ RESPUESTA EXITOSA CON TOKEN Y DATOS DEL USUARIO
        res.json({ 
            message: "Inicio de sesión exitoso",
            // Datos principales de la respuesta
            token: token,           // Token JWT para autenticación en futuras peticiones
            user: {
                ...usuarioSeguro,   // Información del usuario sin datos sensibles
                lastLogin: user.lastLogin // Agregamos la última fecha de login
            },
            // Información adicional útil para el frontend
            sesion: sesionInfo,
            instrucciones: {
                uso: "Incluya este token en el header Authorization como 'Bearer [token]'",
                ejemplo: "Authorization: Bearer " + token.substring(0, 20) + "..."
            }
        });

    } catch (error) {
        // 🚨 MANEJO DETALLADO DE ERRORES
        const errorId = `LOGIN_${Date.now()}`;
        console.error(`❌ ${errorId} - Error durante el login:`, error);
        
        // Log detallado del error para debugging
        console.error(`📋 Detalles del error de login:`, {
            email: req.body?.email || 'No proporcionado',
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack?.split('\n')[0]
        });

        // Manejo específico de errores de JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(500).json({
                message: "Error en la generación del token de autenticación",
                errorId: errorId
            });
        }

        // Manejo específico de errores de bcrypt
        if (error.message?.includes('bcrypt')) {
            return res.status(500).json({
                message: "Error en la verificación de credenciales",
                errorId: errorId
            });
        }

        // Error genérico del servidor
        res.status(500).json({ 
            message: "Error interno del servidor durante el login",
            errorId: errorId,
            timestamp: new Date().toISOString()
        });
    }
};

// � FUNCIÓN PARA OBTENER LISTA DE TODOS LOS USUARIOS
// Esta función maneja las peticiones GET para listar usuarios registrados
// Endpoint: GET /api/auth/users
// NOTA: Esta función debería estar protegida y solo accesible para administradores
exports.users = async (req, res) => {
    try {
        // 📊 REGISTRO DE CONSULTA PARA AUDITORÍA
        console.log(`📋 Solicitud de lista de usuarios recibida`);
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`🌐 IP solicitante: ${req.ip || 'No disponible'}`);
        
        // ⚠️ VERIFICACIÓN DE SEGURIDAD (COMENTADA - PARA IMPLEMENTAR FUTURAMENTE)
        // En un sistema de producción, esta función debería verificar:
        // - Que el usuario esté autenticado (tiene token válido)
        // - Que el usuario tenga permisos de administrador
        // - Posible rate limiting para evitar abuso
        /*
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: "Acceso denegado. Se requieren permisos de administrador.",
                requiredRole: "admin",
                currentRole: req.user?.role || "no autenticado"
            });
        }
        */

        // 🔍 PARÁMETROS DE CONSULTA OPCIONALES
        // El frontend puede enviar parámetros para filtrar o paginar los resultados
        const {
            page = 1,           // Número de página (por defecto 1)
            limit = 10,         // Cantidad de usuarios por página (por defecto 10)
            search = '',        // Término de búsqueda opcional
            sortBy = 'createdAt', // Campo por el cual ordenar (por defecto fecha de creación)
            sortOrder = 'DESC'  // Orden ascendente (ASC) o descendente (DESC)
        } = req.query;

        // 🔢 VALIDACIÓN Y CONVERSIÓN DE PARÁMETROS NUMÉRICOS
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        
        // Validar que page y limit sean números positivos
        if (isNaN(pageNumber) || pageNumber < 1) {
            return res.status(400).json({
                message: "El número de página debe ser un entero positivo",
                valorRecibido: page
            });
        }
        
        if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
            return res.status(400).json({
                message: "El límite debe ser entre 1 y 100",
                valorRecibido: limit
            });
        }

        // 🏗️ CONSTRUCCIÓN DE OPCIONES DE CONSULTA
        const queryOptions = {
            // 📋 CAMPOS A SELECCIONAR (EXCLUYENDO CONTRASEÑAS POR SEGURIDAD)
            // attributes especifica exactamente qué columnas queremos obtener
            // Esto es importante para:
            // 1. Seguridad: No exponer contraseñas
            // 2. Rendimiento: Solo traer datos necesarios
            // 3. Ancho de banda: Reducir tamaño de respuesta
            attributes: [
                'id',           // ID único del usuario
                'nombre',       // Nombre completo del usuario
                'email',        // Dirección de correo electrónico
                'createdAt',    // Fecha y hora de registro
                'updatedAt'     // Fecha y hora de última actualización
            ],
            
            // 📄 PAGINACIÓN
            // offset: cuántos registros saltar (para paginación)
            // limit: máximo número de registros a devolver
            offset: (pageNumber - 1) * limitNumber,
            limit: limitNumber,
            
            // 📊 ORDENAMIENTO
            // order: [['campo', 'ASC|DESC']] especifica cómo ordenar los resultados
            order: [[sortBy, sortOrder.toUpperCase()]]
        };

        // 🔍 FILTRO DE BÚSQUEDA (SI SE PROPORCIONA)
        if (search && search.trim() !== '') {
            // Importamos Op para usar operadores de Sequelize
            const { Op } = require('sequelize');
            
            // Configuramos búsqueda en múltiples campos usando LIKE
            queryOptions.where = {
                [Op.or]: [
                    { 
                        nombre: { 
                            [Op.like]: `%${search.trim()}%`  // Buscar en nombre
                        } 
                    },
                    { 
                        email: { 
                            [Op.like]: `%${search.trim()}%`   // Buscar en email
                        } 
                    }
                ]
            };
            
            console.log(`🔍 Aplicando filtro de búsqueda: "${search}"`);
        }

        // 📊 EJECUCIÓN DE CONSULTAS PARALELAS PARA EFICIENCIA
        // Ejecutamos dos consultas simultáneamente:
        // 1. findAndCountAll: obtiene usuarios + cuenta total
        // 2. No necesitamos consulta separada ya que findAndCountAll da ambos resultados
        console.log(`📋 Ejecutando consulta de usuarios con opciones:`, {
            page: pageNumber,
            limit: limitNumber,
            search: search || 'sin filtro',
            sortBy,
            sortOrder
        });

        // 🔍 CONSULTA PRINCIPAL CON CONTEO
        // findAndCountAll devuelve tanto los registros como el conteo total
        const result = await User.findAndCountAll(queryOptions);
        
        // 📊 EXTRACCIÓN DE RESULTADOS
        const users = result.rows;      // Array de usuarios encontrados
        const totalUsers = result.count; // Número total de usuarios (sin paginación)

        // 📈 CÁLCULO DE METADATOS DE PAGINACIÓN
        const totalPages = Math.ceil(totalUsers / limitNumber);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;

        // 📊 ESTADÍSTICAS ADICIONALES
        const estadisticas = {
            usuariosEnPagina: users.length,
            totalUsuarios: totalUsers,
            paginaActual: pageNumber,
            totalPaginas: totalPages,
            usuariosPorPagina: limitNumber,
            hayPaginaSiguiente: hasNextPage,
            hayPaginaAnterior: hasPrevPage,
            filtroAplicado: search ? search.trim() : null,
            tiempoConsulta: new Date().toISOString()
        };

        // 🔒 REGISTRO DE AUDITORÍA DE LA CONSULTA
        console.log(`✅ Consulta de usuarios completada exitosamente:`);
        console.log(`   👥 Usuarios devueltos: ${users.length}`);
        console.log(`   📊 Total en sistema: ${totalUsers}`);
        console.log(`   📄 Página: ${pageNumber}/${totalPages}`);

        // ✅ RESPUESTA EXITOSA CON USUARIOS Y METADATOS
        res.json({ 
            message: "Usuarios obtenidos exitosamente",
            // 👥 DATOS PRINCIPALES
            users: users,  // Array de usuarios (sin contraseñas)
            
            // 📊 METADATOS DE PAGINACIÓN Y FILTROS
            paginacion: {
                paginaActual: pageNumber,
                totalPaginas: totalPages,
                totalUsuarios: totalUsers,
                usuariosPorPagina: limitNumber,
                hayMas: hasNextPage,
                hayAnterior: hasPrevPage
            },
            
            // 🔍 INFORMACIÓN DE FILTROS Y ORDENAMIENTO
            filtros: {
                busqueda: search || null,
                ordenadoPor: sortBy,
                orden: sortOrder,
                resultadosEncontrados: users.length
            },
            
            // 📊 ESTADÍSTICAS GENERALES
            estadisticas: estadisticas,
            
            // 🔗 ENLACES DE NAVEGACIÓN PARA EL FRONTEND
            navegacion: {
                siguientePagina: hasNextPage ? `${req.baseUrl}${req.path}?page=${pageNumber + 1}&limit=${limitNumber}` : null,
                paginaAnterior: hasPrevPage ? `${req.baseUrl}${req.path}?page=${pageNumber - 1}&limit=${limitNumber}` : null
            }
        });

    } catch (error) {
        // 🚨 MANEJO DETALLADO DE ERRORES
        const errorId = `USERS_LIST_${Date.now()}`;
        console.error(`❌ ${errorId} - Error al obtener lista de usuarios:`, error);
        
        // Log detallado para debugging
        console.error(`📋 Detalles del error:`, {
            parametros: req.query,
            errorName: error.name,
            errorMessage: error.message,
            timestamp: new Date().toISOString()
        });

        // Manejo específico de errores de Sequelize
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                message: "Error en la consulta a la base de datos",
                sugerencia: "Contacte al administrador del sistema",
                errorId: errorId
            });
        }

        // Error genérico del servidor
        res.status(500).json({ 
            message: "Error interno del servidor al obtener usuarios",
            errorId: errorId,
            timestamp: new Date().toISOString()
        });
    }
};
