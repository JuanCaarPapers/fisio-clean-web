# Guía de la API — FisioWeb MVP

Base URL: `http://localhost:3000/api`  
CORS permitido desde: `http://localhost:5173`  
Formato de respuesta: JSON en todos los endpoints.

---

## Autenticación

Todos los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

El token JWT se obtiene en `/auth/login` o `/auth/register`. Expira en 7 días.  
Payload del token: `{ id, email, role }` donde `role` es `patient`, `professional` o `admin`.

**Errores de autenticación comunes:**

| Código HTTP | `code` | Cuándo ocurre |
|-------------|--------|---------------|
| 401 | `MISSING_TOKEN` | No se envía el header Authorization |
| 403 | `INVALID_TOKEN` | Token inválido o expirado |
| 401 | `UNAUTHENTICATED` | Endpoint protegido sin usuario en contexto |
| 403 | `FORBIDDEN` | El rol del token no tiene acceso al endpoint |

**Formato de error estándar (todos los endpoints):**

```json
{ "error": "Mensaje legible", "code": "ERROR_CODE" }
```

---

## Endpoints públicos (sin autenticación)

### GET /health

Comprobación de estado del servidor.

**Respuesta 200:**
```json
{ "status": "ok" }
```

---

### POST /auth/register

Registra un nuevo paciente y devuelve un JWT.

**Body:**
```json
{
  "name": "string, requerido",
  "email": "string, requerido",
  "password": "string, requerido, mínimo 6 caracteres",
  "phone": "string, opcional"
}
```

**Respuesta 201:**
```json
{ "token": "eyJ..." }
```

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 400 | — | Campo requerido ausente o contraseña < 6 chars |
| 409 | `EMAIL_IN_USE` | El email ya está registrado |

---

### POST /auth/login

Autentica un usuario (paciente, profesional o admin) y devuelve un JWT.  
El sistema prueba primero admin (variable de entorno), luego profesional, luego paciente.

**Body:**
```json
{
  "email": "string, requerido",
  "password": "string, requerido"
}
```

**Respuesta 200:**
```json
{ "token": "eyJ..." }
```

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 400 | — | Campo requerido ausente |
| 401 | `INVALID_CREDENTIALS` | Email no encontrado o contraseña incorrecta |

---

### GET /professionals

Devuelve todos los profesionales activos (`isActive = true`), ordenados por nombre.

**Respuesta 200:**
```json
[
  {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "specialty": "string",
    "bio": "string | null",
    "photoUrl": "string | null",
    "isActive": true,
    "createdAt": "ISO 8601",
    "availability": [
      { "id": "cuid", "dayOfWeek": 0, "startTime": "09:00", "endTime": "18:00" }
    ]
  }
]
```

> `passwordHash` nunca se incluye en ninguna respuesta.

---

### GET /professionals/:id

Devuelve el perfil completo de un profesional (activo o no).

**Parámetros de ruta:** `id` — CUID del profesional.

**Respuesta 200:** mismo objeto que en la lista.

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 404 | `NOT_FOUND` | ID no existe |

---

### GET /treatments

Devuelve todos los tratamientos activos (`isActive = true`), ordenados por nombre.

**Respuesta 200:**
```json
[
  {
    "id": "cuid",
    "name": "string",
    "description": "string | null",
    "durationMins": 60,
    "isActive": true
  }
]
```

---

### GET /availability/:profId?date=YYYY-MM-DD&treatmentId=cuid

Devuelve los slots libres de un profesional para una fecha y tratamiento concretos.  
Los slots se generan en intervalos de `durationMins` del tratamiento, descontando citas confirmadas y bloqueos.

**Parámetros de ruta:** `profId` — CUID del profesional.

**Query params:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `date` | `YYYY-MM-DD` | Sí | Fecha para la que se consultan slots |
| `treatmentId` | string | Sí | CUID del tratamiento (determina la duración del slot) |

**Respuesta 200:**
```json
[
  { "startTime": "2025-05-12T09:00:00.000Z", "endTime": "2025-05-12T10:00:00.000Z" },
  { "startTime": "2025-05-12T10:00:00.000Z", "endTime": "2025-05-12T11:00:00.000Z" }
]
```

Devuelve array vacío si el profesional no tiene disponibilidad ese día o todos los slots están ocupados.

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 400 | `INVALID_DATE` | Fecha con formato inválido |
| 404 | `NOT_FOUND` | `treatmentId` no existe |

