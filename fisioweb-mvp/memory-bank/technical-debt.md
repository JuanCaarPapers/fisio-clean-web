# Deuda técnica

## ALTA

### Tests de integración requieren BD activa fuera de Docker

Los tests de integración usan `prisma.$disconnect()` en `afterAll` pero asumen que la BD de test ya existe y tiene el schema aplicado. No hay un script de setup automático para la BD de test.

**Solución:** Añadir un script `jest.globalSetup.ts` que ejecute `prisma migrate deploy` contra `TEST_DATABASE_URL` antes de correr los tests.

---

## MEDIA

### Panel admin no muestra profesionales inactivos

`AdminProfessionalsPage` usa `GET /professionals` que filtra `isActive: true`. Los profesionales desactivados no son visibles en el panel.

**Solución:** Añadir `GET /admin/professionals` que devuelva todos los profesionales (activos e inactivos).

---

### Sin paginación en endpoints de lista

Todos los endpoints `findAll` devuelven la lista completa sin paginación. En producción con muchas citas o profesionales esto sería un problema de rendimiento.

**Solución:** Añadir parámetros `page` y `limit` en los endpoints y en el frontend.

---

### PhysioAvailabilityPage usa endpoint de professionals para cargar disponibilidad actual

La página de disponibilidad del fisio hace `GET /professionals/:id` para leer la disponibilidad actual, en lugar de un endpoint dedicado `GET /physio/availability`.

**Solución:** Añadir `GET /physio/availability` que devuelva la disponibilidad del profesional autenticado.

---

## BAJA

### Sin validación de que endTime > startTime en bloques

`POST /physio/blocks` no valida que `endDatetime > startDatetime`.

**Solución:** Añadir validación en el controlador o en un middleware de validación.

---

### Sin refresh de JWT

El token tiene expiración de 7 días pero no hay mecanismo de refresh. Si expira, el usuario ve errores 403 hasta que cierra sesión manualmente.

**Solución:** Implementar refresh token o detectar 403/401 en el interceptor de axios y redirigir al login.
