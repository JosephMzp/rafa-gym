# Documento de Especificación de Requerimientos de Software (SRS)

## Sistema de Gestión y Control de Asistencias - RafaGym

**Versión:** 1.0  
**Fecha:** 25 de enero de 2026  
**Preparado para:** RafaGym  

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
Este documento describe los requerimientos funcionales y no funcionales para el desarrollo de una aplicación web de control y gestión de clientes para RafaGym, un gimnasio con tres sedes que requiere automatizar el registro de clientes, control de asistencias, gestión de membresías y administración de pagos.

### 1.2 Alcance
El sistema "RafaGym Management System" permitirá:
- Gestionar clientes y sus membresías
- Controlar asistencias diarias
- Administrar pagos y generar alertas de vencimiento
- Gestionar las tres sedes del gimnasio
- Administrar rutinas de entrenamiento personalizadas
- Gestionar invitados y clases grupales
- Generar reportes administrativos
- Proporcionar portal de clientes con información personalizada

### 1.3 Definiciones, Acrónimos y Abreviaciones
- **SRS:** Software Requirements Specification
- **API:** Application Programming Interface
- **UI/UX:** User Interface/User Experience
- **CRUD:** Create, Read, Update, Delete
- **Membresía Estándar:** Acceso a una sede, 1 vez al día, sin asesoramiento
- **Membresía Fit:** Acceso a todas las sedes, 1 vez al día, con asesoramiento
- **Membresía Gold:** Acceso ilimitado a todas las sedes, 5 invitados/mes, con asesoramiento

### 1.4 Referencias
- Documentación de React: https://react.dev
- Documentación de Node.js: https://nodejs.org
- Documentación de Supabase: https://supabase.com/docs

---

## 2. DESCRIPCIÓN GENERAL

### 2.1 Perspectiva del Producto
Sistema web independiente con arquitectura cliente-servidor que integra:
- Frontend: React para interfaz de usuario
- Backend: Node.js para lógica de negocio
- Base de datos: Supabase (PostgreSQL)
- Autenticación: Supabase Auth
- Notificaciones: Email y WhatsApp

### 2.2 Funciones del Producto
- Registro y gestión de clientes
- Control de asistencias
- Administración de membresías y pagos
- Gestión de sedes
- Administración de rutinas personalizadas
- Portal público informativo
- Panel administrativo con control de roles
- Sistema de notificaciones automáticas
- Generación de reportes

### 2.3 Características de Usuarios

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Administrador** | Personal de gestión completa | Acceso total al sistema |
| **Recepcionista** | Personal de atención al cliente | Registro de clientes, asistencias, pagos |
| **Entrenador** | Personal técnico | Gestión de rutinas, seguimiento de clientes |
| **Cliente** | Usuario final del gimnasio | Portal personal, visualización de datos |

### 2.4 Restricciones
- Debe funcionar en navegadores web modernos (Chrome, Firefox, Safari, Edge)
- Requiere conexión a internet
- Cumplir con normativas de protección de datos personales
- Interfaz en español

### 2.5 Suposiciones y Dependencias
- Disponibilidad continua de servicios de Supabase
- Acceso a servicios de email y WhatsApp API
- Dispositivos con navegadores actualizados

---

## 3. REQUERIMIENTOS FUNCIONALES

### 3.1 Gestión de Clientes

#### RF-01: Registro de Clientes
**Prioridad:** Alta  
**Descripción:** El sistema debe permitir crear nuevos registros de clientes.

**Criterios de aceptación:**
- Formulario digital con campos obligatorios:
  - Nombre completo
  - Documento de identidad
  - Fecha de nacimiento
  - Teléfono
  - Email
  - Dirección
  - Contacto de emergencia
  - Tipo de membresía
  - Sede de matrícula
  - Fecha de inicio
  - Fecha de vencimiento
  - Fotografía (opcional)
