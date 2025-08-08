// 👨‍⚕️ CONTROLADOR DE DOCTORES
// Este archivo maneja todas las operaciones relacionadas con la gestión de doctores
// Incluye listado completo, filtrado por especialidad y modalidad

// 📦 IMPORTACIONES DE DEPENDENCIAS
// Op: Objeto que contiene operadores de Sequelize para consultas avanzadas
// Permite usar LIKE, IN, BETWEEN, GT, LT, etc. en las consultas SQL
const { Op } = require('sequelize');

// 📦 IMPORTACIÓN DEL MODELO LOCAL
// Doctor: Modelo de Sequelize que representa la tabla 'doctors' en la base de datos
// Contiene toda la estructura y validaciones definidas para los doctores
const Doctor = require('../models/Doctor');

// 👥 FUNCIÓN PARA OBTENER TODOS LOS DOCTORES
// Esta función maneja las peticiones GET para listar todos los doctores disponibles
// Endpoint: GET /api/doctors
exports.getAllDoctors = async (req, res) => {
    try {
        // 📊 REGISTRO DE CONSULTA PARA AUDITORÍA
        console.log(`👨‍⚕️ Solicitud de lista completa de doctores recibida`);
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`🌐 IP solicitante: ${req.ip || 'No disponible'}`);

        // 🔍 PARÁMETROS DE CONSULTA OPCIONALES PARA ORDENAMIENTO
        const {
            sortBy = 'nombre',      // Campo por el cual ordenar (por defecto nombre)
            sortOrder = 'ASC',      // Orden ascendente (ASC) o descendente (DESC)
            includeInactive = false // Si incluir doctores inactivos (por defecto false)
        } = req.query;

        // 🏗️ CONSTRUCCIÓN DE OPCIONES DE CONSULTA
        const queryOptions = {
            // 📊 ORDENAMIENTO DE RESULTADOS
            // order: [['campo', 'ASC|DESC']] especifica cómo ordenar
            order: [[sortBy, sortOrder.toUpperCase()]],
            
            // 📋 CAMPOS A INCLUIR EN LA RESPUESTA
            where: includeInactive ? {} : { activo: true },
            attributes: [
                'id',              // ID único del doctor
                'nombre',          // Nombre completo del doctor
                'especialidad',    // Especialidad médica
                'modalidad',       // Tipo de consulta (Virtual/Presencial)
                'telefono',        // Número de contacto
                'email',           // Correo electrónico
                'horarios',        // Horarios de atención
                'experiencia',     // Años de experiencia
                'costo',           // Costo de la consulta
                'imagen',          // URL de la foto del doctor
                'activo',          // Estado activo/inactivo
                'createdAt',       // Fecha de registro
                'updatedAt'        // Fecha de última actualización
            ]
        };

        // 🔍 FILTRO DE DOCTORES ACTIVOS (SI APLICA)
        if (!includeInactive) {
            queryOptions.where = {
                activo: true  // Solo doctores activos por defecto
            };
            console.log(`🔍 Filtrando solo doctores activos`);
        }

        // 📊 VALIDACIÓN DE PARÁMETROS DE ORDENAMIENTO
        const camposValidos = ['id', 'nombre', 'especialidad', 'modalidad', 'experiencia', 'costo', 'createdAt'];
        if (!camposValidos.includes(sortBy)) {
            return res.status(400).json({
                message: "Campo de ordenamiento inválido",
                campoRecibido: sortBy,
                camposValidos: camposValidos
            });
        }

        if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
            return res.status(400).json({
                message: "Orden de clasificación inválido",
                ordenRecibido: sortOrder,
                valoresValidos: ['ASC', 'DESC']
            });
        }

        // 🔍 EJECUCIÓN DE LA CONSULTA PRINCIPAL
        console.log(`📋 Ejecutando consulta de doctores con opciones:`, {
            ordenadoPor: sortBy,
            orden: sortOrder,
            incluirInactivos: includeInactive
        });

        // 💾 CONSULTA A LA BASE DE DATOS
        // findAll() ejecuta una consulta SELECT con todas las condiciones especificadas
        // Equivale a: SELECT [campos] FROM doctors WHERE [condiciones] ORDER BY [ordenamiento]
        const doctors = await Doctor.findAll(queryOptions);

        // 📊 PROCESAMIENTO Y ANÁLISIS DE RESULTADOS
        const totalDoctors = doctors.length;
        
        // Análisis por especialidades
        const especialidadesCount = {};
        const modalidadesCount = {};
        let totalExperiencia = 0;
        let costoPromedio = 0;
        let doctoresConImagen = 0;

        // Iteramos sobre todos los doctores para generar estadísticas
        doctors.forEach(doctor => {
            // Conteo por especialidades
            const especialidad = doctor.especialidad || 'Sin especialidad';
            especialidadesCount[especialidad] = (especialidadesCount[especialidad] || 0) + 1;
            
            // Conteo por modalidades
            const modalidad = doctor.modalidad || 'Sin modalidad';
            modalidadesCount[modalidad] = (modalidadesCount[modalidad] || 0) + 1;
            
            // Cálculos para promedios
            if (doctor.experiencia) totalExperiencia += doctor.experiencia;
            if (doctor.costo) costoPromedio += parseFloat(doctor.costo);
            if (doctor.imagen) doctoresConImagen++;
        });

        // Cálculo de promedios
        const experienciaPromedio = totalDoctors > 0 ? (totalExperiencia / totalDoctors).toFixed(1) : 0;
        costoPromedio = totalDoctors > 0 ? (costoPromedio / totalDoctors).toFixed(2) : 0;

        // 📊 ESTADÍSTICAS DETALLADAS
        const estadisticas = {
            totalDoctores: totalDoctors,
            doctoresActivos: doctors.filter(d => d.activo).length,
            doctoresInactivos: doctors.filter(d => !d.activo).length,
            especialidades: especialidadesCount,
            modalidades: modalidadesCount,
            experienciaPromedio: parseFloat(experienciaPromedio),
            costoPromedio: parseFloat(costoPromedio),
            doctoresConImagen: doctoresConImagen,
            porcentajeConImagen: totalDoctors > 0 ? ((doctoresConImagen / totalDoctors) * 100).toFixed(1) : 0,
            tiempoConsulta: new Date().toISOString()
        };

        // 🔒 REGISTRO DE AUDITORÍA DE LA CONSULTA
        console.log(`✅ Consulta de doctores completada exitosamente:`);
        console.log(`   👨‍⚕️ Doctores devueltos: ${totalDoctors}`);
        console.log(`   ✅ Doctores activos: ${estadisticas.doctoresActivos}`);
        console.log(`   ❌ Doctores inactivos: ${estadisticas.doctoresInactivos}`);
        console.log(`   🏥 Especialidades: ${Object.keys(especialidadesCount).length}`);

        // ✅ RESPUESTA EXITOSA CON DOCTORES Y METADATOS
        res.json({
            message: "Doctores obtenidos exitosamente",
            // 👨‍⚕️ DATOS PRINCIPALES
            doctors: doctors,  // Array completo de doctores
            
            // 📊 ESTADÍSTICAS Y METADATOS
            estadisticas: estadisticas,
            
            // 🔍 INFORMACIÓN DE CONSULTA
            parametrosConsulta: {
                ordenadoPor: sortBy,
                orden: sortOrder,
                incluirInactivos: includeInactive,
                totalResultados: totalDoctors
            },
            
            // 💡 INFORMACIÓN ÚTIL PARA EL FRONTEND
            resumen: {
                especialidadesDisponibles: Object.keys(especialidadesCount),
                modalidadesDisponibles: Object.keys(modalidadesCount),
                rangoExperiencia: {
                    minima: Math.min(...doctors.filter(d => d.experiencia).map(d => d.experiencia)),
                    maxima: Math.max(...doctors.filter(d => d.experiencia).map(d => d.experiencia)),
                    promedio: experienciaPromedio
                },
                rangoCosto: {
                    minimo: Math.min(...doctors.filter(d => d.costo).map(d => parseFloat(d.costo))),
                    maximo: Math.max(...doctors.filter(d => d.costo).map(d => parseFloat(d.costo))),
                    promedio: costoPromedio
                }
            }
        });

    } catch (error) {
        // 🚨 MANEJO DETALLADO DE ERRORES
        const errorId = `GET_DOCTORS_${Date.now()}`;
        console.error(`❌ ${errorId} - Error al obtener lista de doctores:`, error);
        
        // Log detallado para debugging
        console.error(`📋 Detalles del error:`, {
            parametros: req.query,
            errorName: error.name,
            errorMessage: error.message,
            timestamp: new Date().toISOString()
        });

        // Manejo específico de errores de Sequelize
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                message: "Error en la consulta de doctores a la base de datos",
                sugerencia: "Verifique la conexión a la base de datos",
                errorId: errorId
            });
        }

        // Error genérico del servidor
        res.status(500).json({ 
            message: "Error interno del servidor al obtener doctores",
            errorId: errorId,
            timestamp: new Date().toISOString()
        });
    }
};