---

### GET /appointments/cancel/:token

Cancela una cita usando el token público incluido en el email de confirmación. No requiere login.

**Parámetros de ruta:** `token` — `cancelToken` de la cita.

**Respuesta 200:** objeto completo de la cita cancelada (con paciente, profesional y tratamiento).

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 404 | `INVALID_TOKEN` | Token no existe |
| 400 | `ALREADY_CANCELLED` | La cita ya estaba cancelada |

---

## Endpoints de paciente (role: patient)

### GET /appointments

Devuelve todas las citas del paciente autenticado, ordenadas por fecha descendente.

**Respuesta 200:**
```json
[
  {
    "id": "cuid",
    "startTime": "ISO 8601",
    "endTime": "ISO 8601",
    "status": "CONFIRMED | CANCELLED",
    "cancelToken": "cuid",
    "createdAt": "ISO 8601",
    "professional": { "id": "cuid", "name": "string", "specialty": "string" },
    "treatment": { "id": "cuid", "name": "string", "durationMins": 60, ... }
  }
]
```

---

### POST /appointments

Crea una nueva cita para el paciente autenticado.  
La creación se ejecuta en una **transacción Prisma** que verifica atómicamente disponibilidad, solapamientos y bloqueos.

**Body:**
```json
{
  "professionalId": "string, requerido",
  "treatmentId": "string, requerido",
  "startTime": "ISO 8601, requerido"
}
```

**Respuesta 201:** objeto completo de la cita creada (con paciente, profesional y tratamiento).

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 400 | — | Campo requerido ausente |
| 400 | `INVALID_DATE` | `startTime` no es fecha válida |
| 400 | `TREATMENT_UNAVAILABLE` | Tratamiento inactivo o no existe |
| 400 | `PROFESSIONAL_UNAVAILABLE` | Profesional inactivo o no existe |
| 409 | `NO_AVAILABILITY` | El profesional no trabaja ese día de la semana |
| 409 | `OUTSIDE_AVAILABILITY` | El slot cae fuera del horario laboral del día |
| 409 | `SLOT_TAKEN` | Hay otra cita confirmada que solapa |
| 409 | `BLOCKED` | El profesional tiene un bloqueo en ese horario |

---

### DELETE /appointments/:id

Cancela una cita del paciente autenticado. Solo puede cancelar sus propias citas.

**Parámetros de ruta:** `id` — CUID de la cita.

**Respuesta 200:** objeto completo de la cita cancelada.

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 404 | `NOT_FOUND` | Cita no existe |
| 403 | `FORBIDDEN` | La cita pertenece a otro paciente |
| 400 | `ALREADY_CANCELLED` | La cita ya estaba cancelada |

---

## Endpoints de fisioterapeuta (role: professional)

### GET /physio/agenda

Devuelve todas las citas del profesional autenticado, ordenadas por fecha ascendente.

**Respuesta 200:**
```json
[
  {
    "id": "cuid",
    "startTime": "ISO 8601",
    "endTime": "ISO 8601",
    "status": "CONFIRMED | CANCELLED",
    "patient": { "id": "cuid", "name": "string", "email": "string", "phone": "string | null" },
    "treatment": { "id": "cuid", "name": "string", "durationMins": 60, ... }
  }
]
```

---

### PUT /physio/availability

Reemplaza la disponibilidad semanal completa del profesional autenticado.  
Operación atómica: elimina todas las entradas anteriores y crea las nuevas en una transacción.

**Body:**
```json
{
  "slots": [
    { "dayOfWeek": 0, "startTime": "09:00", "endTime": "18:00" },
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "14:00" }
  ]
}
```

> `dayOfWeek`: 0 = Lunes, 1 = Martes, ..., 6 = Domingo.  
> `startTime` / `endTime`: formato `"HH:MM"`.

**Respuesta 200:** resultado de `createMany` de Prisma (contiene `count`).

---

### POST /physio/blocks

Crea un bloqueo de agenda para el profesional autenticado.

**Body:**
```json
{
  "startDatetime": "ISO 8601, requerido",
  "endDatetime": "ISO 8601, requerido",
  "reason": "string, opcional"
}
```

**Respuesta 201:** objeto del bloqueo creado.

---

### DELETE /physio/blocks/:id

