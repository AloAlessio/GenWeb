const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('genweb', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => console.log('✅ Conectado a la base de datos MySQL'))
    .catch(err => console.error('❌ Error en la conexión MySQL:', err));

module.exports = sequelize;
