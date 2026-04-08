# Historias de Usuario

## FisioWeb MVP — Plataforma Online de Reservas para Clínica de Fisioterapia

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Autor:** Juan García  
**Organización:** NTT DATA · Departamento GenAI  

---

> ⚠️ **Nota importante:** Este proyecto es una demostración práctica de capacidades de desarrollo asistido por Inteligencia Artificial Generativa (Claude + Claude Code) en el marco del programa de microcredencial GenAI de NTT DATA. Todo el stack se ejecuta en local con Docker. No está previsto su despliegue en producción.

---

## 1. Introducción

El presente documento recoge las historias de usuario que describen las necesidades funcionales del sistema FisioWeb MVP desde la perspectiva de los distintos perfiles involucrados: paciente, fisioterapeuta y administrador.

El objetivo de este documento es servir como base clara y compartida para el desarrollo de la solución, asegurando que el sistema responda a los problemas actuales del negocio: la ausencia de presencia digital, la pérdida de reservas fuera de horario y la carga administrativa del equipo telefónico.

---

## 2. Índice de historias de usuario

| Épica | Historias |
|-------|-----------|
| **Épica 1: Catálogo y descubrimiento** | US-001, US-002, US-003 |
| **Épica 2: Autenticación de pacientes** | US-004, US-005 |
| **Épica 3: Reservas** | US-006, US-007, US-008, US-009 |
| **Épica 4: Gestión de agenda (Fisioterapeuta)** | US-010, US-011, US-012 |
| **Épica 5: Panel de administración** | US-013, US-014, US-015, US-016 |

---

## Épica 1: Catálogo y descubrimiento

---

### US-001 — Ver listado de fisioterapeutas

| Campo | Valor |
|-------|-------|
| **Como** | paciente |
| **Quiero** | ver un listado de todos los fisioterapeutas de la clínica con su foto y especialidad |
| **Para** | elegir al profesional que mejor se ajuste a mis necesidades antes de reservar |
| **Prioridad** | Alta |
| **Estimación** | S — Small |
| **Dependencias** | RF-001 |
| **Responsable** | Paciente |

**Criterios de aceptación:**

- La página muestra todos los fisioterapeutas activos con foto, nombre y especialidad principal.
- Al hacer clic en un profesional se accede a su perfil detallado.
- Los fisioterapeutas inactivos no aparecen en el listado.
- El listado es accesible sin necesidad de autenticación.

**Flujo del usuario:**

1. El paciente accede a la página principal de la clínica.
2. Navega a la sección de fisioterapeutas.
3. Visualiza el listado con foto, nombre y especialidad de cada profesional.
4. Hace clic en un profesional para ver su perfil completo.

---

### US-002 — Ver perfil de un fisioterapeuta

| Campo | Valor |
|-------|-------|
| **Como** | paciente |
| **Quiero** | ver el perfil completo de un fisioterapeuta |
| **Para** | conocer su experiencia y especialidades y decidir si quiero reservar con él/ella |
| **Prioridad** | Alta |
| **Estimación** | S — Small |
| **Dependencias** | US-001, RF-002 |
| **Responsable** | Paciente |

**Criterios de aceptación:**

- El perfil muestra foto, nombre, especialidades, bio e idiomas.
- Se muestra la disponibilidad general del profesional.
- Hay un botón directo para iniciar una reserva con ese profesional.
- Accesible sin autenticación previa.

**Flujo del usuario:**

1. El paciente accede al perfil desde el listado de fisioterapeutas.
2. Visualiza toda la información del profesional.
3. Pulsa el botón de reserva para iniciar el flujo de cita.

---

### US-003 — Ver catálogo de tratamientos

| Campo | Valor |
|-------|-------|
| **Como** | paciente |
| **Quiero** | explorar los tratamientos que ofrece la clínica |
| **Para** | saber qué tipo de sesión necesito antes de reservar |
| **Prioridad** | Alta |
| **Estimación** | S — Small |
| **Dependencias** | RF-003 |
| **Responsable** | Paciente |

**Criterios de aceptación:**

- Se muestra una lista de tratamientos con nombre, descripción y duración estimada.
- Cada tratamiento tiene un botón para iniciar una reserva.
- Los tratamientos desactivados no aparecen en el catálogo público.
- Accesible sin autenticación previa.

**Flujo del usuario:**

1. El paciente accede a la sección de tratamientos.
2. Explora el catálogo y lee las descripciones.
3. Pulsa el botón de reserva en el tratamiento que le interesa.

---

## Épica 2: Autenticación de pacientes

---

### US-004 — Registro de paciente

