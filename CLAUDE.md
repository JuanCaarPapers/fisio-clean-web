# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Comandos principales

```bash
# Arrancar todo el entorno (backend + frontend + DB)
docker compose up --build

# Desde /backend
npm test                        # todos los tests
npm test -- --testPathPattern=appointment  # un solo test file
npx prisma migrate dev          # nueva migración
npx prisma db seed              # ejecutar seed manualmente
```

> El backend ejecuta migraciones y seed automáticamente al arrancar con Docker.

---

## FisioWeb MVP — Contexto del proyecto

**FisioWeb MVP** es una plataforma web de reservas online para una clínica de fisioterapia.
Es un **proyecto de demostración de capacidades de desarrollo asistido por IA** desarrollado por Juan García en el marco del programa de microcredencial **GenAI de NTT DATA** (Departamento GenAI).

El objetivo no es desplegar en producción. El objetivo es evidenciar el recorrido completo del **SDLC asistido por IA** (Claude + Claude Code), produciendo código funcional, tests reales y documentación de calidad profesional.

**Todo corre en local. No hay despliegue.**

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS |
| Backend | Node.js 20 + Express.js |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT + bcrypt (salt 12) |
| Contenerización | Docker + Docker Compose |
| Tests | Jest + Supertest |
| Email | Mock — logs en consola (sin Resend, sin Redis, sin BullMQ) |

Arranque completo del entorno:

```bash
docker compose up --build
```

El backend ejecuta migraciones Prisma y seed automáticamente al arrancar.

---

## Estructura del repositorio

```
fisioweb-mvp/
  backend/
    src/
      routes/
      controllers/
      services/
      middleware/
    prisma/
      schema.prisma
      seed.ts
      migrations/
    jest.config.ts
    .env.example
  frontend/
    src/
      pages/
      features/
      components/
      services/
      hooks/
      context/
      router/
      types/
    vite.config.ts
  tests/
  docs/
    pdf/
    screenshots/
  prompts/
  memory-bank/
    decisions.md
    technical-debt.md
  docker-compose.yml
  .env.example
  README.md
  CLAUDE.md              ← este archivo
```

---

## Arquitectura

Tres capas desacopladas, ejecutadas con Docker Compose:

```
Navegador
    │
    ▼
React + Vite  :5173
    │  HTTP/JSON
    ▼
Node.js + Express  :3000
    │  Prisma ORM
    ▼
PostgreSQL 16  :5432
```

El backend es la única capa que toca la base de datos.
El frontend nunca accede directamente a PostgreSQL.
Las validaciones críticas van siempre en el backend, aunque el frontend valide también.

---

## Modelo de datos — Prisma Schema

```prisma
model Patient {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  phone        String?
  passwordHash String
  appointments Appointment[]
  createdAt    DateTime      @default(now())
}

model Professional {
  id           String         @id @default(cuid())
  name         String
  email        String         @unique
  passwordHash String
  specialty    String
  bio          String?
  photoUrl     String?
  isActive     Boolean        @default(true)
  appointments Appointment[]
  availability Availability[]
  blocks       Block[]
  createdAt    DateTime       @default(now())
}

model Treatment {
  id           String        @id @default(cuid())
  name         String
  description  String?
  durationMins Int
  isActive     Boolean       @default(true)
  appointments Appointment[]
}

model Availability {
  id             String       @id @default(cuid())
  professionalId String
  dayOfWeek      Int          // 0=Lunes 1=Martes ... 6=Domingo
  startTime      String       // "09:00"
  endTime        String       // "18:00"
  professional   Professional @relation(fields: [professionalId], references: [id])
}

model Block {
  id             String       @id @default(cuid())
  professionalId String
  startDatetime  DateTime
  endDatetime    DateTime
  reason         String?
  professional   Professional @relation(fields: [professionalId], references: [id])
}

model Appointment {
  id             String       @id @default(cuid())
  patientId      String
  professionalId String
  treatmentId    String
  startTime      DateTime
  endTime        DateTime
  status         AppStatus    @default(CONFIRMED)
  cancelToken    String       @unique @default(cuid())
  createdAt      DateTime     @default(now())
  patient        Patient      @relation(fields: [patientId], references: [id])
  professional   Professional @relation(fields: [professionalId], references: [id])
  treatment      Treatment    @relation(fields: [treatmentId], references: [id])
}

enum AppStatus {
  CONFIRMED
  CANCELLED
}
```

