// Importamos bcryptjs para encriptar contraseñas de forma segura
const bcrypt = require('bcryptjs');
// Importamos jsonwebtoken para crear tokens de autenticación JWT
const jwt = require('jsonwebtoken');
// Importamos el modelo User para interactuar con la tabla de usuarios
const User = require('../models/User');

// Obtenemos la clave secreta desde las variables de entorno para firmar los JWT
const SECRET_KEY = process.env.SECRET_KEY;

// 🔹 REGISTRO DE USUARIO
// Función asíncrona que maneja el registro de nuevos usuarios
exports.register = async (req, res) => {
    try {
        // Destructuramos los datos que vienen en el cuerpo de la petición HTTP
        const { nombre, email, password } = req.body;

        // Verificar si el usuario ya existe en la base de datos
        // findOne busca un registro que coincida con la condición (email igual al enviado)
        let user = await User.findOne({ where: { email } });
        // Si ya existe un usuario con ese email, devolvemos error 400 (Bad Request)
        if (user) {
            return res.status(400).json({ message: "El correo ya está registrado, intenta con otro." });
        }

        // Hashear (encriptar) la contraseña antes de guardarla en la BD
        // bcrypt.hash(contraseña, rounds) - 10 rounds es un buen balance seguridad/velocidad
        const hashedPassword = await bcrypt.hash(password, 10);
        // Crear el nuevo usuario en la base de datos con la contraseña encriptada
        user = await User.create({ nombre, email, password: hashedPassword });

        // Devolver respuesta exitosa con el usuario creado (sin la contraseña)
        res.json({ message: "Usuario registrado exitosamente", user });
    } catch (error) {
        // Manejo específico de error de constraint único (email duplicado)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "El correo ya está registrado. Usa otro correo." });
        }
        // Error genérico del servidor (status 500)
        res.status(500).json({ message: "Error en el servidor", error });
    }
};



// 🔹 LOGIN DE USUARIO
// Función asíncrona que maneja el inicio de sesión de usuarios
exports.login = async (req, res) => {
    try {
        // Extraemos email y password del cuerpo de la petición
        const { email, password } = req.body;
        
        // Verificar si el usuario existe en la base de datos
        // Buscamos por email ya que debe ser único
        const user = await User.findOne({ where: { email } });
        // Si no existe el usuario, devolvemos error 400
        if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

        // Comparar la contraseña ingresada con la encriptada guardada en BD
        // bcrypt.compare(contraseñaTextoPlano, contraseñaEncriptada)
        const isMatch = await bcrypt.compare(password, user.password);
        // Si las contraseñas no coinciden, devolvemos error
        if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

        // Generar Token JWT (JSON Web Token) para autenticación
        // jwt.sign(payload, secretKey, options)
        // payload: datos que queremos incluir en el token
        // expiresIn: tiempo de vida del token (1 hora)
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        // Devolver respuesta exitosa con el token y datos del usuario
        res.json({ message: "Inicio de sesión exitoso", token, user });
    } catch (error) {
        // Manejo de errores generales del servidor
        res.status(500).json({ message: "Error en el servidor", error });
    }
};

// 🔹 OBTENER USUARIOS
// Función para obtener la lista de todos los usuarios registrados
exports.users = async (req, res) => {
    try {
        // findAll() obtiene todos los registros de la tabla users
        // attributes especifica qué campos queremos obtener (excluimos password por seguridad)
        const users = await User.findAll({
            attributes: ['id', 'nombre', 'email'] // Evitamos enviar contraseñas al frontend
        });

        // Devolvemos la lista de usuarios
        res.json({ message: "Usuarios obtenidos exitosamente", users });
    } catch (error) {
        // Manejo de errores del servidor
        res.status(500).json({ message: "Error en el servidor", error });
    }
};
