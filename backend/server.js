// Importamos Express: framework web de Node.js para crear aplicaciones HTTP
const express = require('express');
// Importamos CORS: middleware para permitir solicitudes entre dominios diferentes
const cors = require('cors');
// Cargamos las variables de entorno desde el archivo .env
require('dotenv').config();
// Importamos la configuración de conexión a la base de datos
const sequelize = require('./db');

// Importamos todas las rutas de la aplicación
const authRoutes = require('./routes/authRoutes');        // Rutas de autenticación
const doctorRoutes = require('./routes/doctorRoutes');    // Rutas de gestión de doctores
const citaRoutes = require('./routes/citaRoutes');        // Rutas de gestión de citas
const recetaRoutes = require('./routes/recetaRoutes');    // Rutas de gestión de recetas
const emailRoutes = require('./routes/emailRoutes');      // Rutas de gestión de emails

// Importamos modelos para registrarlos con Sequelize
// Esto es importante para que Sequelize reconozca las tablas y sus relaciones
require('./models/User');      // Modelo de usuarios
require('./models/Doctor');    // Modelo de doctores
require('./models/Cita');      // Modelo de citas médicas
require('./models/Receta');    // Modelo de recetas médicas

// Importamos path para manejar rutas de archivos del sistema
const path = require('path');

// 🔹 Importamos rss-parser para leer feeds RSS de noticias
const Parser = require('rss-parser');
// Creamos una instancia del parser RSS
const parser = new Parser();

// 🔹 Creamos la aplicación Express
const app = express();
// Configuramos CORS para permitir solicitudes desde el frontend (diferentes puertos)
app.use(cors());  // 🔹 Permitir solicitudes de otros orígenes
// Configuramos middleware para parsear JSON en las peticiones
app.use(express.json());  // 🔹 Permitir recibir JSON en req.body

// Importar y aplicar protección contra inyecciones SQL
const { sqlInjectionProtection } = require('./middleware/sqlInjectionMiddleware');
app.use(sqlInjectionProtection);

// 📌 Configuración de rutas de la API
// Cada ruta tiene un prefijo que agrupa funcionalidades relacionadas
app.use('/api/auth', authRoutes);      // /api/auth/* - Rutas de registro, login, usuarios
app.use('/api/doctors', doctorRoutes); // /api/doctors/* - Rutas de gestión de doctores
app.use('/api/citas', citaRoutes);     // /api/citas/* - Rutas de gestión de citas médicas
app.use('/api/recetas', recetaRoutes); // /api/recetas/* - Rutas de gestión de recetas
app.use('/api/email', emailRoutes);    // /api/email/* - Rutas de configuración y envío de emails

// 🔹 Ruta personalizada para obtener feed RSS de noticias de biotecnología en México
// GET /rss-biotecnologia
app.get('/rss-biotecnologia', async (req, res) => {
  try {
    // URL del feed RSS de Google News filtrado por biotecnología en México
    // %C3%ADa es la codificación URL de 'í' en biotecnología
    const feedUrl = 'https://news.google.com/rss/search?q=biotecnolog%C3%ADa%20mexico';

    // parseURL() obtiene y parsea el feed RSS de la URL especificada
    // Convierte el XML del RSS en un objeto JavaScript fácil de usar
    const feed = await parser.parseURL(feedUrl);

    // Retornamos el feed completo en formato JSON al cliente
    // Incluye título, descripción, artículos, fechas, etc.
    res.json(feed);
  } catch (error) {
    // Si hay error al obtener o parsear el feed, lo registramos
    console.error('Error al obtener el feed RSS:', error);
    // Devolvemos error 500 con mensaje descriptivo
    res.status(500).json({ message: 'Error al obtener el feed RSS' });
  }
});

// Configuramos Express para servir archivos estáticos del frontend
// Esto permite que el servidor sirva HTML, CSS, JS, imágenes, etc.
// path.join() construye la ruta al directorio frontend de forma segura
app.use(express.static(path.join(__dirname, '../frontend')));

// 📌 Configuración e inicio del servidor
// Obtenemos el puerto desde las variables de entorno o usamos 5000 por defecto
const PORT = process.env.PORT || 5000;

// Iniciamos el servidor HTTP en el puerto especificado
app.listen(PORT, async () => {
    // Mensaje de confirmación que el servidor está corriendo
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    
    try {
        // Sincronizamos la base de datos con los modelos definidos
        // sync() crea las tablas si no existen y las actualiza si hay cambios en los modelos
        await sequelize.sync();
        console.log("✅ Base de datos sincronizada");
    } catch (error) {
        // Si hay error en la sincronización de la BD, lo registramos
        console.error("❌ Error al sincronizar la BD:", error);
    }
});
