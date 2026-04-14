# FisioWeb MVP

<p align="center">
  <img src="docs/screenshots/Landing 1.jpeg" alt="FisioWeb - Pantalla principal" width="800"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/Jest-Tests-C21325?style=flat-square&logo=jest&logoColor=white" alt="Jest"/>
</p>

<p align="center">
  Plataforma web de reservas online para clínica de fisioterapia.<br/>
  Proyecto de demostración del <strong>SDLC asistido por IA</strong> · <strong>Microcredencial GenAI · NTT DATA</strong>
</p>

---

## Contexto del proyecto

**FisioWeb MVP** es un proyecto desarrollado por **Juan García** en el marco de la microcredencial **GenAI de NTT DATA** (Departamento GenAI).

El objetivo no es producción: es evidenciar el recorrido completo del ciclo de vida del software (**SDLC**) asistido por IA generativa, de principio a fin, usando **Claude** y **Claude Code** como copiloto de desarrollo.

El flujo seguido fue:

```
Análisis funcional  →  Historias de usuario  →  Propuesta técnica
        ↓
Implementación asistida por IA (Claude Code)
        ↓
Tests reales  +  Documentación de calidad profesional
```

**Documentos SDLC previos al código:**
- [Análisis Funcional y Requisitos](ai-context/Analisis_Funcional_y_Requisitos.pdf)
- [Historias de Usuario](ai-context/Historias_de_Usuario.pdf)
- [Propuesta Técnica](ai-context/Propuesta_Tecnica.pdf)

**Documentación del proceso:**
- Los prompts utilizados están en `prompts/`
- Las decisiones técnicas y deuda identificada están en `memory-bank/`

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
- La creación de citas usa **transacciones Prisma** para prevenir doble booking bajo concurrencia.

---

## Capturas de pantalla

### Landing page

|                                       Home                                        |                                           Quiénes somos                                            |
|:---------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------------------:|
| <img src="docs/screenshots/Landing 1.png" alt="Landing page - Home" width="380"/> | <img src="docs/screenshots/Landing 2.png" alt="Landing page - Sección Quiénes somos" width="380"/> |
### Ejemplo del panel del fisio

| Mi agenda | Configurar disponibilidad |
|:---:|:---:|
| <img src="docs/screenshots/Panel fisio.png" alt="Panel fisio - Mi agenda" width="380"/> | <img src="docs/screenshots/Disp fisio.png" alt="Panel fisio - Configurar disponibilidad" width="380"/> |

### Ejemplo del panel del cliente

| Paso 1 - Tratamiento | Paso 2 - Profesional |
|:---:|:---:|
| <img src="docs/screenshots/Cliente1.png" alt="Panel cliente - Paso 1 Tratamiento" width="380"/> | <img src="docs/screenshots/Cliente2.png" alt="Panel cliente - Paso 2 Profesional" width="380"/> |

| Paso 3 - Fecha y hora | Paso 4 - Confirmación |
|:---:|:---:|
| <img src="docs/screenshots/Cliente3.png" alt="Panel cliente - Paso 3 Fecha y hora" width="380"/> | <img src="docs/screenshots/Cliente4.png" alt="Panel cliente - Paso 4 Confirmación" width="380"/> |

---

## Quickstart

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- Node.js 20+ *(solo para generar el hash del admin)*

### Primera vez

```bash
# 1. Clonar el repositorio y entrar
git clone <url-del-repo>
cd fisioweb-mvp

# 2. Copiar las variables de entorno
cp .env.example .env

# 3. Generar el hash de contraseña del admin y pegarlo en .env como ADMIN_PASSWORD_HASH
docker run --rm node:20-alpine sh -c \
  "mkdir /tmp/h && cd /tmp/h && npm init -y > /dev/null 2>&1 && \
   npm install bcryptjs > /dev/null 2>&1 && \
   node -e \"const b=require('bcryptjs'); b.hash('admin123', 12).then(console.log)\""

# 4. Arrancar todo el entorno (~2 min la primera vez)
docker compose up --build
```

Al arrancar, el backend ejecuta automáticamente:
1. `prisma migrate deploy` — crea las tablas
2. `prisma db seed` — carga datos demo (profesionales, tratamientos, paciente de prueba)

### Arranques sucesivos

```bash
docker compose up          # arrancar (~15 seg)
docker compose stop        # parar (conserva datos)
docker compose down        # parar y eliminar contenedores
docker compose down -v     # reset completo (borra la BD)
```

### URLs

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |

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