---

## Roles y control de acceso

Tres roles. El middleware verifica JWT + rol en cada endpoint protegido.

| Rol | Valor en token | Permisos |
|-----|---------------|----------|
| Paciente | `patient` | Ver catálogo, reservar, ver/cancelar sus citas |
| Fisioterapeuta | `professional` | Ver su agenda, gestionar disponibilidad y bloqueos |
| Administrador | `admin` | Acceso total: profesionales, tratamientos, agenda global, citas manuales |

Middleware en todos los endpoints protegidos:

```
authenticateToken  →  requireRole('patient' | 'professional' | 'admin')
```

---

## Endpoints de la API

### Públicos (sin auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/professionals` | Lista de profesionales activos |
| `GET` | `/api/professionals/:id` | Perfil detallado |
| `GET` | `/api/treatments` | Catálogo de tratamientos activos |
| `GET` | `/api/availability/:profId?date=YYYY-MM-DD` | Slots disponibles |
| `POST` | `/api/auth/register` | Registro de paciente |
| `POST` | `/api/auth/login` | Login — devuelve JWT |
| `GET` | `/api/appointments/cancel/:token` | Cancelar por token (sin login) |

### Paciente (role: patient)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/appointments` | Mis citas |
| `POST` | `/api/appointments` | Crear reserva |
| `DELETE` | `/api/appointments/:id` | Cancelar cita |

### Fisioterapeuta (role: professional)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/physio/agenda` | Mi agenda |
| `PUT` | `/api/physio/availability` | Actualizar disponibilidad semanal |
| `POST` | `/api/physio/blocks` | Crear bloqueo |
| `DELETE` | `/api/physio/blocks/:id` | Eliminar bloqueo |

### Administrador (role: admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/admin/appointments` | Agenda global |
| `POST` | `/api/admin/appointments` | Crear cita manual |
| `POST` | `/api/admin/professionals` | Crear profesional |
| `PUT` | `/api/admin/professionals/:id` | Editar profesional |
| `PATCH` | `/api/admin/professionals/:id/toggle` | Activar / desactivar |
| `POST` | `/api/admin/treatments` | Crear tratamiento |
| `PUT` | `/api/admin/treatments/:id` | Editar tratamiento |
| `DELETE` | `/api/admin/treatments/:id` | Eliminar tratamiento |

---

## Rutas del frontend

| Ruta | Componente | Auth |
|------|-----------|------|
| `/` | Home / catálogo de profesionales | No |
| `/professionals/:id` | Perfil del profesional | No |
| `/treatments` | Catálogo de tratamientos | No |
| `/login` | Login de paciente | No |
| `/register` | Registro de paciente | No |
| `/book` | Flujo de reserva (multi-step) | `patient` |
| `/my-appointments` | Mis citas | `patient` |
| `/appointments/cancel/:token` | Cancelación por token | No |
| `/physio/agenda` | Agenda del fisio | `professional` |
| `/physio/availability` | Configurar disponibilidad | `professional` |
| `/admin` | Panel admin — agenda global | `admin` |
| `/admin/professionals` | Gestión de profesionales | `admin` |
| `/admin/treatments` | Gestión de tratamientos | `admin` |

---

## Servicios del backend

Cada servicio encapsula la lógica de negocio de su dominio. Los controladores solo gestionan HTTP y delegan.

### `AppointmentService`
- Crea citas dentro de una **transacción Prisma** para evitar doble booking.
- Verifica disponibilidad: franja dentro del horario semanal del profesional, sin citas solapadas, sin bloqueos activos.
- Al crear o cancelar, llama a `EmailMockService`.