| Campo | Valor |
|-------|-------|
| **Como** | paciente nuevo |
| **Quiero** | registrarme con mi email y contraseña |
| **Para** | poder gestionar mis reservas de forma segura |
| **Prioridad** | Alta |
| **Estimación** | M — Medium |
| **Dependencias** | Ninguna |
| **Responsable** | Paciente |

**Criterios de aceptación:**

- El formulario solicita nombre, email, teléfono y contraseña.
- El email debe ser único en el sistema.
- La contraseña debe tener mínimo 8 caracteres.
- Tras el registro, el paciente recibe un email de bienvenida (mock en local).
- El paciente queda autenticado automáticamente tras el registro.

**Flujo del usuario:**

1. El paciente accede a la página de registro.
2. Completa el formulario con sus datos.
3. Envía el formulario.
4. El sistema valida los datos y crea la cuenta.
5. El paciente es redirigido al área privada.

> 📌 Validaciones obligatorias en frontend y backend. Email único verificado en BD.

---

### US-005 — Login de paciente

| Campo | Valor |
|-------|-------|
| **Como** | paciente registrado |
| **Quiero** | iniciar sesión con mi email y contraseña |
| **Para** | acceder a mis reservas y gestionar mis citas |
| **Prioridad** | Alta |
| **Estimación** | S — Small |
| **Dependencias** | US-004, RF-017 |
| **Responsable** | Paciente |

**Criterios de aceptación:**

- Con credenciales correctas, el paciente accede al área privada.
- Con credenciales incorrectas, se muestra un mensaje de error genérico sin revelar qué campo falló.
- Existe opción de recuperación de contraseña.
- La sesión se mantiene mediante JWT con expiración de 7 días.

**Flujo del usuario:**

1. El paciente accede a la página de login.
2. Introduce su email y contraseña.
3. El sistema valida las credenciales.
4. Si son correctas, es redirigido al área privada.

---

## Épica 3: Reservas

---

### US-006 — Reservar cita

| Campo | Valor |
|-------|-------|
| **Como** | paciente |
| **Quiero** | seleccionar un tratamiento, un fisioterapeuta y una franja horaria disponible |
| **Para** | confirmar mi cita en la clínica de forma autónoma en cualquier momento |
| **Prioridad** | Alta |
| **Estimación** | L — Large |
| **Dependencias** | US-005, RF-006, RF-007, RF-011 |
| **Responsable** | Paciente |

**Criterios de aceptación:**

- El flujo permite seleccionar: tratamiento → profesional → fecha → hora disponible.
- Solo se muestran franjas horarias libres para el profesional seleccionado.
- Al confirmar, se guarda la cita y se envía email de confirmación al paciente (mock en local).
- La franja queda bloqueada inmediatamente para otros pacientes.
- No es posible reservar sin estar autenticado; se redirige al login.

**Flujo del usuario:**

1. El paciente selecciona el tratamiento deseado.
2. Selecciona el fisioterapeuta de su preferencia.
3. Elige la fecha disponible en el calendario.
4. Selecciona la franja horaria libre.
5. Confirma la reserva y recibe el email de confirmación.

> 📌 Historia crítica. Requiere lógica de concurrencia para evitar doble booking.

---

### US-007 — Ver mis citas

| Campo | Valor |
|-------|-------|
| **Como** | paciente |
| **Quiero** | ver un listado de mis citas pasadas y futuras |
| **Para** | tener un registro de mis visitas a la clínica y gestionar las próximas |
| **Prioridad** | Alta |
| **Estimación** | M — Medium |
| **Dependencias** | US-006, RF-006 |
| **Responsable** | Paciente |

**Criterios de aceptación:**

- Se muestran citas futuras (destacadas) y pasadas.
- Cada cita muestra: profesional, tratamiento, fecha y hora.
- Las citas futuras tienen opción de cancelación.
- Las citas pasadas son de solo lectura.

**Flujo del usuario:**

1. El paciente accede a su área privada.
2. Navega a "Mis citas".
3. Visualiza el listado de citas futuras y pasadas.

---

### US-008 — Cancelar cita

| Campo | Valor |
|-------|-------|
| **Como** | paciente |
| **Quiero** | cancelar una cita reservada |
| **Para** | liberar el hueco si no puedo asistir |
| **Prioridad** | Alta |
| **Estimación** | M — Medium |
| **Dependencias** | US-007, RF-009 |
| **Responsable** | Paciente |

**Criterios de aceptación:**

