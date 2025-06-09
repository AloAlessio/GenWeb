# 🏥 GenWeb - Sistema de Gestión Médica

Sistema integral de gestión médica con funcionalidades avanzadas para hospitales y clínicas.

## ✨ Características Principales

### 🩺 Gestión de Citas
- **Agendamiento en línea** de citas médicas
- **Calendario interactivo** para visualización
- **Estados de cita**: Pendiente, Confirmada, Cancelada
- **Gestión de especialidades** y modalidades
- **Filtros avanzados** por fecha, tipo y estado

### 👨‍⚕️ Gestión de Doctores
- **Base de datos completa** de especialistas
- **Información detallada** por especialidad
- **Modalidades**: Presencial, Virtual, Domicilio
- **Integración con sistema de citas**

### 💊 Sistema de Recetas Médicas
- **Generación digital** de recetas
- **Historial completo** por paciente y doctor
- **Validación automática** de duplicados
- **Impresión en PDF** de recetas

### 📧 **NUEVO: Notificaciones por Email**
- **Envío automático** de recetas por correo
- **Diseño profesional** HTML responsive  
- **Configuración flexible** de proveedores
- **Tolerante a fallos** - sistema continúa funcionando

### 🛡️ Seguridad y Autenticación
- **Sistema de usuarios** con autenticación
- **Roles diferenciados** (Admin, Doctor, Paciente)
- **Sesiones seguras** con JWT
- **Validación de datos** en frontend y backend

## 🚀 Tecnologías Utilizadas

### Frontend
- **HTML5** + **CSS3** + **JavaScript ES6**
- **SweetAlert2** para alertas profesionales
- **FontAwesome** para iconografía
- **FullCalendar** para gestión de calendario
- **Diseño responsivo** para móviles y desktop

### Backend
- **Node.js** + **Express.js**
- **Sequelize ORM** para base de datos
- **MySQL** como base de datos principal
- **Nodemailer** para envío de emails
- **dotenv** para configuración de entorno
- **CORS** habilitado para integración frontend

### Nuevas Funcionalidades de Email
- **Nodemailer** con soporte multi-proveedor
- **Plantillas HTML** profesionales
- **Variables de entorno** para configuración segura
- **Sistema de logs** para monitoreo

## 📁 Estructura del Proyecto

```
GenWeb/
├── backend/
│   ├── controllers/         # Lógica de negocio
│   │   ├── authController.js
│   │   ├── citaController.js
│   │   ├── doctorController.js
│   │   └── recetaController.js
│   ├── models/             # Modelos de base de datos
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Cita.js
│   │   └── Receta.js
│   ├── routes/             # Definición de rutas API
│   │   ├── authRoutes.js
│   │   ├── citaRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── recetaRoutes.js
│   │   └── emailRoutes.js  # ✨ NUEVO
│   ├── services/           # Servicios externos
│   │   └── emailService.js # ✨ NUEVO
│   ├── migrations/         # Migraciones de BD
│   ├── .env                # Variables de entorno
│   ├── .env.example        # Ejemplo de configuración
│   ├── server.js           # Servidor principal
│   └── package.json
├── frontend/
│   ├── index.html          # Página principal
│   ├── appointments.html   # Gestión de citas
│   ├── appointments.js     # Lógica de citas
│   ├── calendar.js         # Calendario interactivo
│   ├── citas_forms.html    # Formulario de citas
│   ├── email_config.html   # ✨ NUEVO: Config email
│   ├── test_email_notifications.html # ✨ NUEVO: Pruebas
│   ├── styles.css          # Estilos globales
│   └── appointments.css    # Estilos específicos
├── EMAIL_NOTIFICATIONS.md  # ✨ NUEVO: Documentación email
└── README.md
```

## 🛠️ Instalación y Configuración

### 1. Prerrequisitos
- **Node.js** v14 o superior
- **MySQL** 5.7 o superior
- **npm** o **yarn**

### 2. Configuración del Backend

```bash
cd backend
npm install
```

### 3. Configuración de Base de Datos

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE genweb;
EXIT;

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### 4. **NUEVO: Configuración de Email**

En el archivo `.env`:

```env
# Configuración de email (NUEVO)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
```

**Para Gmail:**
1. Habilita verificación en 2 pasos
2. Genera contraseña de aplicación
3. Usa esa contraseña en EMAIL_PASSWORD

### 5. Inicializar Sistema

```bash
# Migrar base de datos
node migrate.js

# Insertar datos iniciales
node insertDoctors.js

# Iniciar servidor
npm start
```

### 6. Acceder al Sistema

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Config Email**: http://localhost:5000/email_config.html
- **Pruebas Email**: http://localhost:5000/test_email_notifications.html

## 📧 Sistema de Notificaciones por Email