- Validación de datos en tiempo real
- Verificación de duplicados por documento de identidad
- Asignación automática de número de cliente

#### RF-02: Actualización de Clientes
**Prioridad:** Alta  
**Descripción:** El sistema debe permitir modificar información de clientes existentes.

**Criterios de aceptación:**
- Búsqueda de cliente por nombre, documento o número
- Edición de todos los campos excepto número de cliente
- Registro de historial de cambios
- Validación de permisos según rol

#### RF-03: Desactivación de Clientes
**Prioridad:** Media  
**Descripción:** El sistema debe permitir desactivar clientes sin eliminar su información.

**Criterios de aceptación:**
- Marcado de estado "inactivo"
- Mantenimiento de historial completo
- Opción de reactivación
- Restricción de acceso para clientes inactivos

### 3.2 Gestión de Membresías

#### RF-04: Tipos de Membresía
**Prioridad:** Alta  
**Descripción:** El sistema debe gestionar tres tipos de membresías con reglas específicas.

**Criterios de aceptación:**
- **Membresía Estándar:**
  - Acceso a sede de matrícula únicamente
  - Máximo 1 ingreso por día
  - Sin asesoramiento
  - Pago por clases grupales
- **Membresía Fit:**
  - Acceso a todas las sedes
  - Máximo 1 ingreso por día
  - Incluye asesoramiento
  - Clases grupales gratis (pilates, danza, aeróbicos)
- **Membresía Gold:**
  - Acceso ilimitado a todas las sedes
  - Ingresos ilimitados por día
  - Incluye asesoramiento
  - 5 invitados por mes
  - Clases grupales gratis

#### RF-05: Creación y Edición de Membresías
**Prioridad:** Alta  
**Descripción:** El sistema debe permitir crear y modificar planes de membresía.

**Criterios de aceptación:**
- Definición de nombre, precio y duración
- Configuración de beneficios
- Activación/desactivación de membresías
- Historial de cambios de precios

### 3.3 Control de Asistencias

#### RF-06: Registro Manual de Asistencias
**Prioridad:** Alta  
**Descripción:** El sistema debe permitir registrar la entrada de clientes al gimnasio.

**Criterios de aceptación:**
- Búsqueda rápida de cliente
- Validación de membresía activa
- Validación de reglas según tipo de membresía:
  - Estándar: verificar sede correcta y límite diario
  - Fit: verificar límite diario
  - Gold: permitir acceso sin restricciones
- Registro de fecha, hora y sede de ingreso
- Alerta visual de restricciones

#### RF-07: Consulta de Historial de Asistencias
**Prioridad:** Media  
**Descripción:** El sistema debe permitir consultar el historial de asistencias.

**Criterios de aceptación:**
- Filtros por cliente, fecha y sede
- Visualización de frecuencia de uso
- Exportación de datos
- Gráficos estadísticos

### 3.4 Gestión de Pagos

#### RF-08: Registro de Pagos
**Prioridad:** Alta  
**Descripción:** El sistema debe permitir registrar pagos de membresías.

**Criterios de aceptación:**
- Formulario con campos:
  - Cliente
  - Concepto (mensualidad, renovación, clases)
  - Monto
  - Método de pago
  - Fecha de pago
  - Próximo vencimiento
- Generación de comprobante
- Actualización automática de fecha de vencimiento

#### RF-09: Alertas de Vencimiento
**Prioridad:** Alta  
**Descripción:** El sistema debe generar alertas de vencimiento de membresías.

**Criterios de aceptación:**
- Alerta 7 días antes del vencimiento
- Alerta el día del vencimiento
- Alerta 3 días después del vencimiento
- Envío por email y WhatsApp

#### RF-10: Reportes de Pagos
**Prioridad:** Media  
**Descripción:** El sistema debe generar reportes mensuales de pagos.

**Criterios de aceptación:**
- Reporte de ingresos por mes
- Reporte de ingresos por sede
- Reporte de ingresos por tipo de membresía
- Reporte de pagos pendientes
- Exportación a PDF y Excel