### `AvailabilityService`
- Dado un `professionalId` y una `date`, devuelve los slots libres en intervalos de `durationMins`.
- Cruza: disponibilidad semanal – citas existentes – bloqueos activos.

### `AuthService`
- Registro: hashea contraseña con bcrypt, crea `Patient`, devuelve JWT.
- Login: verifica hash, devuelve JWT con `{ id, email, role }`.

### `ProfessionalService`
- CRUD de profesionales. Desactivación lógica (`isActive = false`), nunca borrado físico.

### `TreatmentService`
- CRUD de tratamientos. Desactivación lógica (`isActive = false`).

### `EmailMockService`
- Simula todos los emails (confirmación, cancelación, recordatorio) con `console.log` estructurado.
- No usa Resend, SendGrid ni ningún servicio externo.
- Diseñado para ser reemplazado por un servicio real en producción sin tocar la lógica de negocio.

---

## Seguridad

- **JWT:** firmado con `JWT_SECRET` en `.env`. Expiración 7 días. Payload: `{ id, email, role }`.
- **bcrypt:** salt rounds 12. Nunca devolver `passwordHash` en ninguna respuesta.
- **Token de cancelación:** `cancelToken` UUID único por cita. Permite cancelar sin login.
- **CORS:** solo acepta peticiones desde `localhost:5173`.
- **Variables de entorno:** gestionadas en `.env` (en `.gitignore`). El repo incluye `.env.example`.

---

## Tests

Cobertura mínima objetivo: **70% en servicios de negocio del backend**.

```
tests/
  unit/
    appointment.service.test.ts
    availability.service.test.ts
    auth.service.test.ts
  integration/
    appointments.api.test.ts
    auth.api.test.ts
    availability.api.test.ts
```

- Tests unitarios con Jest, base de datos mockeada con `jest.mock('../prisma')`.
- Tests de integración con Supertest, base de datos de test separada (variable `TEST_DATABASE_URL`).
- Ejecutar: `npm test` desde `/backend`.

---

## Reglas de implementación

Sigue estas reglas en todo el código que generes:

1. **TypeScript estricto** en backend y frontend. Sin `any` salvo justificación explícita.
2. **Controladores ligeros.** Toda la lógica va en el servicio correspondiente.
3. **Errores con formato consistente:**
   ```json
   { "error": "Mensaje legible", "code": "ERROR_CODE" }
   ```
4. **Sin borrado físico** de profesionales ni tratamientos. Usar `isActive = false`.
5. **Transacciones Prisma** en cualquier operación que modifique más de una tabla o que requiera verificación atómica.
6. **Sin `console.log`** en producción salvo en `EmailMockService`, donde es intencional.
7. **Variables de entorno** nunca hardcodeadas. Leer siempre desde `process.env`.
8. **Seed realista:** el script de seed debe incluir al menos 3 profesionales, 5 tratamientos y disponibilidades configuradas para que el sistema sea demostrable sin configuración manual.
9. **Sin emojis en el código.** Solo en logs de `EmailMockService` si se quiere.
10. **Comentarios en español** cuando el contexto de negocio lo requiera. Código en inglés.

---

## Documentación del repo

La carpeta `ai-context/` contiene los 3 documentos del SDLC en Markdown generados antes del código:

- `Analisis_funcional.md`
- `Hisotrias de usuario.md`
- `Propuesta tecnica.md`

La carpeta `prompts/` contiene los prompts utilizados con Claude y Claude Code.

La carpeta `memory-bank/` contiene decisiones técnicas tomadas durante el desarrollo y deuda técnica identificada.

---

## Lo que NO hay que implementar

- ❌ Pagos online
- ❌ Historial clínico de pacientes
- ❌ Integración con Resend o cualquier servicio de email real
- ❌ Redis / BullMQ / cualquier cola de tareas
- ❌ Despliegue en Railway, Render o cualquier PaaS
- ❌ GitHub Actions / CI/CD
- ❌ App móvil nativa
- ❌ SSR / Next.js (se usa Vite + React)