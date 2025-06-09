const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./db');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const citaRoutes = require('./routes/citaRoutes');
const recetaRoutes = require('./routes/recetaRoutes');
const emailRoutes = require('./routes/emailRoutes');

// Import models to register them with Sequelize
require('./models/User');
require('./models/Doctor');
require('./models/Cita');
require('./models/Receta');

const path = require('path');

// 🔹 Nuevo: importamos rss-parser
const Parser = require('rss-parser');
const parser = new Parser();

// 🔹 Iniciamos la app
const app = express();
app.use(cors());  // 🔹 Permitir solicitudes de otros orígenes
app.use(express.json());  // 🔹 Permitir recibir JSON

// 📌 Rutas
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/email', emailRoutes);

// 🔹 Ruta para obtener el feed RSS de biotecnología en México
app.get('/rss-biotecnologia', async (req, res) => {
  try {
    // URL del feed (puedes ajustarla si quieres otra fuente)
    const feedUrl = 'https://news.google.com/rss/search?q=biotecnolog%C3%ADa%20mexico';

    // Parseamos el RSS con rss-parser
    const feed = await parser.parseURL(feedUrl);

    // Retornamos el objeto feed en formato JSON
    res.json(feed);
  } catch (error) {
    console.error('Error al obtener el feed RSS:', error);
    res.status(500).json({ message: 'Error al obtener el feed RSS' });
  }
});

// Servir contenido estático (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// 📌 Iniciar Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    try {
        await sequelize.sync();
        console.log("✅ Base de datos sincronizada");
    } catch (error) {
        console.error("❌ Error al sincronizar la BD:", error);
    }
});
