# 📚 Manual del Sistema GenWeb

## 📑 Índice
1. [Estructura General del Proyecto](#estructura-general-del-proyecto)
2. [Backend](#backend)
3. [Frontend](#frontend)
4. [Configuración y Despliegue](#configuración-y-despliegue)

## 🏗️ Estructura General del Proyecto

El proyecto está dividido en dos partes principales:
- `backend/`: Servidor y lógica de negocio
- `frontend/`: Interfaz de usuario y experiencia del cliente

### 📁 Árbol de Directorios Principal
```
GenWeb/
├── backend/           # Servidor Node.js + Express
└── frontend/          # Archivos HTML, CSS y JavaScript
```

## 🖥️ Backend

### 1. Controladores (`backend/controllers/`)

#### 1.1 `authController.js`
- **Propósito**: Maneja la autenticación y autorización de usuarios
- **Funciones principales**:
  - `login`: Autenticación de usuarios
  - `register`: Registro de nuevos usuarios
  - `validateToken`: Verificación de tokens JWT
- **Seguridad implementada**:
  - Límite de intentos de login
  - Bloqueo temporal de cuentas
  - Registro de intentos fallidos

#### 1.2 `doctorController.js`
- **Propósito**: Gestión de doctores y sus servicios
- **Funciones principales**:
  - `getAllDoctors`: Lista completa de doctores con filtros
  - `filterDoctors`: Búsqueda avanzada por especialidad/modalidad
- **Características**:
  - Ordenamiento personalizable
  - Filtros múltiples
  - Estadísticas detalladas
  - Manejo de estados activo/inactivo

#### 1.3 `citaController.js`
- **Propósito**: Gestión de citas médicas
- **Funciones principales**:
  - `createCita`: Crear nueva cita
  - `updateCita`: Actualizar estado de cita
  - `getCitasByDoctor`: Filtrar por doctor
  - `getCitasByPaciente`: Filtrar por paciente
- **Estados de cita**:
  - Pendiente
  - Confirmada
  - Cancelada
  - Completada

#### 1.4 `recetaController.js`
- **Propósito**: Gestión de recetas médicas
- **Funciones principales**:
  - `createReceta`: Generar nueva receta
  - `getRecetasByCita`: Obtener recetas de una cita
  - `enviarRecetaPorEmail`: Envío automático por correo
- **Integraciones**:
  - Sistema de notificaciones por email
  - Generación de PDFs
  - Validaciones de seguridad

### 2. Modelos (`backend/models/`)

#### 2.1 `User.js`
- **Campos principales**:
  - `id`: Identificador único
  - `nombre`: Nombre completo
  - `email`: Correo electrónico
  - `password`: Contraseña (hasheada)
  - `role`: Rol del usuario (admin/doctor/paciente)
- **Validaciones**:
  - Email único
  - Contraseña segura
  - Campos requeridos

#### 2.2 `Doctor.js`
- **Campos principales**:
  - `especialidad`: Área de especialización
  - `modalidad`: Tipo de consulta
  - `horarios`: Disponibilidad
  - `costo`: Precio de consulta
  - `experiencia`: Años de práctica
- **Características**:
  - Integración con citas
  - Sistema de calificaciones
  - Control de disponibilidad

#### 2.3 `Cita.js`
- **Campos principales**:
  - `fecha`: Fecha de la cita
  - `hora`: Hora programada
  - `estado`: Estado actual
  - `doctorId`: Doctor asignado
  - `pacienteId`: Paciente agendado
- **Validaciones**:
  - No solapamiento de horarios
  - Verificación de disponibilidad
  - Estados válidos

#### 2.4 `Receta.js`
- **Campos principales**:
  - `citaId`: Cita relacionada
  - `medicamento`: Medicamento recetado
  - `dosis`: Dosificación
  - `duracion`: Duración del tratamiento
  - `indicaciones`: Instrucciones especiales
- **Características**:
  - Historial médico
  - Formato estandarizado
  - Envío por email

### 3. Rutas (`backend/routes/`)

#### 3.1 `authRoutes.js`
- Rutas de autenticación
- Middleware de validación
- Control de sesiones

#### 3.2 `doctorRoutes.js`
- Gestión de doctores
- Filtros y búsquedas
- Actualización de perfiles

#### 3.3 `citaRoutes.js`
- Gestión de citas
- Validaciones de horarios
- Estados y actualizaciones

#### 3.4 `recetaRoutes.js`
- Gestión de recetas
- Integración con emails
- Histórico médico

#### 3.5 `emailRoutes.js`
- Configuración de email
- Pruebas de envío
- Plantillas de correo

### 4. Servicios (`backend/services/`)

#### 4.1 `emailService.js`
- **Propósito**: Gestión de notificaciones por email
- **Características**:
  - Múltiples proveedores de email
  - Plantillas HTML responsivas
  - Sistema de reintentos
  - Logs de envío

## 🎨 Frontend

### 1. Páginas Principales

#### 1.1 `index.html`
- **Propósito**: Página principal del sistema
- **Características**:
  - Navegación principal
  - Resumen de servicios
  - Acceso a funciones principales

#### 1.2 `appointments.html`
- **Propósito**: Gestión de citas
- **Funcionalidades**:
  - Calendario interactivo
  - Formulario de citas
  - Vista de horarios
  - Estados y filtros

#### 1.3 `citas_forms.html`
- **Propósito**: Formularios de citas
- **Características**:
  - Validación en tiempo real
  - Selección de doctores
  - Confirmación por email

### 2. JavaScript Principal

#### 2.1 `appointments.js`
- Lógica de citas
- Interacción con calendario
- Validaciones de formularios

#### 2.2 `calendar.js`
- Calendario interactivo
- Gestión de eventos
- Vista de disponibilidad

#### 2.3 `script.js`
- Funciones globales
- Utilidades comunes
- Gestión de estado

### 3. Estilos

#### 3.1 `styles.css`
- **Características**:
  - Diseño responsivo
  - Tema consistente
  - Variables CSS
- **Componentes**:
  - Botones y formularios
  - Tarjetas y layouts
  - Estados y animaciones

#### 3.2 `mobile.css`
- Adaptaciones móviles
- Media queries
- Optimizaciones táctiles

### 4. Módulo de Email

#### 4.1 `test_email_notifications.html`
- **Propósito**: Pruebas de email
- **Funcionalidades**:
  - Verificación de configuración
  - Pruebas de envío
  - Visualización de resultados

#### 4.2 `email_config.html`
- **Propósito**: Configuración de email
- **Características**:
  - Configuración de credenciales
  - Selección de proveedor
  - Pruebas de conexión

## ⚙️ Configuración y Despliegue

### 1. Variables de Entorno
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=****
DB_NAME=genweb

# Email
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_SERVICE=gmail

# Security
JWT_SECRET=tu-secret-key
SESSION_SECRET=tu-session-secret
```

### 2. Comandos Principales
```bash
# Instalación
npm install

# Migraciones
node migrate.js
node addSecurityFields.js

# Iniciar servidor
npm start
```

### 3. Requerimientos
- Node.js v14+
- MySQL 5.7+
- npm/yarn

## 🔒 Seguridad

### 1. Características Implementadas
- Protección contra SQL Injection
- Límite de intentos de login
- Validación de datos
- Sanitización de inputs
- JWT para autenticación
- CORS configurado
- Variables de entorno

### 2. Mejores Prácticas
- Validación en frontend y backend
- Logs detallados
- Manejo de errores
- Backups automáticos
- Monitoreo de actividad

## 📱 Responsive Design

### 1. Breakpoints
- Desktop: 1200px+
- Tablet: 768px-1199px
- Mobile: 320px-767px

### 2. Características
- Diseño mobile-first
- Interfaces adaptativas
- Optimización de imágenes
- Touch-friendly
- Textos legibles

## 📧 Sistema de Notificaciones

### 1. Tipos de Emails
- Confirmación de citas
- Recordatorios
- Recetas médicas
- Cambios de estado
- Recuperación de contraseña

### 2. Características
- Templates HTML responsivos
- Personalización por tipo
- Sistema de cola
- Reintentos automáticos
- Logs de envío

## 🔄 Flujos de Trabajo

### 1. Proceso de Cita
1. Paciente agenda cita
2. Sistema verifica disponibilidad
3. Envío de confirmación
4. Recordatorio automático
5. Generación de receta
6. Envío por email

### 2. Proceso de Receta
1. Doctor genera receta
2. Sistema valida datos
3. Generación de PDF
4. Envío automático
5. Registro en historial
6. Confirmación al paciente

## 📊 Reportes y Estadísticas

### 1. Métricas Disponibles
- Citas por doctor
- Pacientes atendidos
- Recetas generadas
- Emails enviados
- Tiempos de respuesta

### 2. Visualizaciones
- Gráficos de actividad
- Calendarios de citas
- Estados y progreso
- Históricos mensuales
