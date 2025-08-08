// testSecurity.js - Script para probar la seguridad contra inyecciones SQL

const axios = require('axios');

// URL base de la API
const API_URL = 'http://localhost:5000';

// Función para probar un intento de login
async function testLogin(credentials, description) {
    console.log(`\n🧪 Probando: ${description}`);
    console.log('📝 Credenciales:', credentials);

    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, credentials, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;
        
        console.log('📊 Resultado:');
        console.log('   Status:', response.status);
        console.log('   Respuesta:', data);
        
        // Verificar si fue bloqueado por el middleware de seguridad
        const wasBlocked = false; // Las peticiones exitosas no son bloqueadas
        console.log('🛡️ ¿Bloqueado por seguridad?:', wasBlocked ? 'Sí ✅' : 'No ❌');

    } catch (error) {
        console.log('📊 Resultado:');
        if (error.code === 'ECONNREFUSED') {
            console.log('   Error: El servidor no está en ejecución. Por favor, inicia el servidor con "npm start"');
        } else {
            console.log('   Status:', error.response?.status || 500);
            console.log('   Respuesta:', error.response?.data || error.message);
            console.log('   Error detallado:', error.message);
        }
        
        // Verificar si fue bloqueado por el middleware de seguridad
        const wasBlocked = error.response?.status === 400 && (
            error.response?.data?.error === 'Solicitud inválida' ||
            error.response?.data?.message === 'Formato de email inválido' ||
            error.response?.data?.message?.includes('Se ha detectado contenido potencialmente malicioso')
        );
        console.log('🛡️ ¿Bloqueado por seguridad?:', wasBlocked ? 'Sí ✅' : 'No ❌');
    }
}

// Casos de prueba
async function runTests() {
    console.log('🚀 Iniciando pruebas de seguridad...\n');

    // 1. Login normal (debería pasar)
    await testLogin({
        email: "usuario@ejemplo.com",
        password: "Contraseña123!"
    }, "Login normal válido");

    // 2. Inyección SQL básica
    await testLogin({
        email: "admin@test.com' OR '1'='1",
        password: "cualquier_cosa"
    }, "Inyección SQL básica con OR");

    // 3. Inyección SQL con comentarios
    await testLogin({
        email: "admin@test.com'; --",
        password: "no_importa"
    }, "Inyección SQL con comentarios");

    // 4. Inyección UNION
    await testLogin({
        email: "fake@mail.com' UNION SELECT * FROM users; --",
        password: "test"
    }, "Inyección SQL con UNION");

    // 5. Ataque de tiempo (time-based)
    await testLogin({
        email: "test@mail.com' AND SLEEP(5); --",
        password: "test"
    }, "Ataque basado en tiempo");

    // 6. Email válido con caracteres especiales (debería pasar)
    await testLogin({
        email: "usuario.nombre+tag@dominio.com",
        password: "Contraseña.Segura123!"
    }, "Email válido con caracteres especiales");

    // 7. Contraseña compleja válida (debería pasar)
    await testLogin({
        email: "normal@mail.com",
        password: "P@ssw0rd!#$%"
    }, "Contraseña con caracteres especiales válidos");

    console.log('\n✅ Pruebas completadas');
}

// Ejecutar las pruebas
runTests().catch(console.error);
