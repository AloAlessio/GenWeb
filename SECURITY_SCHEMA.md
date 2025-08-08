## 📊 Estructura de la Base de Datos

### Tabla `users`

#### Campos Principales
- `id` - ID único autoincremental
- `nombre` - Nombre completo del usuario
- `email` - Correo electrónico (único)
- `password` - Contraseña hasheada con bcrypt

#### Campos de Seguridad
- `failedLoginAttempts` - Contador de intentos fallidos de login
- `isLocked` - Indica si la cuenta está bloqueada
- `lockExpiry` - Fecha/hora de expiración del bloqueo
- `lastLogin` - Última fecha/hora de inicio de sesión exitoso
- `passwordResetToken` - Token para reseteo de contraseña
- `passwordResetExpiry` - Fecha/hora de expiración del token de reseteo

#### Campos de Auditoría
- `createdAt` - Fecha/hora de creación del registro
- `updatedAt` - Fecha/hora de última actualización
