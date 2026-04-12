# Plan de Implementación — FisioWeb MVP

> Generado por Claude Code · Abril 2026

---

## FASE 1 — Setup inicial

### Paso 1.1 — Estructura de carpetas y Docker Compose

**Archivos a crear:**

```
fisioweb-mvp/
  docker-compose.yml
  .env.example
  .env
  .gitignore
  backend/
    package.json
    tsconfig.json
    jest.config.ts
    .env.example
    src/
      app.ts
      server.ts
    prisma/
      schema.prisma
  frontend/
    package.json
    tsconfig.json
    vite.config.ts
    index.html
    src/
      main.tsx
```

**`docker-compose.yml`** — 3 servicios: `db` (postgres:16-alpine), `backend` (node:20-alpine, puerto 3000), `frontend` (node:20-alpine, puerto 5173). Backend depende de `db` con `healthcheck`. Monta volumen para hot-reload en desarrollo.

**`.env.example`** y **`.env`**:
```
DATABASE_URL=postgresql://fisioweb:fisioweb@db:5432/fisioweb
JWT_SECRET=supersecret_dev_only
NODE_ENV=development
PORT=3000
```

**Verificación:** `docker compose up` levanta los 3 servicios sin errores.

---

### Paso 1.2 — Backend: dependencias npm

```bash
cd backend && npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken cors dotenv
npm install -D typescript ts-node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors @types/node jest ts-jest supertest @types/supertest @types/jest
```

**`tsconfig.json`** — `strict: true`, `target: ES2022`, `moduleResolution: node`, `outDir: dist`, `rootDir: src`.

**`jest.config.ts`** — preset `ts-jest`, testEnvironment `node`, roots `['./src', '../tests']`.

---

### Paso 1.3 — Frontend: dependencias npm

```bash
cd frontend && npm create vite@latest . -- --template react-ts
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Verificación antes de continuar:** `docker compose up --build` levanta todo. Frontend sirve en `:5173`, backend responde en `:3000/api`.

---

## FASE 2 — Base de datos

### Paso 2.1 — Prisma schema

**`backend/prisma/schema.prisma`** — schema exacto del CLAUDE.md: modelos `Patient`, `Professional`, `Treatment`, `Availability`, `Block`, `Appointment`, enum `AppStatus`.

```bash
cd backend && npx prisma migrate dev --name init
```

Genera `migrations/` con la migración inicial y crea el cliente Prisma.

**`backend/src/prisma.ts`** — singleton del cliente:
```ts
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
```

---

### Paso 2.2 — Seed realista

**`backend/prisma/seed.ts`** — ejecutado por `prisma db seed`:

- **3 profesionales:** María López (Fisio general), Carlos Ruiz (Deportiva), Ana Torres (Neurológica). Cada uno con `passwordHash` bcrypt del password `prof123`, `isActive: true`.
- **5 tratamientos:** Fisioterapia general (60 min), Masaje deportivo (45 min), Rehabilitación postquirúrgica (90 min), Electroterapia (30 min), Punción seca (45 min). Todos `isActive: true`.
- **Disponibilidades** para cada profesional: lunes–viernes 09:00–18:00 (`dayOfWeek` 0–4).
- **1 paciente demo:** `paciente@demo.com` / `demo1234`.

**`package.json`** del backend — añadir:
```json
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

**Verificación:** `npx prisma db seed` corre sin errores. `npx prisma studio` muestra los datos.

---

## FASE 3 — Backend

### Paso 3.1 — App Express + middleware base

**`backend/src/app.ts`**:
- `express()` con `cors({ origin: 'http://localhost:5173' })`, `express.json()`
- Monta todas las rutas bajo `/api`
- Handler de errores global devuelve `{ error, code }`

**`backend/src/server.ts`**:
- Importa `app`, ejecuta migraciones (`execSync('npx prisma migrate deploy')`), llama al seed, escucha en `process.env.PORT`.

---

### Paso 3.2 — Auth

**Archivos:**
- `src/services/auth.service.ts`
- `src/controllers/auth.controller.ts`
- `src/routes/auth.routes.ts`
- `src/middleware/auth.middleware.ts`

**`auth.service.ts`**:
- `register(name, email, phone, password)` — `bcrypt.hash(password, 12)`, crea `Patient`, devuelve JWT con `{ id, email, role: 'patient' }`.
- `login(email, password)` — busca paciente o profesional por email, `bcrypt.compare`, devuelve JWT con rol correcto (`patient` | `professional` | `admin`). Admin: comparar contra `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` en variables de entorno.

**`auth.middleware.ts`**:
- `authenticateToken` — extrae Bearer token, `jwt.verify`, añade `req.user = { id, email, role }`.
- `requireRole(...roles)` — middleware factory, verifica `req.user.role`.

**Verificación:** `POST /api/auth/register` y `POST /api/auth/login` devuelven JWT.

---

### Paso 3.3 — Profesionales y Tratamientos (públicos)

**Archivos:**
- `src/services/professional.service.ts`
- `src/services/treatment.service.ts`
- `src/controllers/professional.controller.ts`
- `src/controllers/treatment.controller.ts`
- `src/routes/professional.routes.ts`
- `src/routes/treatment.routes.ts`

