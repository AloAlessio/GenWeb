# 📧 Sistema de Notificaciones por Email - GenWeb

## 🎯 Descripción

El sistema GenWeb ahora incluye notificaciones automáticas por email cuando se generan recetas médicas. Cada vez que un doctor genera una receta para un paciente, se envía automáticamente una copia profesional de la receta al correo electrónico del paciente.

## ✨ Características

- ✅ **Envío automático**: Las recetas se envían automáticamente al email del paciente
- ✅ **Diseño profesional**: Emails con diseño HTML profesional y responsive
- ✅ **Información completa**: Incluye todos los detalles de la prescripción
- ✅ **Respaldo en texto plano**: Compatible con clientes de email básicos
- ✅ **Tolerante a fallos**: El sistema continúa funcionando aunque el email falle

## 🏥 Flujo de Trabajo

1. **Paciente agenda cita** → Se registra su email en el sistema
2. **Doctor confirma cita** → Cita queda lista para generar receta
3. **Doctor genera receta** → Sistema crea la receta en la base de datos
4. **Email automático** → Se envía copia de la receta al paciente
5. **Confirmación** → Doctor ve confirmación del envío

## ⚙️ Configuración Inicial

### 1. Variables de Entorno

En el archivo `backend/.env`, agrega:

```env
# Configuración de email para notificaciones
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
```

### 2. Configuración para Gmail

1. **Habilitar verificación en 2 pasos**:
   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos
   - Actívala si no está activada

2. **Generar contraseña de aplicación**:
   - En Seguridad → Contraseñas de aplicaciones
   - Selecciona "Correo" y "Computadora Windows"
   - Copia la contraseña generada
   - Úsala en `EMAIL_PASSWORD`

### 3. Configuración para Otros Proveedores

**Para Outlook/Hotmail:**
```env
EMAIL_USER=tu-email@outlook.com
EMAIL_PASSWORD=tu-password
```

**Para Yahoo:**
```env
EMAIL_USER=tu-email@yahoo.com
EMAIL_PASSWORD=tu-password
```

**Para proveedores SMTP personalizados:**
```env
EMAIL_HOST=smtp.tu-proveedor.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@tu-dominio.com
EMAIL_PASSWORD=tu-password
```

### 4. Reiniciar el Servidor

Después de configurar, reinicia el servidor:

```bash
cd backend
npm start
```

## 🧪 Pruebas del Sistema

### Verificación Rápida

1. Abre `http://localhost:5000/email_config.html`
2. Haz clic en "Verificar Configuración"
3. Prueba enviando un email de prueba

### Prueba Completa

1. Abre `http://localhost:5000/test_email_notifications.html`
2. Sigue los pasos para crear una cita de prueba
3. Genera una receta y verifica que el email se envíe

## 📋 Uso del Sistema

### Para Doctores

1. **Acceder al sistema de citas**:
   - Ve a `appointments.html`
   - Busca citas confirmadas

2. **Generar receta**:
   - Haz clic en "Recetar" en una cita
   - Completa los datos de la receta
   - Haz clic en "Generar Receta"

3. **Confirmación**:
   - El sistema mostrará confirmación
   - Indicará si el email fue enviado
   - La receta queda guardada en el sistema

### Para Pacientes

1. **Agendar cita**:
   - Usar el formulario en `citas_forms.html`
   - **Importante**: Proporcionar email válido

2. **Recibir notificación**:
   - Email automático cuando se genera receta
   - Incluye todos los detalles de la prescripción
   - Formato profesional y fácil de leer

## 📧 Formato del Email

Los emails incluyen:

- **Header profesional** con logo de GenWeb
- **Información del paciente** (nombre, médico, fecha)
- **Detalles de la prescripción**:
  - Medicamento destacado
  - Dosis exacta
  - Frecuencia de administración
  - Duración del tratamiento
  - Indicaciones especiales
- **Instrucciones importantes** para el paciente
- **Footer** con información de contacto

## 🔧 Solución de Problemas

### Email no se envía

1. **Verificar configuración**:
   ```bash
   # Verificar variables de entorno
   echo $EMAIL_USER
   echo $EMAIL_PASSWORD
   ```

2. **Verificar conectividad**:
   - Usar la página de configuración
   - Probar con email de prueba

3. **Errores comunes**:
   - Contraseña incorrecta → Regenerar contraseña de aplicación
   - 2FA no habilitado → Habilitar verificación en 2 pasos
   - Proveedor bloqueado → Verificar configuración SMTP

### Logs del Sistema

Los logs aparecen en la consola del servidor:

```bash
# Éxito
✅ Email de receta enviado exitosamente: <message-id>

# Error
❌ Error al enviar email de receta: <error-message>
```

## 🛡️ Seguridad

- Las contraseñas están en variables de entorno
- No se almacenan emails en logs públicos
- Solo emails del sistema (no emails de pacientes)
- Autenticación segura con proveedores

## 📈 Monitoreo

### Métricas Disponibles

- Recetas generadas vs emails enviados
- Tasa de éxito de envío de emails
- Errores de configuración

### Dashboard

Usa `email_config.html` para:
- Verificar estado del sistema
- Probar envío de emails
- Ver configuración actual

## 🔄 Mantenimiento

### Tareas Regulares

1. **Verificar configuración** semanalmente
2. **Probar envío** después de cambios
3. **Revisar logs** para detectar errores
4. **Actualizar credenciales** según políticas de seguridad

### Actualizaciones

- El sistema es compatible con futuras versiones
- Las configuraciones se mantienen en `.env`
- Backups automáticos de recetas en base de datos

## 📞 Soporte

Si necesitas ayuda:

1. Revisa los logs del servidor
2. Usa las páginas de diagnóstico
3. Verifica la configuración del proveedor de email
4. Consulta la documentación del proveedor de email

---

## 🎉 ¡Sistema Listo!

El sistema de notificaciones por email está completamente implementado y listo para usar. Los pacientes ahora recibirán automáticamente copias profesionales de sus recetas médicas por correo electrónico.

**Próximos pasos:**
1. Configurar las credenciales de email
2. Probar el sistema con emails reales
3. Entrenar al personal médico en el nuevo flujo
4. ¡Disfrutar del sistema automatizado!