### 3.5 Gestión de Sedes

#### RF-11: Administración de Sedes
**Prioridad:** Alta  
**Descripción:** El sistema debe permitir gestionar las tres sedes del gimnasio.

**Criterios de aceptación:**
- Registro de información de sede:
  - Nombre
  - Dirección
  - Teléfono
  - Horarios de atención
  - Capacidad
  - Servicios disponibles
- Edición de información
- Visualización de clientes por sede
- Estadísticas de asistencia por sede

### 3.6 Gestión de Invitados

#### RF-12: Registro de Invitados
**Prioridad:** Media  
**Descripción:** El sistema debe permitir registrar invitados de clientes Gold.

**Criterios de aceptación:**
- Verificación de membresía Gold
- Control de límite de 5 invitados por mes
- Registro de datos básicos del invitado:
  - Nombre completo
  - Documento de identidad
  - Cliente anfitrión
  - Fecha de visita
  - Sede
- Contador de invitados utilizados
- Reset mensual automático

### 3.7 Gestión de Clases Grupales

#### RF-13: Inscripción a Clases
**Prioridad:** Media  
**Descripción:** El sistema debe permitir inscribir clientes a clases grupales.

**Criterios de aceptación:**
- Catálogo de clases: pilates, danza, aeróbicos
- Programación de horarios y cupos
- Inscripción con validación:
  - Fit y Gold: gratis
  - Estándar: registro de pago
- Lista de asistencia
- Cancelación de inscripciones

### 3.8 Gestión de Rutinas

#### RF-14: Creación de Rutinas Personalizadas
**Prioridad:** Media  
**Descripción:** El sistema debe permitir a entrenadores crear rutinas personalizadas.

**Criterios de aceptación:**
- Formulario de rutina:
  - Cliente asignado
  - Objetivo (pérdida de peso, ganancia muscular, resistencia, etc.)
  - Nivel (principiante, intermedio, avanzado)
  - Duración del plan
  - Días de entrenamiento
- Biblioteca de ejercicios con:
  - Nombre
  - Descripción
  - Grupo muscular
  - Equipo necesario
  - Video/imagen demostrativa
  - Series y repeticiones recomendadas
- Asignación de ejercicios por día
- Notas del entrenador

#### RF-15: Seguimiento de Rutinas
**Prioridad:** Baja  
**Descripción:** El sistema debe permitir dar seguimiento al progreso de rutinas.

**Criterios de aceptación:**
- Registro de cumplimiento
- Actualización de rutinas
- Historial de rutinas anteriores

### 3.9 Portal de Clientes

#### RF-16: Inicio de Sesión de Clientes
**Prioridad:** Media  
**Descripción:** Los clientes deben poder iniciar sesión en su portal personal.

**Criterios de aceptación:**
- Autenticación con email y contraseña
- Recuperación de contraseña
- Sesión segura

#### RF-17: Visualización de Datos Personales
**Prioridad:** Media  
**Descripción:** Los clientes deben ver su información en el portal.

**Criterios de aceptación:**
- Datos personales
- Tipo de membresía y vigencia
- Historial de asistencias
- Estado de pagos
- Rutina actual
- Clases inscritas
- Invitados disponibles (Gold)

#### RF-18: Biblioteca de Ejercicios
**Prioridad:** Baja  
**Descripción:** Los clientes deben acceder a ejemplos de ejercicios.

**Criterios de aceptación:**
- Catálogo de ejercicios con videos/imágenes
- Búsqueda por grupo muscular
- Descripción de técnica correcta

### 3.10 Portal Público

#### RF-19: Página Principal Informativa
**Prioridad:** Media  
**Descripción:** Debe existir una página pública con información del gimnasio.