### Endpoints públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/professionals` | Lista de profesionales activos |
| `GET` | `/api/professionals/:id` | Perfil detallado |
| `GET` | `/api/treatments` | Catálogo de tratamientos |
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
Patient                    Professional
───────                    ────────────
id (cuid)                  id (cuid)
name                       name
email (unique)             email (unique)
phone?                     passwordHash
passwordHash               specialty
createdAt                  bio?  ·  photoUrl?
                           isActive  ·  createdAt

Treatment                  Availability
─────────                  ────────────
id (cuid)                  id (cuid)
name                       professionalId → Professional
description?               dayOfWeek  (0=Lun … 6=Dom)
durationMins               startTime "HH:MM"
isActive                   endTime   "HH:MM"

Block                      Appointment
─────                      ───────────
id (cuid)                  id (cuid)
professionalId             patientId      → Patient
startDatetime              professionalId → Professional
endDatetime                treatmentId    → Treatment
reason?                    startTime  ·  endTime
                           status  CONFIRMED | CANCELLED
                           cancelToken (unique)
                           createdAt
```

---

## Tests

```bash
cd backend
npm install

npm test                  # todos los tests + cobertura
npm run test:unit         # solo unitarios (no requieren DB)
npm run test:integration  # solo integración (requiere PostgreSQL)
```

### Cobertura

| Suite | Qué cubre |
|-------|-----------|
| **Unitarios** | `AuthService`, `AvailabilityService`, `AppointmentService` — con Prisma mockeado |
| **Integración** | `auth.api`, `appointments.api`, `availability.api` — con Supertest sobre Express real |

Objetivo mínimo: **≥ 70 % en servicios de negocio del backend**.

---

## Estructura del repositorio

```
fisioweb-mvp/
├── backend/
│   ├── src/
│   │   ├── routes/          # auth · professionals · treatments
│   │   │                    # availability · appointments · physio · admin
│   │   ├── controllers/     # Handlers HTTP ligeros
│   │   ├── services/        # Lógica de negocio (auth · professional · treatment
│   │   │                    # availability · appointment · email-mock)
│   │   └── middleware/
│   │       └── auth.middleware.ts   # authenticateToken · requireRole
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── jest.config.ts
│
├── frontend/
│   ├── src/
│   │   ├── context/         # AuthContext (JWT decode + localStorage)
│   │   ├── router/          # Rutas + ProtectedRoute
│   │   ├── services/        # Axios + interceptor auth
│   │   ├── hooks/           # useProfessionals · useTreatments
│   │   ├── pages/           # Todas las páginas por rol
│   │   └── features/
│   │       └── booking/     # Flujo multi-step (useReducer)
│   └── vite.config.ts
│
├── tests/
│   ├── unit/                # auth · availability · appointment services
│   └── integration/         # auth · appointments · availability API
│
├── ai-context/              # Documentos SDLC previos al código
│   ├── Analisis_funcional.md
│   ├── Historias_de_usuario.md
│   └── Propuesta_tecnica.md
│
├── memory-bank/
│   ├── decisions.md         # Decisiones técnicas tomadas
│   └── technical-debt.md    # Deuda técnica identificada
│
├── prompts/                 # Prompts utilizados con Claude y Claude Code
├── docs/screenshots/        # Capturas de pantalla de la aplicación
├── docker-compose.yml
├── .env.example
└── CLAUDE.md
```

---

## Variables de entorno

### Raíz `.env` (Docker Compose)

```env
JWT_SECRET=supersecret_dev_only
ADMIN_EMAIL=admin@fisioweb.com
ADMIN_PASSWORD_HASH=<hash generado con bcrypt>
```

### `backend/.env` (desarrollo local sin Docker)

```env
DATABASE_URL=postgresql://fisioweb:fisioweb@localhost:5432/fisioweb
TEST_DATABASE_URL=postgresql://fisioweb:fisioweb@localhost:5432/fisioweb_test
JWT_SECRET=supersecret_dev_only
NODE_ENV=development
PORT=3000
ADMIN_EMAIL=admin@fisioweb.com
ADMIN_PASSWORD_HASH=<hash generado con bcrypt>
```

---

## Documentos SDLC

Los documentos generados antes de escribir código están en `ai-context/`:

| Documento | Descripción |
|-----------|-------------|
| [Análisis Funcional y Requisitos](ai-context/Analisis_Funcional_y_Requisitos.pdf) | Requisitos funcionales, actores, casos de uso y especificación detallada |
| [Historias de Usuario](ai-context/Historias_de_Usuario.pdf) | User stories con criterios de aceptación y escenarios de prueba |
| [Propuesta Técnica](ai-context/Propuesta_Tecnica.pdf) | Decisiones de stack, arquitectura, seguridad y plan de implementación |

---

<p align="center">
  Desarrollado con Claude + Claude Code · Microcredencial GenAI · NTT DATA
</p>
