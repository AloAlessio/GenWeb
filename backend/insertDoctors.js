// Script para poblar la base de datos con datos iniciales de doctores
// Importamos la conexión a la base de datos
const sequelize = require('./db'); 
// Importamos el modelo Doctor para crear registros
const Doctor = require('./models/Doctor');

// Función asíncrona principal para insertar doctores en la base de datos
async function insertarDoctores() {
    // sync() asegura que la tabla 'doctors' existe en la base de datos
    // Si no existe, la crea basándose en el modelo Doctor
    await sequelize.sync(); // Asegura que la tabla existe

    // Array con los datos de los doctores que queremos insertar
    // Cada objeto representa un doctor con sus especialidades y modalidades
    const doctores = [
        { 
            nombre: "Dr. Alonso Jimenez", 
            especialidad: "Neurología",           // Especialidad médica
            modalidad: "Presencial",              // Tipo de consulta
            imagen: "doc1.png"                    // Archivo de imagen del doctor
        },
        { 
            nombre: "Dra. Melissa Lara", 
            especialidad: "Pediatría", 
            modalidad: "Virtual",                 // Consultas por videollamada
            imagen: "doc3.png" 
        },
        { 
            nombre: "Dr. Diego Hernandez", 
            especialidad: "Cardiología", 
            modalidad: "Presencial", 
            imagen: "doc2.png" 
        },
        { 
            nombre: "Dra. Kelly Palomares", 
            especialidad: "Dermatología", 
            modalidad: "Virtual", 
            imagen: "doc7.png" 
        },
        { 
            nombre: "Dr. Mauricio Rocha", 
            especialidad: "Infectología", 
            modalidad: "Presencial", 
            imagen: "doc6.png" 
        },
        { 
            nombre: "Dr. Alexis Hernandez", 
            especialidad: "Otorrinolaringología",  // Especialidad de oído, nariz y garganta
            modalidad: "Presencial", 
            imagen: "doc5.png" 
        },
        { 
            nombre: "Dr. Gonzalo Mendoza", 
            especialidad: "Anestesiología", 
            modalidad: "Virtual", 
            imagen: "doc4.png" 
        }
    ];

    try {
        // bulkCreate() inserta múltiples registros en una sola operación
        // Es más eficiente que hacer múltiples create() individuales
        await Doctor.bulkCreate(doctores);
        console.log("✅ Doctores insertados correctamente");
    } catch (error) {
        // Si hay algún error durante la inserción, lo capturamos y mostramos
        console.error("❌ Error insertando doctores:", error);
    } finally {
        // finally se ejecuta siempre, haya error o no
        // Cerramos la conexión a la base de datos para liberar recursos
        sequelize.close();
    }
}

// Ejecutamos la función principal
// Este script se ejecuta directamente: node insertDoctors.js
insertarDoctores();
