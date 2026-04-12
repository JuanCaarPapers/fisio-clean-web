import request from 'supertest'
import app from '../../backend/src/app'
import prisma from '../../backend/src/prisma'

let patientToken: string
let professionalId: string
let treatmentId: string
let appointmentId: string
let cancelToken: string

const PATIENT_EMAIL = 'appt.test@test.com'

beforeAll(async () => {
  // Limpiar datos previos
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany({ where: { email: PATIENT_EMAIL } })

  // Registrar paciente de test
  const res = await request(app).post('/api/auth/register').send({
    name: 'Appt Test Patient',
    email: PATIENT_EMAIL,
    password: 'password123',
  })
  patientToken = res.body.token

  // Obtener profesional y tratamiento del seed
  const prof = await prisma.professional.findFirst({ where: { isActive: true } })
  const treat = await prisma.treatment.findFirst({ where: { isActive: true } })

  if (!prof || !treat) throw new Error('Seed no ejecutado')
  professionalId = prof.id
  treatmentId = treat.id
})

afterAll(async () => {
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany({ where: { email: PATIENT_EMAIL } })
  await prisma.$disconnect()
})

describe('POST /api/appointments', () => {
  it('crea una cita y devuelve 201', async () => {
    // Buscar un slot libre: lunes próximo a las 09:00
    const nextMonday = new Date()
    const dayOfWeek = nextMonday.getDay()
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
    nextMonday.setHours(9, 0, 0, 0)

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        professionalId,
        treatmentId,
        startTime: nextMonday.toISOString(),
      })

    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    appointmentId = res.body.id
    cancelToken = res.body.cancelToken
  })

  it('devuelve 409 para doble booking en el mismo slot', async () => {
    const nextMonday = new Date()
    const dayOfWeek = nextMonday.getDay()
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
    nextMonday.setHours(9, 0, 0, 0)

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        professionalId,
        treatmentId,
        startTime: nextMonday.toISOString(),
      })

    expect(res.status).toBe(409)
    expect(res.body.code).toBe('SLOT_TAKEN')
  })

  it('devuelve 401 sin token de autenticación', async () => {
    const res = await request(app).post('/api/appointments').send({
      professionalId,
      treatmentId,
      startTime: new Date().toISOString(),
    })
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/appointments/:id', () => {
  it('cancela la cita y devuelve status CANCELLED', async () => {
    const res = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${patientToken}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELLED')
  })
})

describe('GET /api/appointments/cancel/:token', () => {
  it('cancela por token sin autenticación', async () => {
    // Crear nueva cita para cancelar por token
    const nextMonday = new Date()
    const dayOfWeek = nextMonday.getDay()
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
    nextMonday.setHours(11, 0, 0, 0)

    const createRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ professionalId, treatmentId, startTime: nextMonday.toISOString() })

    const tokenToCancel = createRes.body.cancelToken

    const res = await request(app).get(`/api/appointments/cancel/${tokenToCancel}`)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELLED')
  })
})
