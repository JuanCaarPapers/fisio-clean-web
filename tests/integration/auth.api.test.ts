import request from 'supertest'
import app from '../../backend/src/app'
import prisma from '../../backend/src/prisma'

beforeAll(async () => {
  // Limpiar tabla de pacientes de test
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany({ where: { email: 'test.integration@test.com' } })
})

afterAll(async () => {
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany({ where: { email: 'test.integration@test.com' } })
  await prisma.$disconnect()
})

describe('POST /api/auth/register', () => {
  it('registra un nuevo paciente y devuelve 201 + token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Integration',
      email: 'test.integration@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
  })

  it('devuelve 409 si el email ya está registrado', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Integration',
      email: 'test.integration@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(409)
    expect(res.body.code).toBe('EMAIL_IN_USE')
  })

  it('devuelve 400 si faltan campos obligatorios', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('devuelve 200 + token para credenciales correctas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test.integration@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('devuelve 401 para contraseña incorrecta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test.integration@test.com',
      password: 'wrongpassword',
    })

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('INVALID_CREDENTIALS')
  })

  it('devuelve 401 para email inexistente', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'noexiste@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(401)
  })
})
