# Guía de la base de datos — FisioWeb MVP

Motor: PostgreSQL 16  
ORM: Prisma 5  
Schema en: `backend/prisma/schema.prisma`

Los IDs son CUID generados por Prisma (`@default(cuid())`), no UUIDs ni autoincrement.  
Ningún modelo se elimina físicamente: profesionales y tratamientos se desactivan con `isActive = false`.

---

## Diagrama de relaciones

```
Patient ──────────────────────────────┐
                                      │ patientId
                                ┌─────▼──────┐
Professional ──────────────────►│Appointment │
             professionalId     └─────┬──────┘
                                      │ treatmentId
Treatment ────────────────────────────┘

Professional ──► Availability   (1 a N, por día de la semana)
Professional ──► Block          (1 a N, bloqueos de agenda)
```

---

## Tablas

### Patient

Pacientes registrados en el sistema. Solo pueden ser creados desde `/auth/register`.

| Columna | Tipo SQL | Prisma | Restricciones | Descripción |
|---------|----------|--------|---------------|-------------|
| `id` | `TEXT` | `String` | PK, `@default(cuid())` | Identificador único |
| `name` | `TEXT` | `String` | NOT NULL | Nombre completo |
| `email` | `TEXT` | `String` | NOT NULL, UNIQUE | Email de acceso |
| `phone` | `TEXT` | `String?` | nullable | Teléfono de contacto |
| `passwordHash` | `TEXT` | `String` | NOT NULL | Hash bcrypt (salt 12) — nunca exponer en respuestas |
| `createdAt` | `TIMESTAMP` | `DateTime` | `@default(now())` | Fecha de registro |

**Relaciones:**
- `appointments`: `Appointment[]` — citas del paciente.

**Índices:**
- PK en `id`
- UNIQUE en `email`

---

### Professional

Fisioterapeutas de la clínica. Creados solo por admin. Nunca se eliminan físicamente.

| Columna | Tipo SQL | Prisma | Restricciones | Descripción |
|---------|----------|--------|---------------|-------------|
| `id` | `TEXT` | `String` | PK, `@default(cuid())` | Identificador único |
| `name` | `TEXT` | `String` | NOT NULL | Nombre completo |
| `email` | `TEXT` | `String` | NOT NULL, UNIQUE | Email de acceso |
| `passwordHash` | `TEXT` | `String` | NOT NULL | Hash bcrypt (salt 12) — nunca exponer |
| `specialty` | `TEXT` | `String` | NOT NULL | Especialidad (ej. "Fisioterapia deportiva") |
| `bio` | `TEXT` | `String?` | nullable | Descripción larga del profesional |
| `photoUrl` | `TEXT` | `String?` | nullable | URL de foto de perfil |
| `isActive` | `BOOLEAN` | `Boolean` | NOT NULL, `@default(true)` | Baja lógica — `false` oculta al profesional |
| `createdAt` | `TIMESTAMP` | `DateTime` | `@default(now())` | Fecha de creación |

**Relaciones:**
- `appointments`: `Appointment[]`
- `availability`: `Availability[]`
- `blocks`: `Block[]`

**Índices:**
- PK en `id`
- UNIQUE en `email`

---

### Treatment

Catálogo de tratamientos disponibles. Nunca se eliminan físicamente.

| Columna | Tipo SQL | Prisma | Restricciones | Descripción |
|---------|----------|--------|---------------|-------------|
| `id` | `TEXT` | `String` | PK, `@default(cuid())` | Identificador único |
| `name` | `TEXT` | `String` | NOT NULL | Nombre del tratamiento |
| `description` | `TEXT` | `String?` | nullable | Descripción opcional |
| `durationMins` | `INTEGER` | `Int` | NOT NULL | Duración en minutos — determina la longitud de los slots |
| `isActive` | `BOOLEAN` | `Boolean` | NOT NULL, `@default(true)` | Baja lógica |

**Relaciones:**
- `appointments`: `Appointment[]`

**Índices:**
- PK en `id`

---

### Availability

Horario semanal recurrente de cada profesional. Un registro por día de la semana trabajado.  
Se reemplaza completa al actualizar (`PUT /physio/availability` borra todos y vuelve a insertar).