**Criterios de aceptación:**
- Diseño moderno y responsive
- Secciones:
  - Información del gimnasio
  - Servicios ofrecidos
  - Tipos de membresías y precios
  - Ubicación de sedes
  - Galería de fotos
  - Productos (suplementos, accesorios)
  - Contacto
- Optimización para móviles y tablets

### 3.11 Panel Administrativo

#### RF-20: Control de Acceso por Roles
**Prioridad:** Alta  
**Descripción:** El sistema debe restringir funciones según el rol del usuario.

**Criterios de aceptación:**
- **Administrador:** acceso completo
- **Recepcionista:** 
  - Registro y actualización de clientes
  - Registro de asistencias
  - Registro de pagos
  - Consulta de reportes básicos
- **Entrenador:**
  - Consulta de clientes
  - Gestión de rutinas
  - Seguimiento de clientes asignados

#### RF-21: Dashboard Administrativo
**Prioridad:** Media  
**Descripción:** Panel con métricas y accesos rápidos.

**Criterios de aceptación:**
- Resumen de clientes activos/inactivos
- Ingresos del mes
- Asistencias del día
- Membresías por vencer
- Gráficos estadísticos
- Accesos rápidos a funciones principales

### 3.12 Reportes Administrativos

#### RF-22: Generación de Reportes
**Prioridad:** Media  
**Descripción:** El sistema debe generar reportes administrativos.

**Criterios de aceptación:**
- Reporte de ingresos mensuales
- Reporte de asistencia por cliente
- Reporte de clientes activos/inactivos
- Reporte de membresías por tipo
- Reporte de pagos pendientes
- Reporte de clases grupales
- Filtros por fecha, sede, membresía
- Exportación a PDF y Excel

### 3.13 Notificaciones

#### RF-23: Sistema de Notificaciones
**Prioridad:** Alta  
**Descripción:** El sistema debe enviar notificaciones automáticas.

**Criterios de aceptación:**
- Recordatorio de pago (7 días antes)
- Alerta de vencimiento (día del vencimiento)
- Notificación de pago recibido
- Recordatorio de clases inscritas (1 día antes)
- Canales: email y WhatsApp
- Configuración de preferencias por cliente

---

## 4. REQUERIMIENTOS NO FUNCIONALES

### 4.1 Requerimientos de Rendimiento

#### RNF-01: Tiempo de Respuesta
- Las páginas deben cargar en menos de 3 segundos
- Las consultas a base de datos deben responder en menos de 2 segundos
- El registro de asistencia debe completarse en menos de 5 segundos

#### RNF-02: Capacidad
- Soporte para al menos 1,000 clientes activos
- Soporte para 500 registros de asistencia diarios
- Almacenamiento de historial de al menos 5 años

### 4.2 Requerimientos de Seguridad

#### RNF-03: Autenticación y Autorización
- Autenticación mediante Supabase Auth
- Contraseñas encriptadas
- Sesiones con timeout de 30 minutos de inactividad
- Control de acceso basado en roles

#### RNF-04: Protección de Datos
- Encriptación de datos sensibles
- Backup diario automático
- Cumplimiento de normativas de protección de datos
- Registro de auditoría de cambios críticos

### 4.3 Requerimientos de Usabilidad

#### RNF-05: Interfaz de Usuario
- Diseño intuitivo y fácil de usar
- Navegación clara y consistente
- Mensajes de error descriptivos
- Ayuda contextual disponible

#### RNF-06: Responsive Design
- Adaptación a resoluciones desde 320px hasta 1920px
- Funcionamiento óptimo en dispositivos móviles, tablets y desktop
- Soporte para orientación vertical y horizontal

#### RNF-07: Accesibilidad
- Contraste adecuado de colores (WCAG 2.1 AA)
- Textos legibles (tamaño mínimo 14px)
- Navegación por teclado
- Etiquetas descriptivas en formularios

### 4.4 Requerimientos de Compatibilidad

#### RNF-08: Navegadores
- Google Chrome (últimas 2 versiones)
- Mozilla Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Microsoft Edge (últimas 2 versiones)