**`professional.service.ts`**:
- `findAll()` — `prisma.professional.findMany({ where: { isActive: true } })`, excluye `passwordHash`.
- `findById(id)` — incluye `availability`.
- `create(data)` — hashea password, crea profesional.
- `update(id, data)` — actualiza campos.
- `toggleActive(id)` — `isActive = !current.isActive`.

**`treatment.service.ts`**:
- `findAll()` — `where: { isActive: true }`.
- `create`, `update`, `deactivate` (nunca delete físico).

**Verificación:** `GET /api/professionals` y `GET /api/treatments` devuelven datos del seed.

---

### Paso 3.4 — Availability

**`src/services/availability.service.ts`**:
- `getSlots(professionalId, date, treatmentId)`:
  1. Obtiene `Availability` del día de la semana de `date`.
  2. Obtiene citas `CONFIRMED` del profesional en ese día.
  3. Obtiene bloqueos que solapan con ese día.
  4. Genera slots de `durationMins` entre `startTime` y `endTime`.
  5. Filtra slots que solapan con citas existentes o bloqueos.
  6. Devuelve array de `{ startTime, endTime }` libres.
- `updateAvailability(professionalId, slots[])` — elimina y recrea con transacción.

**Ruta:** `GET /api/availability/:profId?date=YYYY-MM-DD&treatmentId=xxx`

**Verificación:** la ruta devuelve slots para un profesional con disponibilidad en el día pedido.

---

### Paso 3.5 — Appointments (paciente)

**`src/services/appointment.service.ts`**:
- `create(patientId, professionalId, treatmentId, startTime)`:
  - Dentro de `prisma.$transaction`:
    1. Verifica que `startTime` cae dentro de disponibilidad semanal.
    2. Verifica sin solapamiento con citas `CONFIRMED`.
    3. Verifica sin solapamiento con bloqueos.
    4. Calcula `endTime = startTime + treatment.durationMins`.
    5. Crea `Appointment` con `cancelToken = cuid()`.
    6. Llama `EmailMockService.sendConfirmation(...)`.
- `findByPatient(patientId)` — citas del paciente con relaciones.
- `cancelById(id, patientId)` — verifica ownership, `status = CANCELLED`, llama `EmailMockService.sendCancellation(...)`.
- `cancelByToken(token)` — busca por `cancelToken`, cancela sin autenticación.

**`src/services/email-mock.service.ts`**:
- `sendConfirmation(appointment)` — `console.log('[EMAIL] Confirmación de cita:', ...)`
- `sendCancellation(appointment)` — `console.log('[EMAIL] Cita cancelada:', ...)`

**Verificación:** `POST /api/appointments` crea cita, segundo intento en mismo slot devuelve 409.

---

### Paso 3.6 — Rutas Physio

**`src/routes/physio.routes.ts`** — todas protegidas con `authenticateToken + requireRole('professional')`:
- `GET /api/physio/agenda` — citas del profesional autenticado.
- `PUT /api/physio/availability` — llama `AvailabilityService.updateAvailability`.
- `POST /api/physio/blocks` — crea `Block`.
- `DELETE /api/physio/blocks/:id` — elimina bloqueo.

---

### Paso 3.7 — Rutas Admin

**`src/routes/admin.routes.ts`** — todas protegidas con `requireRole('admin')`:
- `GET /api/admin/appointments` — todas las citas con relaciones.
- `POST /api/admin/appointments` — crea cita manual.
- CRUD de profesionales y tratamientos (delega en sus servicios).

**Verificación:** login como admin, crear un profesional nuevo via API.

---

## FASE 4 — Tests

### Paso 4.1 — Tests unitarios

**`tests/unit/appointment.service.test.ts`** — `jest.mock('../../backend/src/prisma')`:
- Doble booking lanza error.
- Slot fuera de disponibilidad semanal lanza error.
- Solapamiento con bloqueo lanza error.
- Cita válida se crea y llama EmailMockService.

**`tests/unit/availability.service.test.ts`**:
- Día sin disponibilidad devuelve array vacío.
- Slots correctamente fragmentados por `durationMins`.
- Slots ocupados filtrados correctamente.

**`tests/unit/auth.service.test.ts`**:
- Register crea paciente con hash.
- Login con password incorrecto devuelve error.
- JWT contiene `{ id, email, role }`.

---

### Paso 4.2 — Tests de integración

Requieren `TEST_DATABASE_URL` en `.env` apuntando a una BD separada.

**`tests/integration/auth.api.test.ts`**:
- `POST /api/auth/register` → 201 + token.
- `POST /api/auth/login` con credenciales incorrectas → 401.

**`tests/integration/appointments.api.test.ts`**:
- Crear cita → 201.
- Crear cita duplicada en mismo slot → 409.
- Cancelar cita → 200, status CANCELLED.
- Cancelar por token → 200.

**`tests/integration/availability.api.test.ts`**:
- Slots disponibles para profesional con disponibilidad → array no vacío.
- Slots para día sin disponibilidad → array vacío.