| Columna | Tipo SQL | Prisma | Restricciones | Descripción |
|---------|----------|--------|---------------|-------------|
| `id` | `TEXT` | `String` | PK, `@default(cuid())` | Identificador único |
| `professionalId` | `TEXT` | `String` | NOT NULL, FK → Professional | Profesional al que pertenece |
| `dayOfWeek` | `INTEGER` | `Int` | NOT NULL | 0 = Lunes, 1 = Martes, ..., 6 = Domingo |
| `startTime` | `TEXT` | `String` | NOT NULL | Hora de inicio en formato `"HH:MM"` (ej. `"09:00"`) |
| `endTime` | `TEXT` | `String` | NOT NULL | Hora de fin en formato `"HH:MM"` (ej. `"18:00"`) |

**Relaciones:**
- `professional`: `Professional` — FK con `professionalId`

**Índices:**
- PK en `id`
- FK en `professionalId`

> **Nota sobre dayOfWeek:** el modelo usa lunes=0, lo que difiere de JavaScript (`Date.getDay()` donde domingo=0). La conversión se aplica en `AvailabilityService` y `AppointmentService`.

---

### Block

Bloqueos puntuales de agenda de un profesional (vacaciones, ausencias, etc.).  
A diferencia de `Availability`, trabaja con `DateTime` completo, no con hora relativa.

| Columna | Tipo SQL | Prisma | Restricciones | Descripción |
|---------|----------|--------|---------------|-------------|
| `id` | `TEXT` | `String` | PK, `@default(cuid())` | Identificador único |
| `professionalId` | `TEXT` | `String` | NOT NULL, FK → Professional | Profesional bloqueado |
| `startDatetime` | `TIMESTAMP` | `DateTime` | NOT NULL | Inicio del bloqueo (fecha y hora exactas) |
| `endDatetime` | `TIMESTAMP` | `DateTime` | NOT NULL | Fin del bloqueo (fecha y hora exactas) |
| `reason` | `TEXT` | `String?` | nullable | Motivo del bloqueo (opcional) |

**Relaciones:**
- `professional`: `Professional` — FK con `professionalId`

**Índices:**
- PK en `id`
- FK en `professionalId`

---

### Appointment

Citas reservadas. Núcleo del sistema. La creación es transaccional y verifica ausencia de solapamientos.

| Columna | Tipo SQL | Prisma | Restricciones | Descripción |
|---------|----------|--------|---------------|-------------|
| `id` | `TEXT` | `String` | PK, `@default(cuid())` | Identificador único |
| `patientId` | `TEXT` | `String` | NOT NULL, FK → Patient | Paciente que reserva |
| `professionalId` | `TEXT` | `String` | NOT NULL, FK → Professional | Profesional asignado |
| `treatmentId` | `TEXT` | `String` | NOT NULL, FK → Treatment | Tratamiento a realizar |
| `startTime` | `TIMESTAMP` | `DateTime` | NOT NULL | Inicio de la cita (UTC) |
| `endTime` | `TIMESTAMP` | `DateTime` | NOT NULL | Fin de la cita — calculado como `startTime + durationMins` |
| `status` | `ENUM` | `AppStatus` | NOT NULL, `@default(CONFIRMED)` | `CONFIRMED` o `CANCELLED` |
| `cancelToken` | `TEXT` | `String` | NOT NULL, UNIQUE, `@default(cuid())` | Token público para cancelar sin login |
| `createdAt` | `TIMESTAMP` | `DateTime` | `@default(now())` | Fecha de creación del registro |

**Enum `AppStatus`:**
- `CONFIRMED` — estado inicial
- `CANCELLED` — cancelada (por paciente, por token o por admin)

**Relaciones:**
- `patient`: `Patient` — FK con `patientId`
- `professional`: `Professional` — FK con `professionalId`
- `treatment`: `Treatment` — FK con `treatmentId`

**Índices:**
- PK en `id`
- UNIQUE en `cancelToken`
- FK en `patientId`, `professionalId`, `treatmentId`

---

## Lógica de negocio codificada en la BD

### Detección de solapamientos (en transacción)

Al crear una cita, `AppointmentService.create` verifica dentro de la misma transacción:

1. **Solapamiento con citas existentes:**
   ```sql
   SELECT * FROM "Appointment"
   WHERE "professionalId" = $1
     AND status = 'CONFIRMED'
     AND "startTime" < $endTime
     AND "endTime" > $startTime
   LIMIT 1;
   ```

