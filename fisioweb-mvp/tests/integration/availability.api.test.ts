import request from 'supertest'
import app from '../../backend/src/app'
import prisma from '../../backend/src/prisma'

let professionalId: string
let treatmentId: string

beforeAll(async () => {
  const prof = await prisma.professional.findFirst({ where: { isActive: true } })
  const treat = await prisma.treatment.findFirst({ where: { isActive: true } })
  if (!prof || !treat) throw new Error('Seed no ejecutado')
  professionalId = prof.id
  treatmentId = treat.id
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('GET /api/availability/:profId', () => {
  it('devuelve slots para un lunes con disponibilidad configurada', async () => {
    // Encontrar el próximo lunes
    const nextMonday = new Date()
    const dayOfWeek = nextMonday.getDay()
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
    const dateStr = nextMonday.toISOString().split('T')[0]

    const res = await request(app)
      .get(`/api/availability/${professionalId}`)
      .query({ date: dateStr, treatmentId })

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('devuelve array vacío para un domingo (sin disponibilidad)', async () => {
    // Encontrar el próximo domingo
    const nextSunday = new Date()
    const dayOfWeek = nextSunday.getDay()
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 7
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday)
    const dateStr = nextSunday.toISOString().split('T')[0]

    const res = await request(app)
      .get(`/api/availability/${professionalId}`)
      .query({ date: dateStr, treatmentId })

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('devuelve 400 si falta el parámetro date', async () => {
    const res = await request(app)
      .get(`/api/availability/${professionalId}`)
      .query({ treatmentId })

    expect(res.status).toBe(400)
  })

  it('devuelve 400 si falta el parámetro treatmentId', async () => {
    const res = await request(app)
      .get(`/api/availability/${professionalId}`)
      .query({ date: '2026-04-14' })

    expect(res.status).toBe(400)
  })
})
