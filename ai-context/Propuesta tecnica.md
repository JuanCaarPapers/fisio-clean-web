# Diseño Técnico y Propuesta Tecnológica

## FisioWeb MVP — Plataforma Online de Reservas para Clínica de Fisioterapia

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Autor:** Juan García  
**Organización:** NTT DATA · Departamento GenAI  

---

> ⚠️ **Nota importante:** Este proyecto es una demostración práctica de capacidades de desarrollo asistido por Inteligencia Artificial Generativa (Claude + Claude Code) en el marco del programa de microcredencial GenAI de NTT DATA. Todo el stack se ejecuta en local con Docker. No está previsto su despliegue en producción. Las notificaciones por email se simulan mediante logs en consola.

---

## Contenido

1. [Introducción](#1-introducción)
2. [Visión general de la solución](#2-visión-general-de-la-solución)
3. [Arquitectura del sistema](#3-arquitectura-del-sistema)
4. [Propuesta tecnológica](#4-propuesta-tecnológica)
5. [Diseño del Frontend](#5-diseño-del-frontend)
6. [Diseño del Backend](#6-diseño-del-backend)
7. [Diseño de la base de datos](#7-diseño-de-la-base-de-datos)
8. [Diseño de APIs REST](#8-diseño-de-apis-rest)
9. [Seguridad técnica](#9-seguridad-técnica)
10. [Estrategia de pruebas](#10-estrategia-de-pruebas)
11. [Estructura del repositorio](#11-estructura-del-repositorio)
12. [Conclusión](#12-conclusión)

---

## 1. Introducción

El presente documento define el diseño técnico y la propuesta tecnológica del proyecto FisioWeb MVP. Traduce los requisitos funcionales y no funcionales definidos en el análisis previo en una arquitectura técnica concreta, estableciendo las bases para el desarrollo, ejecución local y demostración del sistema.

El diseño técnico tiene en cuenta el contexto específico de este proyecto:

- **Proyecto de demostración** de capacidades de desarrollo asistido por IA (Claude + Claude Code) en el marco del programa GenAI de NTT DATA.
- **Entorno de ejecución 100% local** — sin despliegue en producción.
- **Stack moderno y ligero**, fácil de arrancar con un único comando Docker.
- **Objetivo:** evidenciar el recorrido completo del SDLC con entregables de calidad profesional.

### 1.1 Documentos de referencia

| Documento | Contenido |
|-----------|-----------|
| Análisis Funcional y de Requisitos | Define el contexto del negocio, actores, requisitos funcionales y no funcionales del sistema. |
| Historias de Usuario | Backlog completo de 16 historias de usuario organizadas en 5 épicas. |

---

## 2. Visión general de la solución

### 2.1 Descripción general

La solución propuesta es un sistema web de reservas para clínica de fisioterapia, diseñado como **monolito modular** con separación clara entre frontend, backend y base de datos. Permite a los pacientes consultar profesionales y tratamientos y reservar citas de forma autónoma. Los fisioterapeutas gestionan su disponibilidad y los administradores tienen visibilidad y control completo del sistema.

### 2.2 Objetivos técnicos

- Implementar el flujo completo de reservas con control de concurrencia para evitar doble booking.
- Aplicar autenticación JWT con control de acceso por roles (paciente, fisioterapeuta, administrador).
- Garantizar la integridad referencial de los datos mediante un ORM con migraciones automáticas.
- Proporcionar un entorno local reproducible con un único comando (`docker compose up`).
- Alcanzar una cobertura mínima del 70% en tests unitarios de la lógica de negocio crítica.
- Documentar el proceso completo para evidenciar el uso de Claude Code en el SDLC.

### 2.3 Principios de diseño

| Principio | Descripción |
|-----------|-------------|
| Separación de responsabilidades | Frontend, backend y base de datos desacoplados. Cada capa tiene una única responsabilidad bien definida. |
| Simplicidad operativa | Un único comando arranca todo el entorno. Sin configuraciones complejas ni dependencias externas. |
| Evolución incremental | Arquitectura modular que permite añadir funcionalidades en fases posteriores sin rediseños estructurales. |
| Demostración de capacidad | El código, la estructura y la documentación evidencian el dominio del SDLC asistido por IA. |

---

## 3. Arquitectura del sistema

### 3.1 Diagrama de arquitectura (conceptual)

La solución se basa en una arquitectura de **tres capas desacopladas**, ejecutadas localmente mediante Docker Compose:

| Capa | Tecnología | Puerto local | Responsabilidad |
|------|-----------|-------------|-----------------|
| Presentación (Frontend) | React + Vite + TypeScript | `:5173` | Interfaz de usuario, navegación, consumo de la API REST |
| Lógica de negocio (Backend) | Node.js + Express + Prisma | `:3000` | API REST, validación, lógica de reservas, control de roles |
| Persistencia (Base de datos) | PostgreSQL 16 | `:5432` | Almacenamiento persistente de todos los datos del sistema |

**Flujo general de la información:**

1. El usuario interactúa con la interfaz React servida por Vite en el puerto 5173.
2. El frontend envía peticiones HTTP/JSON a la API REST del backend en el puerto 3000.
3. El backend valida el JWT, comprueba el rol del usuario y aplica las reglas de negocio.
4. El backend accede a PostgreSQL a través de Prisma ORM para consultar o modificar datos.
5. El backend devuelve la respuesta JSON al frontend para su presentación al usuario.

### 3.2 Descripción de capas

#### Frontend — React + Vite + TypeScript

Aplicación SPA organizada en módulos funcionales por dominio. Responsable de la presentación, navegación y consumo de la API REST. Aplica control de rutas protegidas según el rol del usuario autenticado. Las validaciones críticas se delegan siempre al backend.

**Módulos:** Catálogo público · Autenticación · Área de paciente · Panel fisioterapeuta · Panel admin.

#### Backend — Node.js + Express + Prisma

API REST organizada en rutas, controladores y servicios por dominio funcional. Gestiona autenticación JWT, autorización por roles, lógica de reservas con control de concurrencia y simulación de notificaciones por email mediante logs.

**Servicios:** Auth · Professionals · Treatments · Appointments · Availability · Admin.

#### Base de datos — PostgreSQL 16 + Prisma ORM

Base de datos relacional con integridad referencial garantizada mediante claves foráneas. Prisma gestiona las migraciones automáticas y proporciona tipado fuerte en las consultas. Incluye seed inicial con datos de ejemplo para demostración.

**Entidades principales:** Patient · Professional · Treatment · Appointment · Availability · Block.

---

## 4. Propuesta tecnológica

### 4.1 Stack seleccionado

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | React 18 + Vite + TypeScript | SPA moderna, rápida de desarrollar, ideal para MVP |
| Estilos | Tailwind CSS | Utilidades CSS, diseño responsive sin overhead |
| Backend | Node.js 20 + Express.js | API REST ligera, mismo lenguaje en todo el stack |
| ORM | Prisma 5 | Migraciones automáticas, tipado fuerte, DX excelente |
| Base de datos | PostgreSQL 16 | Relacional, robusto, integridad referencial |
| Autenticación | JWT + bcrypt | Simple, sin dependencias externas, suficiente para MVP |
| Contenerización | Docker + Docker Compose | Entorno local reproducible con un único comando |
| Tests backend | Jest + Supertest | Tests unitarios e integración de la API |
| Email (mock) | Console logger | Simula envíos en local sin dependencias externas |
| Control versiones | Git + GitHub | Repositorio público como entregable del proyecto |

### 4.2 Justificación tecnológica

#### React + Vite

React es el framework frontend más adoptado del ecosistema JavaScript. Vite proporciona un servidor de desarrollo ultra-rápido con HMR. Juntos permiten construir una SPA funcional en el menor tiempo posible, con excelente DX para un proyecto de demostración.

#### Node.js + Express

Permite usar el mismo lenguaje (JavaScript/TypeScript) en todo el stack, reduciendo la curva de aprendizaje y el tiempo de desarrollo. Express es minimalista y no impone estructura, lo que facilita la organización modular por dominio.

#### Prisma ORM

Prisma genera automáticamente el esquema de base de datos a partir de un archivo de definición tipado, gestiona las migraciones y proporciona autocompletado en el IDE. Ideal para un proyecto donde la velocidad de desarrollo es crítica.

#### PostgreSQL

Base de datos relacional robusta que garantiza la integridad referencial necesaria para el modelo de reservas. Soporte completo para transacciones ACID, esencial para evitar condiciones de carrera en el flujo de reserva.

#### Docker Compose

Permite arrancar todo el entorno (frontend, backend, base de datos) con un único comando, sin necesidad de instalar nada en el sistema anfitrión. Garantiza reproducibilidad y facilita la demostración del proyecto.

#### Tailwind CSS

Framework de utilidades CSS que permite diseñar interfaces modernas directamente en el JSX, sin necesidad de escribir CSS personalizado. Acelera el desarrollo del frontend manteniendo un diseño coherente y responsive.

### 4.3 Entorno local con Docker

Todo el stack se orquesta mediante Docker Compose. El archivo `docker-compose.yml` define tres servicios: la base de datos PostgreSQL, el backend Node.js y el frontend React. Un único comando arranca el entorno completo:

```bash
docker compose up --build
```

El backend ejecuta automáticamente las migraciones de Prisma y el seed de datos iniciales al arrancar, por lo que el sistema queda listo para demostración sin configuración adicional.

---

## 5. Diseño del Frontend

### 5.1 Estructura de la aplicación React

```
src/
  components/         # Componentes reutilizables (Button, Card, Modal...)
  pages/              # Páginas por ruta (Home, Login, BookingFlow...)
  features/           # Módulos por dominio (professionals, appointments, admin...)
  services/           # Llamadas a la API REST (api.ts, auth.service.ts...)
  hooks/              # Custom hooks (useAuth, useAppointments...)
  context/            # AuthContext con estado de sesión global
  router/             # Definición de rutas y guards de acceso
  types/              # Tipos TypeScript compartidos
```

### 5.2 Componentes principales

| Módulo | Componentes / Páginas | Acceso |
|--------|----------------------|--------|
| Catálogo público | ProfessionalsList, ProfessionalDetail, TreatmentsList | Sin auth |
| Autenticación | LoginPage, RegisterPage, ForgotPassword | Sin auth |
| Área paciente | BookingFlow, MyAppointments, CancelAppointment | Paciente |
| Panel fisioterapeuta | MyAgenda, AvailabilitySettings, BlockSlots | Fisio |
| Panel administrador | GlobalCalendar, ManageProfessionals, ManageTreatments, CreateAppointment | Admin |

### 5.3 Gestión de rutas y autenticación

La navegación se gestiona mediante React Router v6. Las rutas protegidas verifican el token JWT almacenado en memoria y el rol del usuario antes de renderizar el componente. Si el token ha expirado o el rol no es el requerido, el usuario es redirigido al login.

| Ruta | Descripción | Auth |
|------|-------------|------|
| `/` y `/professionals` | Catálogo público de profesionales | Sin auth |
| `/treatments` | Catálogo público de tratamientos | Sin auth |
| `/login`, `/register` | Autenticación de pacientes | Sin auth |
| `/book` | Flujo de reserva paso a paso | Paciente |
| `/my-appointments` | Listado de citas del paciente | Paciente |
| `/physio/*` | Panel del fisioterapeuta | Fisioterapeuta |
| `/admin/*` | Panel de administración | Administrador |

---

## 6. Diseño del Backend

### 6.1 Estructura del proyecto Node.js

```
src/
  routes/             # Definición de endpoints REST por dominio
  controllers/        # Gestión de requests HTTP, validación de entrada
  services/           # Lógica de negocio por dominio (appointments, availability...)
  middleware/         # Auth JWT, verificación de roles, manejo de errores
  utils/              # Helpers (emailMock, tokenGenerator, dateUtils...)
  prisma/
    schema.prisma     # Definición del modelo de datos
    seed.ts           # Datos iniciales para demostración
    migrations/       # Migraciones automáticas generadas por Prisma
```

### 6.2 Lógica de negocio

La lógica de negocio se concentra en servicios independientes por dominio. Los controladores son ligeros: reciben la petición, validan la entrada y delegan en el servicio correspondiente.

#### AppointmentService

Crea, cancela y consulta citas. Implementa la lógica crítica: verifica disponibilidad de la franja, bloquea la reserva con una transacción Prisma para evitar doble booking, y delega el envío del email de confirmación al mock de email.

#### AvailabilityService

Calcula los slots disponibles para un profesional en una fecha concreta, cruzando su disponibilidad semanal con las citas ya reservadas y los bloqueos activos.

#### ProfessionalService

CRUD de profesionales. Gestiona la activación/desactivación lógica sin eliminar datos históricos. Solo accesible para el rol administrador.

#### TreatmentService

CRUD del catálogo de tratamientos. Controla la visibilidad pública según el estado activo.

#### AuthService

Registro y login de pacientes. Hash de contraseñas con bcrypt (salt rounds: 12). Emisión y verificación de tokens JWT firmados con secreto en variable de entorno.

#### EmailMockService

Simula el envío de emails (confirmación, cancelación, recordatorio) mediante logs estructurados en consola. Diseñado para ser reemplazado por Resend en producción.

### 6.3 Control de accesos y roles

El backend implementa control de acceso basado en roles mediante middleware de Express. Cada endpoint protegido pasa por dos middlewares en secuencia:

- `authenticateToken` — Verifica el JWT en el header `Authorization`. Rechaza peticiones sin token válido con `401`.
- `requireRole(...roles)` — Comprueba que el rol del usuario autenticado está en la lista de roles permitidos para ese endpoint. Rechaza con `403` si no tiene permiso.

| Rol | Descripción | Permisos principales |
|-----|-------------|---------------------|
| `patient` | Paciente registrado | Ver catálogo, reservar, ver/cancelar sus citas |
| `professional` | Fisioterapeuta de la clínica | Ver su agenda, gestionar disponibilidad y bloqueos |
| `admin` | Administrador de la clínica | Acceso total: profesionales, tratamientos, agenda global, citas manuales |

---

## 7. Diseño de la base de datos

### 7.1 Modelo de datos conceptual

| Entidad | Descripción |
|---------|-------------|
| `Patient` | Paciente registrado. Credenciales, datos de contacto y relación con sus citas. |
| `Professional` | Fisioterapeuta activo. Perfil público, especialidades, credenciales y estado activo/inactivo. |
| `Treatment` | Tratamiento del catálogo. Nombre, descripción, duración y estado activo. |
| `Availability` | Franjas horarias semanales de cada profesional. Define cuándo puede ser reservado. |
| `Block` | Bloqueos puntuales de agenda por ausencias o vacaciones de un profesional. |
| `Appointment` | Cita reservada. Relaciona paciente, profesional y tratamiento. Incluye estado y token de cancelación. |

### 7.2 Modelo lógico — Prisma Schema (extracto)

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
  id            String         @id @default(cuid())
  name          String
  email         String         @unique
  passwordHash  String
  specialty     String
  bio           String?
  photoUrl      String?
  isActive      Boolean        @default(true)
  appointments  Appointment[]
  availability  Availability[]
  blocks        Block[]
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
  dayOfWeek      Int          // 0=Lunes ... 6=Domingo
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

### 7.3 Consideraciones de integridad y consistencia

- **Integridad referencial:** Todas las relaciones entre tablas se implementan mediante claves foráneas gestionadas por Prisma.
- **Control de concurrencia:** La creación de citas se ejecuta dentro de una transacción Prisma con verificación atómica de disponibilidad.
- **Eliminación lógica:** Los profesionales y tratamientos se desactivan (`isActive = false`) sin eliminar los datos históricos.
- **Token de cancelación:** Cada cita genera un UUID único como token de cancelación, incluido en el email de confirmación.
- **Estados inmutables:** Las citas canceladas no pueden volver a confirmarse. El estado es un enum con valores controlados.
- **Seed inicial:** El repositorio incluye un script de seed con datos realistas para demostración.

---

## 8. Diseño de APIs REST

Todos los endpoints devuelven y consumen JSON. Los endpoints protegidos requieren el header `Authorization: Bearer <token>`.

### APIs públicas — Catálogo

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/professionals` | Lista de profesionales activos | No |
| `GET` | `/api/professionals/:id` | Perfil detallado de un profesional | No |
| `GET` | `/api/treatments` | Catálogo de tratamientos activos | No |
| `GET` | `/api/availability/:profId?date=YYYY-MM-DD` | Slots disponibles por profesional y fecha | No |

### APIs de autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Registro de nuevo paciente | No |
| `POST` | `/api/auth/login` | Login — devuelve JWT | No |

### APIs de paciente

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/appointments` | Citas del paciente autenticado | Paciente |
| `POST` | `/api/appointments` | Crear nueva reserva | Paciente |
| `DELETE` | `/api/appointments/:id` | Cancelar cita por ID (con sesión) | Paciente |
| `GET` | `/api/appointments/cancel/:token` | Cancelar cita por token (sin login) | No |

### APIs de fisioterapeuta

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/physio/agenda` | Agenda propia del fisioterapeuta | Fisio |
| `PUT` | `/api/physio/availability` | Actualizar disponibilidad semanal | Fisio |
| `POST` | `/api/physio/blocks` | Crear bloqueo de franja | Fisio |
| `DELETE` | `/api/physio/blocks/:id` | Eliminar bloqueo | Fisio |

### APIs de administrador

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/appointments` | Vista global de todas las citas | Admin |
| `POST` | `/api/admin/appointments` | Crear cita manual | Admin |
| `POST` | `/api/admin/professionals` | Crear nuevo profesional | Admin |
| `PUT` | `/api/admin/professionals/:id` | Editar perfil de profesional | Admin |
| `PATCH` | `/api/admin/professionals/:id/toggle` | Activar / desactivar profesional | Admin |
| `POST` | `/api/admin/treatments` | Crear nuevo tratamiento | Admin |
| `PUT` | `/api/admin/treatments/:id` | Editar tratamiento | Admin |
| `DELETE` | `/api/admin/treatments/:id` | Eliminar tratamiento | Admin |

---

## 9. Seguridad técnica

| Aspecto | Implementación |
|---------|---------------|
| Autenticación | JWT firmado con secreto en variable de entorno. Expiración de 7 días. El frontend no almacena información sensible en localStorage. |
| Hash de contraseñas | bcrypt con salt rounds de 12. Las contraseñas nunca se almacenan en texto plano ni se devuelven en ninguna respuesta de la API. |
| Autorización por roles | Middleware `authenticateToken` + `requireRole` en todos los endpoints protegidos. Control aplicado exclusivamente en el backend. |
| Token de cancelación | UUID único por cita incluido en el email de confirmación. Permite cancelar sin login pero sin exponer credenciales. |
| Variables de entorno | `JWT_SECRET`, `DATABASE_URL` y demás secretos gestionados mediante archivo `.env` (incluido en `.gitignore`). El repo incluye `.env.example`. |
| CORS | Configurado para aceptar peticiones únicamente desde el origen del frontend (`localhost:5173`) en entorno local. |

> ⚠️ Para un entorno de producción real con datos de pacientes se recomienda revisar obligaciones GDPR: política de privacidad, consentimiento explícito y proceso de eliminación de datos. Este MVP local queda exento de dichas obligaciones.

---

## 10. Estrategia de pruebas

La estrategia de pruebas prioriza la cobertura de los flujos de negocio críticos (reserva, cancelación, disponibilidad, control de roles) sobre la cobertura exhaustiva. **Objetivo: cobertura mínima del 70% en lógica de negocio del backend.**

| Tipo | Alcance | Cobertura objetivo |
|------|---------|-------------------|
| Unitarias (Jest) | Servicios de negocio: AppointmentService, AvailabilityService, AuthService. Casos: happy path, validaciones, errores esperados y casos borde por módulo. | > 70% en servicios |
| Integración (Supertest) | Todos los endpoints críticos con base de datos de test aislada. Verifica flujos completos: registro → login → reserva → cancelación. | Endpoints críticos |
| Manual / Demostración | Recorrido completo de los flujos principales en el navegador para evidenciar el funcionamiento del MVP. | Todos los flujos |

---

## 11. Estructura del repositorio

```
fisioweb-mvp/
  backend/                  # API REST Node.js + Express + Prisma
    src/
      routes/
      controllers/
      services/
      middleware/
    prisma/
      schema.prisma
      seed.ts
  frontend/                 # SPA React + Vite + TypeScript
    src/
      pages/
      features/
      components/
      services/
  tests/                    # Tests Jest + Supertest
  docs/
    pdf/
      01_Analisis_Funcional_y_Requisitos.pdf
      02_Historias_de_Usuario.pdf
      03_Propuesta_Tecnica.pdf
    screenshots/            # Capturas de la aplicación
  prompts/                  # Prompts utilizados con Claude y Claude Code
    generador_casos.txt
    claude_documentacion.md
    claude_code_desarrollo.md
  memory-bank/              # Decisiones técnicas y deuda técnica
    decisions.md
    technical-debt.md
  docker-compose.yml        # Orquestación del entorno local completo
  .env.example              # Variables de entorno necesarias
  README.md                 # Descripción, quickstart y evidencia del proceso
```

---

## 12. Conclusión

El diseño técnico presentado define una solución coherente, moderna y completamente ejecutable en local para la gestión de reservas de una clínica de fisioterapia. La arquitectura en tres capas desacopladas, el stack tecnológico seleccionado y la organización modular del código garantizan mantenibilidad, claridad y capacidad de evolución futura.

Desde el punto de vista del objetivo principal de este proyecto —demostrar capacidades de desarrollo asistido por IA en el marco del programa GenAI de NTT DATA— el diseño técnico evidencia la capacidad de producir entregables de calidad profesional en la fase de arquitectura del SDLC, utilizando Claude como herramienta de análisis y diseño, y Claude Code para la implementación del sistema.

### Próximos pasos

- Configurar el repositorio GitHub público con la estructura definida en la sección 11.
- Ejecutar `docker compose up` y verificar el arranque completo del entorno.
- Implementar el backend módulo a módulo con Claude Code, empezando por auth y el schema Prisma.
- Desarrollar el frontend pantalla a pantalla, comenzando por el catálogo público.
- Ejecutar la suite de tests y verificar la cobertura mínima establecida.
- Completar el README con quickstart, capturas y evidencia de prompts utilizados.
