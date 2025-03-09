const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = process.env.SECRET_KEY;

// 🔹 REGISTRO DE USUARIO
exports.register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si el usuario ya existe
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: "El correo ya está registrado, intenta con otro." });
        }

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({ nombre, email, password: hashedPassword });

        res.json({ message: "Usuario registrado exitosamente", user });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "El correo ya está registrado. Usa otro correo." });
        }
        res.status(500).json({ message: "Error en el servidor", error });
    }
};



// 🔹 LOGIN DE USUARIO
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Verificar si el usuario existe
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

        // Generar Token
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: "Inicio de sesión exitoso", token, user });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
};

// 🔹 OBTENER USUARIOS
exports.users = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'nombre', 'email'] // Evitamos enviar contraseñas
        });

        res.json({ message: "Usuarios obtenidos exitosamente", users });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
};
