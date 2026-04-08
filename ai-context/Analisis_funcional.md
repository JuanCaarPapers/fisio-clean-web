# Análisis Funcional y de Requisitos

## FisioWeb MVP — Plataforma Online de Reservas para Clínica de Fisioterapia

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Autor:** Juan García  
**Organización:** NTT DATA · Departamento GenAI  

---

> ⚠️ **Nota importante:** Este proyecto es una demostración práctica de capacidades de desarrollo asistido por Inteligencia Artificial Generativa (Claude + Claude Code) en el marco del programa de microcredencial GenAI de NTT DATA. Todo el stack se ejecuta en local con Docker. No está previsto su despliegue en producción.

---

## Contenido

1. [Introducción](#1-introducción)
   - 1.1 Objetivo del documento
   - 1.2 Alcance
   - 1.3 Contexto del negocio
2. [Antecedentes y Problemática](#2-antecedentes-y-problemática)
   - 2.1 Descripción de la problemática
   - 2.2 Necesidad de negocio
3. [Actores del sistema](#3-actores-del-sistema)
4. [Requisitos Funcionales](#4-requisitos-funcionales)
5. [Requisitos No Funcionales](#5-requisitos-no-funcionales)
6. [Restricciones y dependencias](#6-restricciones-y-dependencias)
7. [Análisis de riesgos](#7-análisis-de-riesgos)
8. [Cronograma y Priorización](#8-cronograma-y-priorización)
9. [Conclusión](#9-conclusión)

---

## 1. Introducción

### 1.1 Objetivo del documento

El presente documento tiene como objetivo definir el análisis funcional y los requisitos del proyecto FisioWeb MVP, orientado a digitalizar la gestión de reservas y el catálogo de profesionales y tratamientos de una clínica de fisioterapia. Su finalidad es servir como base de referencia común para todos los interesados, asegurando una correcta comprensión de las necesidades del negocio y una implementación alineada con los objetivos estratégicos de la clínica.

Este proyecto forma parte de una demostración práctica de capacidades de desarrollo asistido por Inteligencia Artificial Generativa, desarrollado en el marco del programa de microcredencial GenAI de NTT DATA, con el objetivo de evidenciar el recorrido completo del ciclo de vida del software (SDLC) utilizando herramientas de IA como Claude y Claude Code.

### 1.2 Alcance

El alcance del proyecto comprende el análisis, diseño e implementación local de un MVP web para la gestión integral de la presencia online de la clínica:

- Catálogo público de fisioterapeutas, con perfil detallado por profesional.
- Catálogo de tratamientos disponibles con descripción y duración.
- Flujo completo de reserva online: selección de tratamiento, profesional y franja horaria.
- Autenticación de pacientes con registro, login y gestión de sesión.
- Gestión de agenda por parte de los fisioterapeutas: disponibilidad y bloqueos.
- Panel de administración: gestión de profesionales, tratamientos y agenda global.
- Notificaciones por email: confirmación, cancelación y recordatorio 24h (mockeadas en local).
- Control de acceso por roles: paciente, fisioterapeuta y administrador.

### 1.3 Contexto del negocio

La clínica de fisioterapia opera con 15 profesionales y atiende aproximadamente 25 pacientes diarios. La totalidad de las reservas se gestiona telefónicamente, lo que implica pérdida de reservas fuera del horario de atención y una carga administrativa innecesaria para el equipo. No existe presencia digital previa ni software de gestión; el negocio parte desde cero en términos de digitalización.

---

## 2. Antecedentes y Problemática

### 2.1 Descripción de la problemática

Actualmente, la clínica gestiona las reservas de forma exclusivamente telefónica y manual. No existe ningún sistema centralizado que permita a los pacientes consultar la disponibilidad de los profesionales ni reservar cita de forma autónoma. Esta situación genera las siguientes consecuencias negativas:

- Pérdida sistemática de reservas fuera del horario de atención telefónica.
- Saturación del equipo administrativo con llamadas repetitivas.
- Ausencia de presencia online, lo que limita la captación de nuevos pacientes.
- Imposibilidad de gestionar la disponibilidad de los fisioterapeutas de forma centralizada.
- Falta de confirmaciones y recordatorios automáticos, aumentando las ausencias.

### 2.2 Necesidad de negocio

La clínica requiere una solución que permita centralizar y digitalizar su proceso de reservas, de forma que los pacientes puedan interactuar con la clínica en cualquier momento del día y desde cualquier dispositivo. Para ello, el negocio necesita un sistema que haga posible:

- Publicar un catálogo actualizado de fisioterapeutas con su perfil, especialidades y disponibilidad.
- Mostrar los tratamientos disponibles con descripción detallada y duración estimada.
- Permitir a los pacientes reservar, consultar y cancelar citas de forma autónoma.
- Gestionar la agenda de cada fisioterapeuta, incluyendo disponibilidad semanal y bloqueos.
- Enviar confirmaciones y recordatorios automáticos por email.
- Proporcionar al administrador visibilidad completa de la agenda de la clínica.
- Controlar el acceso a las distintas funcionalidades según el rol del usuario.

---

## 3. Actores del sistema

| Actor | Descripción | Permisos principales | Frecuencia |
|-------|-------------|---------------------|------------|
| Paciente | Usuario final que busca y reserva citas | Ver profesionales y tratamientos, reservar, cancelar y consultar sus citas | Ocasional / recurrente |
| Fisioterapeuta | Profesional del centro sanitario | Ver su agenda, gestionar disponibilidad y bloquear franjas horarias | Diaria |
| Administrador | Personal de gestión de la clínica | Gestión completa: profesionales, tratamientos, citas y agenda global | Diaria |

---

## 4. Requisitos Funcionales

### 4.1 Módulo: Catálogo de profesionales y tratamientos

| ID | Descripción | Prioridad | Actores |
|----|-------------|-----------|---------|
| RF-001 | El sistema mostrará un listado de todos los fisioterapeutas activos con foto, nombre y especialidad. | Must | Paciente |
| RF-002 | El sistema permitirá ver el perfil detallado de cada fisioterapeuta: bio, especialidades, idiomas y disponibilidad general. | Must | Paciente |
| RF-003 | El sistema mostrará un catálogo de tratamientos disponibles con nombre, descripción y duración estimada. | Must | Paciente |
| RF-004 | El administrador podrá crear, editar y desactivar perfiles de fisioterapeutas. | Must | Administrador |
| RF-005 | El administrador podrá crear, editar y eliminar tratamientos del catálogo. | Must | Administrador |

### 4.2 Módulo: Reservas

| ID | Descripción | Prioridad | Actores |
|----|-------------|-----------|---------|
| RF-006 | El paciente podrá iniciar el flujo de reserva seleccionando tratamiento, profesional y franja horaria disponible. | Must | Paciente |
| RF-007 | El sistema mostrará únicamente franjas horarias disponibles según la agenda del fisioterapeuta seleccionado. | Must | Paciente / Fisio |
| RF-008 | El paciente recibirá una confirmación de reserva por email con los detalles de la cita. | Must | Paciente |
| RF-009 | El paciente podrá cancelar una cita desde el enlace en el email de confirmación. | Must | Paciente |
| RF-010 | El sistema enviará un recordatorio por email 24 horas antes de la cita. | Should | Paciente |
| RF-011 | El sistema impedirá la doble reserva de una franja ya ocupada. | Must | Sistema |

### 4.3 Módulo: Gestión de agenda

| ID | Descripción | Prioridad | Actores |
|----|-------------|-----------|---------|
| RF-012 | El fisioterapeuta podrá definir sus horarios de disponibilidad semanal. | Must | Fisioterapeuta |
| RF-013 | El fisioterapeuta podrá ver su agenda diaria y semanal con las citas reservadas. | Must | Fisioterapeuta |
| RF-014 | El fisioterapeuta podrá bloquear franjas horarias por vacaciones o ausencias. | Should | Fisioterapeuta |
| RF-015 | El administrador podrá ver la agenda completa de todos los profesionales. | Must | Administrador |
| RF-016 | El administrador podrá crear y cancelar citas manualmente en nombre de un paciente. | Must | Administrador |

### 4.4 Módulo: Autenticación

| ID | Descripción | Prioridad | Actores |
|----|-------------|-----------|---------|
| RF-017 | Los pacientes podrán registrarse con email y contraseña. | Must | Paciente |
| RF-018 | Los fisioterapeutas y administradores accederán con credenciales gestionadas por el administrador. | Must | Fisio / Admin |
| RF-019 | El sistema gestionará sesiones con tokens seguros (JWT) y permitirá cierre de sesión explícito. | Must | Todos |

---

## 5. Requisitos No Funcionales

| ID | Categoría | Descripción | Métrica |
|----|-----------|-------------|---------|
| RNF-001 | Rendimiento | Tiempo de carga de páginas principales | < 2s en conexión estándar |
| RNF-002 | Disponibilidad | El entorno local estará disponible durante la jornada de desarrollo y demostración | — |
| RNF-003 | Usabilidad | Diseño responsive compatible con dispositivos móviles y escritorio | Chrome, Safari, Firefox |
| RNF-004 | Seguridad | Contraseñas almacenadas con hash bcrypt. JWT firmado con secreto en variables de entorno | bcrypt salt 12 |
| RNF-005 | Escalabilidad | Arquitectura stateless que soporta crecimiento hasta 50 profesionales sin rediseño | — |
| RNF-006 | Mantenibilidad | Código documentado con cobertura de tests mínima en lógica de negocio | > 70% |

---

## 6. Restricciones y dependencias

| Restricción | Descripción |
|-------------|-------------|
| Sin pagos online en MVP | El cobro se realiza exclusivamente en clínica. Los pagos online quedan fuera del alcance de esta versión. |
| Sin integración con sistemas externos | No hay ERP, CRM ni software previo que conectar. El sistema parte de cero. |
| Email mockeado en local | Las notificaciones se simulan mediante logs en consola durante el entorno de desarrollo local. |
| MVP local — sin despliegue | Este proyecto es una prueba de capacidades con Claude Code. No se desplegará en producción. El entorno es 100% local con Docker. |
| Datos de salud mínimos | El MVP gestiona únicamente nombre, email, teléfono y datos de cita. No se almacenan historiales clínicos. |

---

## 7. Análisis de riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R-001 | Doble booking por condición de carrera en la reserva | Media | Alto | Transacciones de BD con bloqueo optimista al crear citas |
| R-002 | Emails de confirmación no funcionales en local | Alta | Bajo | Mock del servicio de email con logs en consola para el MVP local |
| R-003 | Fisioterapeutas sin disponibilidad configurada bloquean el sistema de reservas | Media | Medio | Seed de datos inicial con disponibilidades de ejemplo. El admin puede gestionarlas. |
| R-004 | Scope creep durante el desarrollo con Claude Code | Media | Medio | Backlog priorizado y congelado para MVP. Nuevas funcionalidades van a fase 2. |
| R-005 | Complejidad del scheduler de recordatorios en entorno local | Alta | Bajo | Los recordatorios se simulan en el MVP. BullMQ solo se integraría en producción. |

---

## 8. Cronograma y Priorización

### 8.1 Priorización de iniciativas

| Iniciativa | Descripción | Prioridad |
|------------|-------------|-----------|
| Catálogo de profesionales | Listado y perfiles públicos de fisioterapeutas | Alta |
| Catálogo de tratamientos | Listado público de tratamientos con descripción | Alta |
| Autenticación de pacientes | Registro, login y gestión de sesión con JWT | Alta |
| Flujo de reservas | Selección de tratamiento, profesional y franja horaria | Alta |
| Cancelación de citas | Cancelación desde área privada o enlace de email | Alta |
| Agenda de fisioterapeuta | Configuración de disponibilidad y bloqueos | Alta |
| Panel de administración | Vista global, CRUD de profesionales y tratamientos | Alta |
| Notificaciones por email | Confirmación, cancelación y recordatorio 24h (mock) | Media |
| Histórico de citas del paciente | Vista de citas pasadas y futuras | Media |

### 8.2 Fases de desarrollo (entorno local)

| Fase | Descripción | Duración estimada |
|------|-------------|-------------------|
| Fase 0 — Setup | Repositorio, Docker, BD, estructura de carpetas | 1-2 días |
| Fase 1 — Catálogo y auth | Profesionales, tratamientos, registro y login | 3-4 días |
| Fase 2 — Reservas | Flujo completo: reserva, emails mock, cancelación | 4-5 días |
| Fase 3 — Agenda fisio | Panel: disponibilidad, agenda, bloqueos | 2-3 días |
| Fase 4 — Panel admin | Vista global, CRUD de profesionales y tratamientos | 2-3 días |
| Fase 5 — Tests y docs | Jest, Supertest, README, documentación del repo | 2 días |

---

## 9. Conclusión

El análisis funcional y de requisitos realizado para el proyecto FisioWeb MVP pone de manifiesto la viabilidad de digitalizar el proceso de reservas de una clínica de fisioterapia mediante un stack tecnológico moderno, ligero y completamente ejecutable en local. La solución definida cubre los flujos críticos del negocio y deja una base sólida sobre la que iterar.

Desde el punto de vista del objetivo principal de este proyecto —demostrar capacidades de desarrollo asistido por IA en el marco del programa GenAI de NTT DATA— el documento evidencia la capacidad de recorrer de forma rigurosa la fase de análisis del SDLC, produciendo entregables de calidad profesional con el apoyo de Claude como herramienta de IA generativa.

### Próximos pasos

- Validar este documento como base para la generación del backlog de historias de usuario.
- Iniciar la fase de diseño técnico con la definición del schema de base de datos y los endpoints de la API.
- Configurar el repositorio GitHub público con la estructura de carpetas definida en el plan.
- Arrancar la implementación con Claude Code siguiendo el orden de fases establecido.
- Completar la documentación del repo (README, prompts utilizados, memory-bank) como evidencia del proceso.