Elimina un bloqueo de agenda del profesional autenticado.

**Parámetros de ruta:** `id` — CUID del bloqueo.

**Respuesta 200:** objeto del bloqueo eliminado.

---

## Endpoints de administrador (role: admin)

### GET /admin/appointments

Devuelve todas las citas del sistema, ordenadas por fecha descendente.

**Respuesta 200:** array de citas con paciente, profesional y tratamiento incluidos.

---

### POST /admin/appointments

Crea una cita manualmente desde el panel de administración.

**Body:** idéntico a `POST /appointments` del paciente.

**Respuesta 201:** objeto completo de la cita creada.

---

### POST /admin/professionals

Crea un nuevo profesional.

**Body:**
```json
{
  "name": "string, requerido",
  "email": "string, requerido",
  "password": "string, requerido",
  "specialty": "string, requerido",
  "bio": "string, opcional",
  "photoUrl": "string, opcional"
}
```

**Respuesta 201:** objeto del profesional creado (sin `passwordHash`).

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 400 | — | Campo requerido ausente |
| 409 | `EMAIL_IN_USE` | El email ya existe |

---

### PUT /admin/professionals/:id

Actualiza datos de un profesional (no permite cambiar contraseña por esta vía).

**Parámetros de ruta:** `id` — CUID del profesional.

**Body (todos opcionales):**
```json
{
  "name": "string",
  "email": "string",
  "specialty": "string",
  "bio": "string",
  "photoUrl": "string"
}
```

**Respuesta 200:** objeto del profesional actualizado.

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 404 | `NOT_FOUND` | ID no existe |

---

### PATCH /admin/professionals/:id/toggle

Invierte el estado `isActive` del profesional (activa si estaba inactivo, desactiva si estaba activo).

**Parámetros de ruta:** `id` — CUID del profesional.

**Respuesta 200:** objeto del profesional con el nuevo valor de `isActive`.

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 404 | `NOT_FOUND` | ID no existe |

---

### POST /admin/treatments

Crea un nuevo tratamiento.

**Body:**
```json
{
  "name": "string, requerido",
  "durationMins": "number, requerido",
  "description": "string, opcional"
}
```

**Respuesta 201:** objeto del tratamiento creado.

---

### PUT /admin/treatments/:id

Actualiza un tratamiento existente.

**Parámetros de ruta:** `id` — CUID del tratamiento.

**Body (todos opcionales):**
```json
{
  "name": "string",
  "durationMins": "number",
  "description": "string"
}
```

**Respuesta 200:** objeto del tratamiento actualizado.

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 404 | `NOT_FOUND` | ID no existe |

---

### DELETE /admin/treatments/:id

Desactiva un tratamiento (`isActive = false`). No lo elimina físicamente de la base de datos.

**Parámetros de ruta:** `id` — CUID del tratamiento.

**Respuesta 200:** objeto del tratamiento con `isActive: false`.

**Errores:**

| HTTP | `code` | Causa |
|------|--------|-------|
| 404 | `NOT_FOUND` | ID no existe |

---

## Resumen de todos los endpoints

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| GET | `/health` | No | — |
| POST | `/auth/register` | No | — |
| POST | `/auth/login` | No | — |
| GET | `/professionals` | No | — |
| GET | `/professionals/:id` | No | — |
| GET | `/treatments` | No | — |
| GET | `/availability/:profId` | No | — |
| GET | `/appointments/cancel/:token` | No | — |
| GET | `/appointments` | Sí | patient |
| POST | `/appointments` | Sí | patient |
| DELETE | `/appointments/:id` | Sí | patient |
| GET | `/physio/agenda` | Sí | professional |
| PUT | `/physio/availability` | Sí | professional |
| POST | `/physio/blocks` | Sí | professional |
| DELETE | `/physio/blocks/:id` | Sí | professional |
| GET | `/admin/appointments` | Sí | admin |
| POST | `/admin/appointments` | Sí | admin |
| POST | `/admin/professionals` | Sí | admin |
| PUT | `/admin/professionals/:id` | Sí | admin |
| PATCH | `/admin/professionals/:id/toggle` | Sí | admin |
| POST | `/admin/treatments` | Sí | admin |
| PUT | `/admin/treatments/:id` | Sí | admin |
| DELETE | `/admin/treatments/:id` | Sí | admin |
