# FisioWeb MVP

Plataforma web de reservas online para una clínica de fisioterapia desarrollada como demostración del ciclo de vida completo del software (SDLC) asistido por IA generativa (Claude + Claude Code), en el marco del programa de microcredencial **GenAI de NTT DATA**.

> Todo corre en local con Docker. No hay despliegue en producción.

---

## Índice

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Stack tecnológico](#stack-tecnológico)
3. [Arquitectura](#arquitectura)
4. [Quickstart](#quickstart)
5. [Credenciales demo](#credenciales-demo)
6. [Funcionalidades por rol](#funcionalidades-por-rol)
7. [API REST](#api-rest)
8. [Modelo de datos](#modelo-de-datos)
9. [Estructura del repositorio](#estructura-del-repositorio)
10. [Tests](#tests)
11. [Variables de entorno](#variables-de-entorno)

---

## Descripción del proyecto

FisioWeb MVP digitaliza la gestión de reservas de una clínica de fisioterapia. Permite a los pacientes explorar el catálogo de profesionales y tratamientos, reservar citas online y cancelarlas. Los fisioterapeutas gestionan su disponibilidad y agenda. El administrador tiene acceso total al sistema.

**Objetivo del proyecto:** evidenciar el recorrido completo del SDLC asistido por IA, produciendo código funcional, tests reales y documentación de calidad profesional en el menor tiempo posible.

**Contexto SDLC:** los documentos de análisis funcional, historias de usuario y propuesta técnica se generaron antes del código y están disponibles en `ai-context/`.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS |
| Backend | Node.js 20 + Express.js + TypeScript |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT (7 días) + bcrypt (salt 12) |
| Contenerización | Docker + Docker Compose |
| Tests | Jest + Supertest |
| Email | Mock — `console.log` estructurado (sin servicios externos) |

---

## Arquitectura

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

- El backend es la única capa que accede a la base de datos.
- El frontend nunca accede directamente a PostgreSQL.
- Las validaciones críticas (disponibilidad, solapamiento, ownership) van siempre en el backend.
- La creación de citas usa transacciones Prisma para prevenir doble booking bajo concurrencia.

---

## Quickstart

### Requisitos

- Docker Desktop (incluye Docker Compose)
- Node.js 20+ (solo para generar el hash del admin)

### Pasos

```bash
# 1. Entrar en el directorio del proyecto
cd fisioweb-mvp

# 2. Copiar las variables de entorno
cp .env.example .env

# 3. Generar el hash de la contraseña del admin y pegarlo en .env como ADMIN_PASSWORD_HASH
docker run --rm node:20-alpine sh -c \
  "mkdir /tmp/h && cd /tmp/h && npm init -y > /dev/null 2>&1 && \
   npm install bcryptjs > /dev/null 2>&1 && \
   node -e \"const b=require('bcryptjs'); b.hash('admin123', 12).then(console.log)\""

# 4. Arrancar todo el entorno (primera vez tarda ~2 min)
docker compose up --build
```

Al arrancar, el backend ejecuta automáticamente:
1. `prisma migrate deploy` — aplica las migraciones pendientes
2. `seed.ts` — carga los datos demo (solo si la BD está vacía)

### URLs

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |

---

## Arranque del entorno

### Primera vez (instalación completa)

```bash
# 1. Entrar al directorio del proyecto
cd fisioweb-mvp

# 2. Copiar las variables de entorno
cp .env.example .env

# 3. Generar el hash de la contraseña del admin y pegarlo en .env como ADMIN_PASSWORD_HASH
docker run --rm node:20-alpine sh -c \
  "mkdir /tmp/h && cd /tmp/h && npm init -y > /dev/null 2>&1 && \
   npm install bcryptjs > /dev/null 2>&1 && \
   node -e \"const b=require('bcryptjs'); b.hash('admin123', 12).then(console.log)\""

# 4. Construir y arrancar todos los servicios (tarda ~2 min la primera vez)
docker compose up --build
```

Al arrancar por primera vez, el backend ejecuta automáticamente:
1. `prisma migrate deploy` — crea las tablas en la base de datos
2. `prisma db seed` — carga los datos demo (profesionales, tratamientos, paciente de prueba)

### Cada vez que se quiera iniciar (después de la primera vez)

```bash
# Arrancar los servicios ya construidos (tarda ~15 seg)
docker compose up
```

### Parar el entorno

```bash
# Parar los contenedores (conserva los datos de la BD)
docker compose stop

# Parar y eliminar los contenedores (conserva los datos del volumen)
docker compose down

# Parar, eliminar contenedores Y borrar la base de datos (reset completo)
docker compose down -v
```

---

## Credenciales demo

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Paciente | paciente@demo.com | demo1234 |
| Fisioterapeuta | maria.lopez@fisioweb.com | prof123 |
| Fisioterapeuta | carlos.ruiz@fisioweb.com | prof123 |
| Fisioterapeuta | ana.torres@fisioweb.com | prof123 |
| Admin | admin@fisioweb.com | admin123 |

---

## Funcionalidades por rol

### Público (sin autenticación)

- Explorar catálogo de fisioterapeutas con perfil detallado
- Ver catálogo de tratamientos con duración y descripción
- Consultar slots disponibles por profesional, fecha y tratamiento
- Cancelar cita por token único (sin login)

### Paciente

- Registro y login
- Flujo de reserva multi-step: tratamiento → profesional → fecha/hora → confirmación
- Ver historial de citas con estado
- Cancelar citas confirmadas

### Fisioterapeuta

- Ver agenda propia (citas confirmadas agrupadas por día)
- Configurar disponibilidad semanal (días y franjas horarias)
- Crear y eliminar bloqueos de agenda

### Administrador

- Agenda global con filtro por profesional
- Crear citas manuales
- CRUD de profesionales (alta, edición, activar/desactivar)
- CRUD de tratamientos (alta, edición, desactivación lógica)

---

## API REST

### Públicos (sin auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/professionals` | Lista de profesionales activos |
| `GET` | `/api/professionals/:id` | Perfil detallado con disponibilidad |
| `GET` | `/api/treatments` | Catálogo de tratamientos activos |
| `GET` | `/api/availability/:profId?date=YYYY-MM-DD&treatmentId=` | Slots disponibles |
| `POST` | `/api/auth/register` | Registro de paciente |
| `POST` | `/api/auth/login` | Login — devuelve JWT |
| `GET` | `/api/appointments/cancel/:token` | Cancelar por token (sin login) |

### Paciente (`role: patient`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/appointments` | Mis citas |
| `POST` | `/api/appointments` | Crear reserva |
| `DELETE` | `/api/appointments/:id` | Cancelar cita |

### Fisioterapeuta (`role: professional`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/physio/agenda` | Mi agenda |
| `PUT` | `/api/physio/availability` | Actualizar disponibilidad semanal |
| `POST` | `/api/physio/blocks` | Crear bloqueo |
| `DELETE` | `/api/physio/blocks/:id` | Eliminar bloqueo |

### Administrador (`role: admin`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/admin/appointments` | Agenda global |
| `POST` | `/api/admin/appointments` | Crear cita manual |
| `POST` | `/api/admin/professionals` | Crear profesional |
| `PUT` | `/api/admin/professionals/:id` | Editar profesional |
| `PATCH` | `/api/admin/professionals/:id/toggle` | Activar / desactivar |
| `POST` | `/api/admin/treatments` | Crear tratamiento |
| `PUT` | `/api/admin/treatments/:id` | Editar tratamiento |
| `DELETE` | `/api/admin/treatments/:id` | Desactivar tratamiento |

**Formato de error estándar:**
```json
{ "error": "Mensaje legible", "code": "ERROR_CODE" }
```

---

## Modelo de datos

```
Patient            Professional
───────            ────────────
id                 id
name               name
email (unique)     email (unique)
phone?             passwordHash
passwordHash       specialty
createdAt          bio?
                   photoUrl?
                   isActive
                   createdAt

Treatment          Availability
─────────          ────────────
id                 id
name               professionalId → Professional
description?       dayOfWeek  (0=Lun … 6=Dom)
durationMins       startTime  "HH:MM"
isActive           endTime    "HH:MM"

Block              Appointment
─────              ───────────
id                 id
professionalId     patientId      → Patient
startDatetime      professionalId → Professional
endDatetime        treatmentId    → Treatment
reason?            startTime
                   endTime
                   status  CONFIRMED | CANCELLED
                   cancelToken (unique)
                   createdAt
```

---

## Estructura del repositorio

```
fisioweb-mvp/
├── backend/
│   ├── src/
│   │   ├── app.ts                    # Express + rutas + CORS
│   │   ├── server.ts                 # Arranque, migraciones, seed
│   │   ├── prisma.ts                 # Singleton PrismaClient
│   │   ├── routes/                   # auth, professionals, treatments,
│   │   │                             #   availability, appointments, physio, admin
│   │   ├── controllers/              # Handlers HTTP ligeros
│   │   ├── services/                 # Lógica de negocio
│   │   │   ├── auth.service.ts
│   │   │   ├── professional.service.ts
│   │   │   ├── treatment.service.ts
│   │   │   ├── availability.service.ts
│   │   │   ├── appointment.service.ts
│   │   │   └── email-mock.service.ts
│   │   └── middleware/
│   │       └── auth.middleware.ts    # authenticateToken, requireRole
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── jest.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                  # Punto de entrada
│   │   ├── index.css                 # Tailwind
│   │   ├── types/index.ts            # Tipos TypeScript compartidos
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # JWT decode + localStorage
│   │   ├── router/index.tsx          # Rutas + ProtectedRoute
│   │   ├── services/api.ts           # Axios + interceptor auth
│   │   ├── hooks/
│   │   │   ├── useProfessionals.ts
│   │   │   └── useTreatments.ts
│   │   ├── components/
│   │   │   └── Layout.tsx            # Nav + estructura base
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProfessionalDetailPage.tsx
│   │   │   ├── TreatmentsPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── MyAppointmentsPage.tsx
│   │   │   ├── CancelByTokenPage.tsx
│   │   │   ├── PhysioAgendaPage.tsx
│   │   │   ├── PhysioAvailabilityPage.tsx
│   │   │   ├── AdminAppointmentsPage.tsx
│   │   │   ├── AdminProfessionalsPage.tsx
│   │   │   └── AdminTreatmentsPage.tsx
│   │   └── features/
│   │       └── booking/              # Flujo multi-step
│   │           ├── BookingPage.tsx   # Orquestador con useReducer
│   │           ├── Step1Treatment.tsx
│   │           ├── Step2Professional.tsx
│   │           ├── Step3DateTime.tsx
│   │           └── Step4Confirm.tsx
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── package.json
│
├── tests/
│   ├── unit/
│   │   ├── auth.service.test.ts
│   │   ├── availability.service.test.ts
│   │   └── appointment.service.test.ts
│   └── integration/
│       ├── auth.api.test.ts
│       ├── appointments.api.test.ts
│       └── availability.api.test.ts
│
├── ai-context/                       # Documentos SDLC previos al código
│   ├── Analisis_funcional.md
│   ├── Hisotrias de usuario.md
│   └── Propuesta tecnica.md
│
├── memory-bank/
│   ├── plan.md                       # Plan de implementación completo
│   ├── decisions.md                  # Decisiones técnicas tomadas
│   └── technical-debt.md             # Deuda técnica identificada
│
├── docker-compose.yml
├── .env.example
├── CLAUDE.md
└── README.md
```

---

## Tests

```bash
cd backend
npm install

# Todos los tests con informe de cobertura
npm test

# Solo tests unitarios (no requieren DB)
npm run test:unit

# Solo tests de integración (requiere PostgreSQL activo)
npm run test:integration
```

### Tests unitarios

Usan `jest.mock('../prisma')` para aislar los servicios de la base de datos. Cubren:

- `AuthService` — registro, login correcto e incorrecto, JWT payload
- `AvailabilityService` — generación de slots, filtrado por citas y bloqueos
- `AppointmentService` — doble booking, bloqueos, fuera de disponibilidad, cancelación con ownership

### Tests de integración

Usan Supertest contra la aplicación Express real con base de datos activa. Requieren `TEST_DATABASE_URL` en `backend/.env`.

Cubren:
- `auth.api` — register, login, errores de validación
- `appointments.api` — crear cita, doble booking, cancelar, cancelar por token
- `availability.api` — slots disponibles, día sin disponibilidad, parámetros faltantes

### Cobertura objetivo

≥ 70% en servicios de negocio del backend.

---

## Variables de entorno

### Raíz (`.env`) — para Docker Compose

```env
JWT_SECRET=supersecret_dev_only
ADMIN_EMAIL=admin@fisioweb.com
ADMIN_PASSWORD_HASH=<hash generado con bcrypt>
```

### Backend (`backend/.env`) — para desarrollo local sin Docker

```env
DATABASE_URL=postgresql://fisioweb:fisioweb@localhost:5432/fisioweb
TEST_DATABASE_URL=postgresql://fisioweb:fisioweb@localhost:5432/fisioweb_test
JWT_SECRET=supersecret_dev_only
NODE_ENV=development
PORT=3000
ADMIN_EMAIL=admin@fisioweb.com
ADMIN_PASSWORD_HASH=<hash generado con bcrypt>
```

Para generar el hash del admin (requiere Docker):

```bash
docker run --rm node:20-alpine sh -c \
  "mkdir /tmp/h && cd /tmp/h && npm init -y > /dev/null 2>&1 && \
   npm install bcryptjs > /dev/null 2>&1 && \
   node -e \"const b=require('bcryptjs'); b.hash('tu_password_admin', 12).then(console.log)\""
```
