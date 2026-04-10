# Decisiones técnicas

## [2026-04-09] Admin implementado como credenciales de entorno, no como modelo en BD

**Decisión:** El rol admin no tiene modelo propio en la base de datos. Se autentica comparando email y password hash almacenados en variables de entorno (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`).

**Alternativas consideradas:** Añadir campo `role` a `Professional` o crear modelo `Admin` separado.

**Razón:** Simplicidad. Para un MVP de demostración con un único admin, añadir un modelo en BD es sobreingeniería. Si se necesitara multi-admin en producción, se migraría a un modelo propio.

---

## [2026-04-09] Transacciones Prisma en AppointmentService.create

**Decisión:** La creación de citas se envuelve en `prisma.$transaction` para evitar doble booking bajo concurrencia.

**Alternativas consideradas:** Verificación optimista sin transacción.

**Razón:** El riesgo de condición de carrera es real en un sistema de reservas. La transacción garantiza atomicidad en la verificación de disponibilidad y la inserción.

---

## [2026-04-09] Email mockeado con console.log

**Decisión:** `EmailMockService` simula envíos con `console.log` estructurado. No hay integración con Resend, SendGrid ni colas.

**Razón:** Definido en los requisitos del proyecto. La arquitectura de servicio está preparada para sustituir la implementación sin tocar la lógica de negocio.

---

## [2026-04-09] dayOfWeek: 0=Lunes (no 0=Domingo como en JS)

**Decisión:** El campo `dayOfWeek` en el modelo `Availability` usa la convención 0=Lunes, 6=Domingo.

**Razón:** Más intuitivo para usuarios europeos. Se aplica la conversión en `AvailabilityService` al comparar con `Date.getDay()` de JavaScript (que usa 0=Domingo).

---

## [2026-04-09] Sin endpoint GET /admin/professionals (todos los estados)

**Decisión:** El panel admin de profesionales usa el endpoint público `GET /professionals` (solo activos). No hay endpoint admin para listar profesionales inactivos.

**Razón:** Suficiente para el MVP. El toggle activo/inactivo está implementado. Si se necesita ver inactivos, se añadiría `GET /admin/professionals?includeInactive=true`.