2. **Solapamiento con bloqueos:**
   ```sql
   SELECT * FROM "Block"
   WHERE "professionalId" = $1
     AND "startDatetime" < $endTime
     AND "endDatetime" > $startTime
   LIMIT 1;
   ```

3. **Verificación de disponibilidad semanal:**
   ```sql
   SELECT * FROM "Availability"
   WHERE "professionalId" = $1
     AND "dayOfWeek" = $modelDow
   LIMIT 1;
   ```
   Luego compara `startTime >= availability.startTime` y `endTime <= availability.endTime` en memoria.

### Slots libres (`AvailabilityService.getSlots`)

El cálculo de slots no usa SQL para la lógica de intervalos; la hace en memoria:

1. Obtiene la `Availability` del día.
2. Obtiene todas las `Appointment` confirmadas del día.
3. Obtiene todos los `Block` que solapan con el día.
4. Itera de `startTime` a `endTime` en pasos de `durationMins` y descarta los que solapan.

---

## Consultas SQL directas de referencia

Estas consultas son equivalentes a lo que Prisma ejecuta. Útiles para debugging o acceso directo a la BD.

**Ver agenda de un profesional para una fecha:**
```sql
SELECT a.id, a."startTime", a."endTime", a.status,
       p.name AS patient_name, t.name AS treatment
FROM "Appointment" a
JOIN "Patient" p ON p.id = a."patientId"
JOIN "Treatment" t ON t.id = a."treatmentId"
WHERE a."professionalId" = '<cuid>'
  AND a."startTime" >= '2025-05-12 00:00:00'
  AND a."startTime" <  '2025-05-13 00:00:00'
ORDER BY a."startTime";
```

**Ver disponibilidad semanal de todos los profesionales:**
```sql
SELECT pr.name, av."dayOfWeek", av."startTime", av."endTime"
FROM "Availability" av
JOIN "Professional" pr ON pr.id = av."professionalId"
WHERE pr."isActive" = true
ORDER BY pr.name, av."dayOfWeek";
```

**Ver bloqueos activos a partir de hoy:**
```sql
SELECT pr.name, b."startDatetime", b."endDatetime", b.reason
FROM "Block" b
JOIN "Professional" pr ON pr.id = b."professionalId"
WHERE b."endDatetime" > NOW()
ORDER BY b."startDatetime";
```

**Ver citas de un paciente:**
```sql
SELECT a.id, a."startTime", a."endTime", a.status, a."cancelToken",
       pr.name AS professional, t.name AS treatment
FROM "Appointment" a
JOIN "Professional" pr ON pr.id = a."professionalId"
JOIN "Treatment" t ON t.id = a."treatmentId"
WHERE a."patientId" = '<cuid>'
ORDER BY a."startTime" DESC;
```

**Cancelar una cita por token (sin login):**
```sql
UPDATE "Appointment"
SET status = 'CANCELLED'
WHERE "cancelToken" = '<token>'
  AND status = 'CONFIRMED';
```

**Contar citas confirmadas por profesional (dashboard):**
```sql
SELECT pr.name, COUNT(*) AS total_confirmed
FROM "Appointment" a
JOIN "Professional" pr ON pr.id = a."professionalId"
WHERE a.status = 'CONFIRMED'
GROUP BY pr.name
ORDER BY total_confirmed DESC;
```

---

## Convenciones y reglas fijas

| Regla | Detalle |
|-------|---------|
| IDs | CUID, nunca autoincrement ni UUID |
| Timestamps | UTC en todo momento |
| Baja de profesionales | `isActive = false`, nunca `DELETE` |
| Baja de tratamientos | `isActive = false`, nunca `DELETE` |
| Contraseñas | bcrypt salt 12, almacenadas en `passwordHash`, nunca en texto plano |
| `cancelToken` | CUID único por cita, generado automáticamente al insertar |
| `dayOfWeek` | 0 = Lunes ... 6 = Domingo (difiere del estándar JS donde 0 = Domingo) |
| Horas de disponibilidad | String `"HH:MM"` en `Availability`, no `TIME` SQL |
| Fechas de bloqueo | `TIMESTAMP` completo en `Block` |
| `endTime` en citas | Siempre calculado como `startTime + treatment.durationMins * 60s`, nunca enviado por el cliente |
