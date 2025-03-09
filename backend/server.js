const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./db');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const citaRoutes = require('./routes/citaRoutes'); 

const app = express();
app.use(cors());  // 🔹 Permitir solicitudes de otros orígenes
app.use(express.json());  // 🔹 Permitir recibir JSON

// 📌 Rutas
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/citas', citaRoutes);

const path = require('path');
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
