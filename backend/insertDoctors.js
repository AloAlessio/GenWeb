const sequelize = require('./db'); 
const Doctor = require('./models/Doctor');

async function insertarDoctores() {
    await sequelize.sync(); // Asegura que la tabla existe

    const doctores = [
        { nombre: "Dr. Alonso Jimenez", especialidad: "Neurología", modalidad: "Presencial", imagen: "doc1.png" },
        { nombre: "Dra. Melissa Lara", especialidad: "Pediatría", modalidad: "Virtual", imagen: "doc3.png" },
        { nombre: "Dr. Diego Hernandez", especialidad: "Cardiología", modalidad: "Presencial", imagen: "doc2.png" },
        { nombre: "Dra. Kelly Palomares", especialidad: "Dermatología", modalidad: "Virtual", imagen: "doc7.png" },
        { nombre: "Dr. Mauricio Rocha", especialidad: "Infectología", modalidad: "Presencial", imagen: "doc6.png" },
        { nombre: "Dr. Alexis Hernandez", especialidad: "Otorrinolaringología", modalidad: "Presencial", imagen: "doc5.png" },
        { nombre: "Dr. Gonzalo Mendoza", especialidad: "Anestesiología", modalidad: "Virtual", imagen: "doc4.png" }
    ];

    try {
        await Doctor.bulkCreate(doctores);
        console.log("✅ Doctores insertados correctamente");
    } catch (error) {
        console.error("❌ Error insertando doctores:", error);
    } finally {
        sequelize.close();
    }
}

insertarDoctores();