### Características
- ✅ **Envío automático** al generar recetas
- ✅ **Diseño HTML profesional**
- ✅ **Soporte multi-proveedor** (Gmail, Outlook, Yahoo, SMTP)
- ✅ **Tolerante a fallos** 
- ✅ **Panel de configuración** web
- ✅ **Sistema de pruebas** integrado

### Flujo de Trabajo
1. Paciente agenda cita con email
2. Doctor genera receta médica
3. **Sistema envía automáticamente email al paciente**
4. Paciente recibe receta profesional por correo

### Configuración Rápida
1. Configurar `EMAIL_USER` y `EMAIL_PASSWORD` en `.env`
2. Reiniciar servidor
3. Probar en `http://localhost:5000/email_config.html`

**Ver documentación completa**: [EMAIL_NOTIFICATIONS.md](EMAIL_NOTIFICATIONS.md)

## 🔧 API Endpoints

### Citas
- `GET /api/citas` - Listar citas
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id` - Actualizar cita
- `DELETE /api/citas/:id` - Eliminar cita

### Recetas
- `GET /api/recetas/cita/:citaId` - Obtener receta por cita
- `POST /api/recetas` - **Crear receta (envía email automático)**
- `GET /api/recetas/doctor/:doctorId` - Recetas por doctor

### **NUEVO: Email**
- `GET /api/email/verificar` - Verificar configuración
- `POST /api/email/prueba` - Enviar email de prueba

### Doctores
- `GET /api/doctors` - Listar doctores
- `GET /api/doctors/:id` - Obtener doctor específico

## 👥 Usuarios del Sistema

### Pacientes
- Agendar citas en línea
- **Recibir recetas por email automáticamente**
- Ver estado de citas
- Formularios intuitivos

### Doctores
- Gestionar calendario de citas
- Generar recetas digitales
- **Envío automático de recetas a pacientes**
- Ver historial de pacientes

### Administradores
- Gestión completa del sistema
- **Configuración de notificaciones email**
- Reportes y estadísticas
- Configuración de usuarios

## 🆕 Últimas Actualizaciones

### v2.1.0 - Sistema de Notificaciones por Email
- ✨ **Envío automático de recetas por email**
- 🎨 **Plantillas HTML profesionales**
- ⚙️ **Panel de configuración web**
- 🧪 **Sistema de pruebas integrado**
- 📧 **Soporte multi-proveedor de email**
- 🛡️ **Configuración segura con variables de entorno**
- 📝 **Documentación completa**

### Funcionalidades Previas
- ✅ Modal de citas funcional y responsive
- ✅ Calendario interactivo solo lectura
- ✅ Sistema de recetas médicas
- ✅ Mapeo correcto de nombres de doctores
- ✅ Estados de cita (pendiente/confirmada/cancelada)

## 🧪 Pruebas y Desarrollo

### Prueba del Sistema Completo
```bash
# Abrir página de pruebas
http://localhost:5000/test_email_notifications.html
```

### Prueba Solo Email
```bash
# Abrir configuración de email
http://localhost:5000/email_config.html
```

### Logs del Sistema
```bash
# Ver logs en la consola del servidor
npm start
# Los logs de email aparecen en tiempo real
```

## 📱 Responsive Design

- ✅ **Desktop** (1200px+): Interfaz completa
- ✅ **Tablet** (768px-1199px): Interfaz adaptada
- ✅ **Mobile** (320px-767px): Interfaz optimizada
- ✅ **Emails responsive** para todos los dispositivos

## 🔒 Seguridad Implementada

### Frontend
- Validación de formularios
- Sanitización de entradas
- Manejo seguro de tokens

### Backend
- Autenticación JWT
- Validación de datos en servidor
- **Variables de entorno para credenciales de email**
- CORS configurado correctamente

### Email
- **Credenciales en variables de entorno**
- **Contraseñas de aplicación** (no contraseñas reales)
- **Logs sin información sensible**

## 🚀 Próximas Funcionalidades

- [ ] **SMS notifications** para citas
- [ ] **Dashboard de métricas** de email
- [ ] **Recordatorios automáticos** de citas
- [ ] **Integración con calendario externo**
- [ ] **API REST completa** documentada
- [ ] **Panel de administración** avanzado

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: soporte@genweb.com
- **Documentación**: [EMAIL_NOTIFICATIONS.md](EMAIL_NOTIFICATIONS.md)
- **Issues**: GitHub Issues
- **Wiki**: Documentación técnica en wiki

---

## ⭐ Características Destacadas

🎯 **Sistema Integral**: Gestión completa de citas médicas
📧 **Notificaciones Automáticas**: Emails profesionales para pacientes  
🎨 **Interfaz Moderna**: Diseño responsive y profesional
🛡️ **Seguro y Confiable**: Autenticación robusta y datos protegidos
🔧 **Fácil Configuración**: Setup rápido con documentación completa

**¡GenWeb - Transformando la gestión médica digital!** 🏥✨