- El paciente puede cancelar desde su área privada o desde el enlace del email de confirmación.
- Solo se pueden cancelar citas con más de 24h de antelación.
- Al cancelar, la franja queda disponible de nuevo.
- Se envía email de confirmación de cancelación (mock en local).
- La cancelación mediante enlace de email no requiere login (token UUID único por cita).

**Flujo del usuario:**

1. El paciente accede a "Mis citas" o al enlace de cancelación del email.
2. Selecciona la cita que desea cancelar.
3. Confirma la cancelación.
4. El sistema libera la franja y envía confirmación.

---

### US-009 — Recibir recordatorio de cita

| Campo | Valor |
|-------|-------|
| **Como** | paciente |
| **Quiero** | recibir un email recordatorio 24 horas antes de mi cita |
| **Para** | no olvidar la visita a la clínica |
| **Prioridad** | Media |
| **Estimación** | M — Medium |
| **Dependencias** | US-006, RF-010 |
| **Responsable** | Paciente |

**Criterios de aceptación:**

- El email se envía automáticamente 24h antes de la cita (simulado en local mediante log).
- El email incluye los datos de la cita y el enlace de cancelación.
- Si la cita ya fue cancelada, no se envía el recordatorio.

> 📌 En el MVP local se simula mediante un job programado que registra el envío en consola.

---

## Épica 4: Gestión de agenda (Fisioterapeuta)

---

### US-010 — Configurar disponibilidad semanal

| Campo | Valor |
|-------|-------|
| **Como** | fisioterapeuta |
| **Quiero** | definir mis franjas horarias disponibles por día de la semana |
| **Para** | que los pacientes solo puedan reservar cuando estoy disponible |
| **Prioridad** | Alta |
| **Estimación** | M — Medium |
| **Dependencias** | RF-012 |
| **Responsable** | Fisioterapeuta |

**Criterios de aceptación:**

- Puedo definir franjas de inicio y fin para cada día laborable.
- Los cambios se reflejan inmediatamente en el sistema de reservas.
- Solo el propio fisioterapeuta y el administrador pueden modificar su disponibilidad.

**Flujo del usuario:**

1. El fisioterapeuta accede a su panel de agenda.
2. Selecciona la sección de disponibilidad.
3. Define las franjas horarias por día de la semana.
4. Guarda la configuración.

---

### US-011 — Ver mi agenda

| Campo | Valor |
|-------|-------|
| **Como** | fisioterapeuta |
| **Quiero** | ver mis citas del día y de la semana |
| **Para** | organizar mi jornada y conocer mis compromisos |
| **Prioridad** | Alta |
| **Estimación** | M — Medium |
| **Dependencias** | US-010, RF-013 |
| **Responsable** | Fisioterapeuta |

**Criterios de aceptación:**

- La vista diaria y semanal muestra todas mis citas con datos del paciente, tratamiento y hora.
- Las franjas bloqueadas aparecen diferenciadas visualmente.
- Puedo navegar entre semanas.

**Flujo del usuario:**

1. El fisioterapeuta accede a su panel.
2. Visualiza su agenda en vista diaria o semanal.
3. Navega entre días o semanas según necesite.

---

### US-012 — Bloquear franjas horarias

| Campo | Valor |
|-------|-------|
| **Como** | fisioterapeuta |
| **Quiero** | bloquear horas concretas en mi agenda |
| **Para** | gestionar ausencias o tiempo personal sin que los pacientes puedan reservar |
| **Prioridad** | Media |
| **Estimación** | M — Medium |
| **Dependencias** | US-010, RF-014 |
| **Responsable** | Fisioterapeuta |

**Criterios de aceptación:**

- Puedo bloquear franjas individuales o rangos de fechas.
- Las franjas bloqueadas no aparecen como disponibles para los pacientes.
- El sistema me informa si existe alguna cita ya reservada en el rango que intento bloquear.

**Flujo del usuario:**

1. El fisioterapeuta accede a su agenda.
2. Selecciona la franja o rango que desea bloquear.
3. Confirma el bloqueo.
4. La franja desaparece del sistema de reservas para los pacientes.

---

## Épica 5: Panel de administración

---

### US-013 — Gestionar profesionales

| Campo | Valor |
|-------|-------|
| **Como** | administrador |
| **Quiero** | crear, editar y desactivar perfiles de fisioterapeutas |
| **Para** | mantener actualizado el catálogo de la clínica |
| **Prioridad** | Alta |
| **Estimación** | M — Medium |
| **Dependencias** | RF-004, RF-008 |
| **Responsable** | Administrador |

**Criterios de aceptación:**

- Puedo crear un nuevo perfil con todos sus datos y credenciales de acceso.
- Puedo editar cualquier campo del perfil de un fisioterapeuta.
- Puedo desactivar un perfil sin eliminarlo (el histórico de citas se conserva).
- Los perfiles desactivados no aparecen en el catálogo público.