**Verificación:** `npm test` pasa con ≥ 70% de cobertura en servicios.

---

## FASE 5 — Frontend

### Paso 5.1 — Configuración base

**`frontend/src/main.tsx`** — `RouterProvider` con `createBrowserRouter`.

**`frontend/src/context/AuthContext.tsx`**:
- Estado: `user: { id, email, role } | null`, `token: string | null`.
- `login(token)` — decodifica JWT, guarda en `localStorage`.
- `logout()` — limpia estado y localStorage.
- `isAuthenticated`, `hasRole(role)`.

**`frontend/src/router/index.tsx`** — define todas las rutas del CLAUDE.md. Componente `ProtectedRoute` que verifica rol y redirige a `/login` si no autenticado.

**`frontend/src/services/api.ts`** — instancia axios con `baseURL: 'http://localhost:3000/api'`, interceptor que añade `Authorization: Bearer <token>`.

---

### Paso 5.2 — Catálogo público

**Páginas:** `HomePage.tsx`, `ProfessionalDetailPage.tsx`, `TreatmentsPage.tsx`.

- `HomePage` — lista de profesionales activos con foto, especialidad, botón "Reservar".
- `ProfessionalDetailPage` — bio, especialidad, lista de tratamientos.
- `TreatmentsPage` — cards de tratamientos con nombre, descripción, duración.

**Hooks:** `useProfessionals()`, `useTreatments()` — llaman a la API, manejan loading/error.

---

### Paso 5.3 — Auth (login + registro)

**Páginas:** `LoginPage.tsx`, `RegisterPage.tsx`.

- Formularios con validación frontend.
- Al éxito llaman `AuthContext.login(token)` y redirigen a `/`.
- Errores del backend mostrados en el formulario.

---

### Paso 5.4 — Flujo de reserva (multi-step)

**`frontend/src/features/booking/`**:
- `BookingPage.tsx` — orquesta 4 pasos con estado local.
- `Step1Treatment.tsx` — selección de tratamiento.
- `Step2Professional.tsx` — selección de profesional.
- `Step3DateTime.tsx` — selector de fecha + slots disponibles.
- `Step4Confirm.tsx` — resumen + botón confirmar → `POST /api/appointments`.

Estado compartido: `{ treatmentId, professionalId, date, slot }` con `useReducer` en `BookingPage`.

---

### Paso 5.5 — Área del paciente

**Páginas:** `MyAppointmentsPage.tsx`, `CancelByTokenPage.tsx`.

- `MyAppointmentsPage` — lista de citas con estado, fecha, profesional, tratamiento. Botón "Cancelar" para citas CONFIRMED futuras.
- `CancelByTokenPage` — ruta `/appointments/cancel/:token`, llama `GET /api/appointments/cancel/:token`.

---

### Paso 5.6 — Panel del fisioterapeuta

**Páginas:** `PhysioAgendaPage.tsx`, `PhysioAvailabilityPage.tsx`.

- `PhysioAgendaPage` — vista de lista de citas agrupada por día.
- `PhysioAvailabilityPage` — checkboxes por día de la semana + inputs hora inicio/fin. `PUT /api/physio/availability`.
- Gestión de bloqueos: formulario fecha/hora + botón eliminar.

---

### Paso 5.7 — Panel del administrador

**Páginas:** `AdminAppointmentsPage.tsx`, `AdminProfessionalsPage.tsx`, `AdminTreatmentsPage.tsx`.

- `AdminAppointmentsPage` — tabla de todas las citas con filtro. Modal "Crear cita manual".
- `AdminProfessionalsPage` — tabla CRUD. Toggle activo/inactivo. Modal creación/edición.
- `AdminTreatmentsPage` — tabla CRUD. Modal creación/edición. Desactivación lógica.

---

## FASE 6 — Documentación final

### Paso 6.1 — README.md

1. Descripción del proyecto.
2. Quickstart: `git clone` + `cp .env.example .env` + `docker compose up --build`.
3. Credenciales demo del seed.
4. Árbol de estructura del repo.
5. Cómo ejecutar tests.

### Paso 6.2 — `memory-bank/decisions.md`

Decisiones técnicas con formato:
```
## [YYYY-MM-DD] Título
**Decisión:** ...
**Alternativas consideradas:** ...
**Razón:** ...
```

### Paso 6.3 — `memory-bank/technical-debt.md`

Deuda técnica identificada con severidad y justificación.

### Paso 6.4 — `prompts/`

Un archivo `.md` por fase del SDLC con los prompts exactos utilizados.

---

## Checklist final

- [ ] `docker compose up --build` levanta todo sin errores
- [ ] Seed corre automáticamente — datos visibles en la DB
- [ ] `npm test` pasa con ≥ 70% cobertura en servicios
- [ ] Flujo completo de reserva funciona end-to-end
- [ ] Admin puede crear profesional y tratamiento
- [ ] Fisio puede actualizar disponibilidad y ver agenda
- [ ] Cancelación por token funciona sin login
- [ ] Ningún endpoint devuelve `passwordHash`