#### RNF-09: Dispositivos
- Computadoras de escritorio
- Laptops
- Tablets (iOS y Android)
- Smartphones (iOS y Android)

### 4.5 Requerimientos de Mantenibilidad

#### RNF-10: Código
- Código limpio y documentado
- Arquitectura modular
- Uso de componentes reutilizables
- Versionamiento con Git

#### RNF-11: Documentación
- Documentación técnica del código
- Manual de usuario
- Manual de administrador
- Guía de instalación y despliegue

### 4.6 Requerimientos de Disponibilidad

#### RNF-12: Uptime
- Disponibilidad del 99% mensual
- Mantenimientos programados fuera de horario laboral
- Sistema de monitoreo de disponibilidad

---

## 5. ARQUITECTURA DEL SISTEMA

### 5.1 Stack Tecnológico

#### Frontend
- **Framework:** React 18+
- **Routing:** React Router
- **Estado:** React Context API
- **Estilos:** Tailwind CSS
- **Formularios:** React Hook Form
- **Validación:** Zod
- **Peticiones HTTP:** Axios
- **Gráficos:** Recharts

#### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Lenguaje:** JavaScript (ES6+)
- **Autenticación:** Supabase Auth
- **Validación:** Joi o Express-validator

#### Base de Datos
- **Sistema:** Supabase (PostgreSQL)
- **ORM:** Prisma o consultas nativas de Supabase
- **Migraciones:** Supabase CLI

#### Servicios Adicionales
- **Email:** SendGrid, Mailgun o Resend
- **WhatsApp:** Twilio API o WhatsApp Business API
- **Almacenamiento:** Supabase Storage (para imágenes)
- **Hosting:** Vercel, Netlify o Railway

### 5.2 Estructura de Base de Datos (Esquema Principal)

```
Tablas principales:
- users (autenticación)
- clients (clientes)
- memberships (tipos de membresía)
- client_memberships (membresías de clientes)
- payments (pagos)
- locations (sedes)
- attendances (asistencias)
- guests (invitados)
- classes (clases grupales)
- class_enrollments (inscripciones a clases)
- routines (rutinas)
- exercises (ejercicios)
- routine_exercises (ejercicios de rutinas)
- roles (roles de usuario)
- notifications (notificaciones)
- audit_logs (registro de auditoría)
```

---

## 6. INTERFACES EXTERNAS

### 6.1 Interfaces de Usuario
- Portal público (landing page)
- Portal de clientes
- Panel administrativo
- Aplicación móvil responsive

### 6.2 Interfaces de Hardware
- Computadoras de escritorio
- Tablets
- Smartphones
- Impresoras (para comprobantes)

### 6.3 Interfaces de Software
- Navegadores web
- Supabase API
- Email service API
- WhatsApp API

### 6.4 Interfaces de Comunicación
- HTTPS para todas las comunicaciones
- WebSocket para notificaciones en tiempo real (opcional)
- REST API para comunicación cliente-servidor

---

## 8. CRITERIOS DE ACEPTACIÓN GENERAL

### 8.1 Funcionalidad
- Todas las funcionalidades especificadas operativas
- Sin errores críticos
- Validaciones funcionando correctamente
- Flujos de trabajo completados exitosamente

### 8.2 Rendimiento
- Tiempos de respuesta dentro de lo especificado
- Capacidad de manejar carga esperada
- Sin degradación significativa con datos reales

### 8.3 Seguridad
- Autenticación funcionando correctamente
- Autorización por roles implementada
- Datos sensibles protegidos
- Sin vulnerabilidades críticas

### 8.4 Usabilidad
- Interfaz intuitiva
- Navegación fluida
- Responsive en todos los dispositivos
- Feedback apropiado al usuario

### 8.5 Documentación
- Manual de usuario completo
- Documentación técnica actualizada
- Guías de instalación y configuración
- Comentarios en código

---