**Flujo del usuario:**

1. El administrador accede al panel de gestión.
2. Navega a la sección de profesionales.
3. Crea, edita o desactiva el perfil deseado.
4. Los cambios se reflejan inmediatamente en el catálogo público.

---

### US-014 — Gestionar tratamientos

| Campo | Valor |
|-------|-------|
| **Como** | administrador |
| **Quiero** | gestionar el catálogo de tratamientos |
| **Para** | mantenerlo actualizado con la oferta real de la clínica |
| **Prioridad** | Alta |
| **Estimación** | S — Small |
| **Dependencias** | RF-005 |
| **Responsable** | Administrador |

**Criterios de aceptación:**

- Puedo añadir un nuevo tratamiento con nombre, descripción y duración.
- Puedo editar y eliminar tratamientos existentes.
- Un tratamiento eliminado no aparece disponible en nuevas reservas.
- Los cambios son inmediatos en el catálogo público.

**Flujo del usuario:**

1. El administrador accede al panel de gestión.
2. Navega a la sección de tratamientos.
3. Añade, edita o elimina el tratamiento.

---

### US-015 — Ver agenda global de la clínica

| Campo | Valor |
|-------|-------|
| **Como** | administrador |
| **Quiero** | ver la agenda de todos los profesionales en una vista unificada |
| **Para** | tener visibilidad completa de la ocupación de la clínica |
| **Prioridad** | Alta |
| **Estimación** | L — Large |
| **Dependencias** | US-011, RF-015 |
| **Responsable** | Administrador |

**Criterios de aceptación:**

- La vista muestra las citas de todos los fisioterapeutas en un calendario.
- Puedo filtrar por profesional, fecha o tratamiento.
- Puedo hacer clic en cualquier cita para ver su detalle completo.

**Flujo del usuario:**

1. El administrador accede al panel.
2. Visualiza la agenda global de la clínica.
3. Aplica filtros por profesional o fecha.
4. Consulta el detalle de cualquier cita.

---

### US-016 — Crear cita manualmente

| Campo | Valor |
|-------|-------|
| **Como** | administrador |
| **Quiero** | registrar una cita manualmente |
| **Para** | que las citas gestionadas por teléfono queden reflejadas en el sistema |
| **Prioridad** | Media |
| **Estimación** | M — Medium |
| **Dependencias** | US-015, RF-016 |
| **Responsable** | Administrador |

**Criterios de aceptación:**

- Puedo crear una cita indicando paciente (existente o nuevo), fisio, tratamiento y hora.
- La cita ocupa la franja y no puede reservarse online simultáneamente.
- El paciente recibe el mismo email de confirmación que en una reserva online (mock en local).

**Flujo del usuario:**

1. El administrador recibe una llamada de un paciente.
2. Accede al panel y crea la cita manualmente.
3. Selecciona paciente, fisioterapeuta, tratamiento, fecha y hora.
4. Confirma la cita; el sistema la registra y bloquea la franja.

> 📌 Permite la convivencia del sistema digital con las llamadas telefónicas durante la transición.

---

## 3. Resumen del backlog

| ID | Título | Épica | Prioridad | Estimación |
|----|--------|-------|-----------|------------|
| US-001 | Ver listado de fisioterapeutas | Catálogo | Alta | S |
| US-002 | Ver perfil de un fisioterapeuta | Catálogo | Alta | S |
| US-003 | Ver catálogo de tratamientos | Catálogo | Alta | S |
| US-004 | Registro de paciente | Autenticación | Alta | M |
| US-005 | Login de paciente | Autenticación | Alta | S |
| US-006 | Reservar cita | Reservas | Alta | L |
| US-007 | Ver mis citas | Reservas | Alta | M |
| US-008 | Cancelar cita | Reservas | Alta | M |
| US-009 | Recibir recordatorio de cita | Reservas | Media | M |
| US-010 | Configurar disponibilidad semanal | Agenda | Alta | M |
| US-011 | Ver mi agenda | Agenda | Alta | M |
| US-012 | Bloquear franjas horarias | Agenda | Media | M |
| US-013 | Gestionar profesionales | Admin | Alta | M |
| US-014 | Gestionar tratamientos | Admin | Alta | S |
| US-015 | Ver agenda global | Admin | Alta | L |
| US-016 | Crear cita manualmente | Admin | Media | M |

> **Estimaciones:** S = Small (< 1 día) · M = Medium (1-2 días) · L = Large (2-3 días)