// 🔍 FUNCIÓN PARA FILTRAR DOCTORES POR ESPECIALIDAD Y/O MODALIDAD
// Esta función maneja las peticiones GET con parámetros de filtrado
// Endpoint: GET /api/doctors/filter?especialidad=cardiologia&modalidad=virtual
exports.filterDoctors = async (req, res) => {
    try {
        // 📥 EXTRACCIÓN DE PARÁMETROS DE FILTRADO
        // req.query contiene todos los parámetros que vienen después del ? en la URL
        let { 
            especialidad,    // String: Especialidad médica a filtrar (ej: "cardiología")
            modalidad,       // String: Modalidad de consulta ("Virtual" o "Presencial")
            costoMin,        // Number: Costo mínimo de consulta
            costoMax,        // Number: Costo máximo de consulta
            experienciaMin,  // Number: Años mínimos de experiencia
            activo = true    // Boolean: Solo doctores activos por defecto
        } = req.query;

        // 📊 REGISTRO DE FILTRADO PARA AUDITORÍA
        console.log(`🔍 Solicitud de filtrado de doctores recibida`);
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log(`🎯 Filtros aplicados:`, {
            especialidad: especialidad || 'No especificada',
            modalidad: modalidad || 'No especificada',
            costoMin: costoMin || 'No especificado',
            costoMax: costoMax || 'No especificado',
            experienciaMin: experienciaMin || 'No especificada',
            soloActivos: activo
        });

        // 🏗️ INICIALIZACIÓN DEL OBJETO DE FILTROS
        // filterOptions contendrá todas las condiciones WHERE de la consulta SQL
        const filterOptions = {};

        // 🩺 PROCESAMIENTO DEL FILTRO DE MODALIDAD
        if (modalidad) {
            // 🔄 NORMALIZACIÓN DE DIFERENTES FORMAS DE ESCRIBIR LAS MODALIDADES
            // Esto permite flexibilidad en cómo el frontend envía los datos
            const modalidadLower = modalidad.toLowerCase();
            
            // Normalizaciones para modalidad virtual
            if (modalidadLower === "online" || modalidadLower === "en línea" || modalidadLower === "virtual") {
                modalidad = "Virtual";
            }
            // Normalización para modalidad presencial
            else if (modalidadLower === "presencial" || modalidadLower === "en persona" || modalidadLower === "físico") {
                modalidad = "Presencial";
            }
            
            // 🔍 APLICACIÓN DEL FILTRO DE MODALIDAD
            // Op.like permite búsquedas flexibles usando LIKE en SQL
            // Equivale a: WHERE modalidad LIKE 'Virtual'
            filterOptions.modalidad = { [Op.like]: modalidad };
            console.log(`🏥 Filtro de modalidad aplicado: ${modalidad}`);
        }

        // 🩺 PROCESAMIENTO DEL FILTRO DE ESPECIALIDAD
        if (especialidad) {
            // 🔄 NORMALIZACIÓN DE ESPECIALIDADES
            // Convertimos a formato título (primera letra mayúscula)
            especialidad = especialidad.charAt(0).toUpperCase() + especialidad.slice(1).toLowerCase();
            
            // 🔍 APLICACIÓN DEL FILTRO DE ESPECIALIDAD
            // Usamos %especialidad% para búsqueda parcial (contiene la especialidad)
            // Esto permite encontrar "Cardiología Pediátrica" buscando "cardiología"
            filterOptions.especialidad = { [Op.like]: `%${especialidad}%` };
            console.log(`🩺 Filtro de especialidad aplicado: contiene "${especialidad}"`);
        }

        // 💰 PROCESAMIENTO DE FILTROS DE COSTO
        if (costoMin || costoMax) {
            const costoFilter = {};
            
            // Filtro de costo mínimo
            if (costoMin) {
                const costoMinNum = parseFloat(costoMin);
                if (isNaN(costoMinNum) || costoMinNum < 0) {
                    return res.status(400).json({
                        message: "El costo mínimo debe ser un número positivo",
                        valorRecibido: costoMin
                    });
                }
                costoFilter[Op.gte] = costoMinNum;  // Mayor o igual que (>=)
                console.log(`💰 Filtro costo mínimo: >= ${costoMinNum}`);
            }
            
            // Filtro de costo máximo
            if (costoMax) {
                const costoMaxNum = parseFloat(costoMax);
                if (isNaN(costoMaxNum) || costoMaxNum < 0) {
                    return res.status(400).json({
                        message: "El costo máximo debe ser un número positivo",
                        valorRecibido: costoMax
                    });
                }
                costoFilter[Op.lte] = costoMaxNum;  // Menor o igual que (<=)
                console.log(`💰 Filtro costo máximo: <= ${costoMaxNum}`);
            }
            
            // Validar que costo mínimo no sea mayor que el máximo
            if (costoMin && costoMax && parseFloat(costoMin) > parseFloat(costoMax)) {
                return res.status(400).json({
                    message: "El costo mínimo no puede ser mayor que el costo máximo",
                    costoMin: parseFloat(costoMin),
                    costoMax: parseFloat(costoMax)
                });
            }
            
            filterOptions.costo = costoFilter;
        }

        // 📚 PROCESAMIENTO DEL FILTRO DE EXPERIENCIA
        if (experienciaMin) {
            const experienciaMinNum = parseInt(experienciaMin, 10);
            if (isNaN(experienciaMinNum) || experienciaMinNum < 0) {
                return res.status(400).json({
                    message: "La experiencia mínima debe ser un número entero positivo",
                    valorRecibido: experienciaMin
                });
            }
            filterOptions.experiencia = { [Op.gte]: experienciaMinNum };
            console.log(`📚 Filtro experiencia mínima: >= ${experienciaMinNum} años`);
        }

        // ✅ FILTRO DE ESTADO ACTIVO
        if (activo !== undefined) {
            // Convertir string a boolean si es necesario
            const activoBool = activo === 'true' || activo === true;
            filterOptions.activo = activoBool;
            console.log(`✅ Filtro de estado activo: ${activoBool}`);
        }

        // ⚠️ VALIDACIÓN DE FILTROS MÍNIMOS
        // Verificamos que al menos haya un filtro aplicado
        const filtrosAplicados = Object.keys(filterOptions);
        if (filtrosAplicados.length === 0) {
            return res.status(400).json({ 
                message: "Debe proporcionar al menos un filtro para la búsqueda",
                filtrosDisponibles: [
                    "especialidad", "modalidad", "costoMin", "costoMax", 
                    "experienciaMin", "activo"
                ],
                ejemploURL: "/api/doctors/filter?especialidad=cardiologia&modalidad=Virtual"
            });
        }

        // 🏗️ CONFIGURACIÓN DE OPCIONES DE CONSULTA
        const queryOptions = {
            where: filterOptions,  // Aplicar todos los filtros construidos
            order: [
                ['nombre', 'ASC']  // Ordenar por nombre alfabéticamente
            ],
            attributes: [
                'id', 'nombre', 'especialidad', 'modalidad', 'telefono', 
                'email', 'horarios', 'experiencia', 'costo', 'imagen', 
                'activo', 'createdAt', 'updatedAt'
            ]
        };

        // 🔍 EJECUCIÓN DE LA CONSULTA CON FILTROS
        console.log(`📋 Ejecutando consulta filtrada con ${filtrosAplicados.length} filtros`);
        
        // 💾 CONSULTA A LA BASE DE DATOS
        // findAll() con where ejecuta: SELECT * FROM doctors WHERE [todas las condiciones]
        const doctors = await Doctor.findAll(queryOptions);

        // ❌ VALIDACIÓN DE RESULTADOS VACÍOS
        if (doctors.length === 0) {
            return res.status(404).json({ 
                message: "No se encontraron doctores con los filtros proporcionados",
                filtrosAplicados: filterOptions,
                sugerencias: [
                    "Intente con filtros menos restrictivos",
                    "Verifique la ortografía de la especialidad",
                    "Considere ampliar el rango de costos"
                ]
            });
        }

        // 📊 ANÁLISIS DE RESULTADOS FILTRADOS
        const totalEncontrados = doctors.length;
        const especialidadesEncontradas = [...new Set(doctors.map(d => d.especialidad))];
        const modalidadesEncontradas = [...new Set(doctors.map(d => d.modalidad))];
        const rangoPrecios = {
            minimo: Math.min(...doctors.filter(d => d.costo).map(d => parseFloat(d.costo))),
            maximo: Math.max(...doctors.filter(d => d.costo).map(d => parseFloat(d.costo))),
            promedio: (doctors.reduce((sum, d) => sum + (parseFloat(d.costo) || 0), 0) / doctors.length).toFixed(2)
        };

        // 📊 ESTADÍSTICAS DE LA BÚSQUEDA FILTRADA
        const estadisticasFiltrado = {
            totalEncontrados: totalEncontrados,
            filtrosAplicados: filtrosAplicados,
            especialidadesEnResultados: especialidadesEncontradas,
            modalidadesEnResultados: modalidadesEncontradas,
            rangoPrecios: rangoPrecios,
            promedioExperiencia: (doctors.reduce((sum, d) => sum + (d.experiencia || 0), 0) / doctors.length).toFixed(1),
            tiempoConsulta: new Date().toISOString()
        };

        // 🔒 REGISTRO DE AUDITORÍA DE RESULTADOS
        console.log(`✅ Consulta filtrada completada exitosamente:`);
        console.log(`   👨‍⚕️ Doctores encontrados: ${totalEncontrados}`);
        console.log(`   🩺 Especialidades: ${especialidadesEncontradas.join(', ')}`);
        console.log(`   🏥 Modalidades: ${modalidadesEncontradas.join(', ')}`);
        console.log(`   💰 Rango precios: $${rangoPrecios.minimo} - $${rangoPrecios.maximo}`);

        // ✅ RESPUESTA EXITOSA CON DOCTORES FILTRADOS
        res.json({
            message: `Se encontraron ${totalEncontrados} doctores que coinciden con los filtros`,
            // 👨‍⚕️ DATOS PRINCIPALES
            doctors: doctors,
            
            // 🔍 INFORMACIÓN DE FILTROS APLICADOS
            filtrosAplicados: {
                total: filtrosAplicados.length,
                detalle: filterOptions,
                parametrosOriginales: req.query
            },
            
            // 📊 ESTADÍSTICAS DE RESULTADOS
            estadisticas: estadisticasFiltrado,
            
            // 💡 INFORMACIÓN ÚTIL PARA EL FRONTEND
            resumenResultados: {
                totalDoctores: totalEncontrados,
                especialidadesDisponibles: especialidadesEncontradas,
                modalidadesDisponibles: modalidadesEncontradas,
                mejoresCostos: doctors
                    .filter(d => d.costo)
                    .sort((a, b) => parseFloat(a.costo) - parseFloat(b.costo))
                    .slice(0, 3)
                    .map(d => ({ nombre: d.nombre, costo: d.costo })),
                mayorExperiencia: doctors
                    .filter(d => d.experiencia)
                    .sort((a, b) => b.experiencia - a.experiencia)
                    .slice(0, 3)
                    .map(d => ({ nombre: d.nombre, experiencia: d.experiencia }))
            }
        });

    } catch (error) {
        // 🚨 MANEJO DETALLADO DE ERRORES
        const errorId = `FILTER_DOCTORS_${Date.now()}`;
        console.error(`❌ ${errorId} - Error al filtrar doctores:`, error);
        
        // Log detallado para debugging
        console.error(`📋 Detalles del error de filtrado:`, {
            parametrosFiltro: req.query,
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack?.split('\n')[0],
            timestamp: new Date().toISOString()
        });

        // Manejo específico de errores de Sequelize
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                message: "Error en la base de datos al filtrar doctores",
                sugerencia: "Verifique los parámetros de filtrado",
                errorId: errorId
            });
        }

        // Manejo de errores de validación
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: "Error de validación en los filtros aplicados",
                errores: error.errors?.map(e => ({
                    campo: e.path,
                    mensaje: e.message
                })),
                errorId: errorId
            });
        }

        // Error genérico del servidor
        res.status(500).json({ 
            message: "Error interno del servidor al filtrar doctores",
            filtrosAplicados: req.query,
            errorId: errorId,
            timestamp: new Date().toISOString()
        });
    }
};
