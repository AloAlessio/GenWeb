// Importamos la clase Sequelize desde el paquete sequelize
// Sequelize es un ORM (Object-Relational Mapping) para bases de datos SQL
const { Sequelize } = require('sequelize');

// Creamos una nueva instancia de conexión a la base de datos MySQL
// Constructor: new Sequelize(database, username, password, options)
const sequelize = new Sequelize('genweb', 'root', '', {
    host: 'localhost',          // Servidor de la base de datos (local en este caso)
    dialect: 'mysql'            // Tipo de base de datos (MySQL)
    // Nota: Se usan valores hardcodeados en lugar de variables de entorno
    // En producción debería usarse process.env.DB_NAME, process.env.DB_USER, etc.
});

// Probamos la conexión a la base de datos de forma asíncrona
sequelize.authenticate()
    .then(() => console.log('✅ Conectado a la base de datos MySQL'))
    .catch(err => console.error('❌ Error en la conexión MySQL:', err));

// Exportamos la instancia de sequelize para usarla en otros archivos
// Esto permite que los modelos y el servidor principal usen la misma conexión
module.exports = sequelize;
