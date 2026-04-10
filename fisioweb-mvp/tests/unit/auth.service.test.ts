import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthService } from '../../backend/src/services/auth.service'

jest.mock('../../backend/src/prisma', () => ({
  __esModule: true,
  default: {
    patient: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    professional: {
      findUnique: jest.fn(),
    },
  },
}))

import prisma from '../../backend/src/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'test_secret'
    process.env.ADMIN_EMAIL = 'admin@fisioweb.com'
  })

  describe('register', () => {
    it('crea un paciente y devuelve un JWT válido', async () => {
      mockPrisma.patient.findUnique = jest.fn().mockResolvedValue(null)
      mockPrisma.patient.create = jest.fn().mockResolvedValue({
        id: 'patient-1',
        email: 'test@test.com',
        name: 'Test',
      })

      const result = await AuthService.register('Test', 'test@test.com', 'password123')
      expect(result.token).toBeDefined()

      const decoded = jwt.verify(result.token, 'test_secret') as { role: string }
      expect(decoded.role).toBe('patient')
    })

    it('lanza error si el email ya está registrado', async () => {
      mockPrisma.patient.findUnique = jest.fn().mockResolvedValue({ id: 'existing' })

      await expect(AuthService.register('Test', 'test@test.com', 'password123')).rejects.toMatchObject({
        code: 'EMAIL_IN_USE',
      })
    })
  })

  describe('login', () => {
    it('devuelve JWT con role patient para credenciales correctas', async () => {
      const hash = await bcrypt.hash('password123', 12)
      mockPrisma.professional.findUnique = jest.fn().mockResolvedValue(null)
      mockPrisma.patient.findUnique = jest.fn().mockResolvedValue({
        id: 'patient-1',
        email: 'test@test.com',
        passwordHash: hash,
      })

      const result = await AuthService.login('test@test.com', 'password123')
      const decoded = jwt.verify(result.token, 'test_secret') as { role: string; id: string }
      expect(decoded.role).toBe('patient')
      expect(decoded.id).toBe('patient-1')
    })

    it('lanza error con credenciales incorrectas', async () => {
      mockPrisma.professional.findUnique = jest.fn().mockResolvedValue(null)
      mockPrisma.patient.findUnique = jest.fn().mockResolvedValue(null)

      await expect(AuthService.login('noexiste@test.com', 'wrong')).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
      })
    })

    it('lanza error si el password es incorrecto para un paciente existente', async () => {
      const hash = await bcrypt.hash('correctpassword', 12)
      mockPrisma.professional.findUnique = jest.fn().mockResolvedValue(null)
      mockPrisma.patient.findUnique = jest.fn().mockResolvedValue({
        id: 'patient-1',
        email: 'test@test.com',
        passwordHash: hash,
      })

      await expect(AuthService.login('test@test.com', 'wrongpassword')).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
      })
    })

    it('devuelve JWT con role professional para un profesional', async () => {
      const hash = await bcrypt.hash('prof123', 12)
      mockPrisma.professional.findUnique = jest.fn().mockResolvedValue({
        id: 'prof-1',
        email: 'prof@test.com',
        passwordHash: hash,
      })

      const result = await AuthService.login('prof@test.com', 'prof123')
      const decoded = jwt.verify(result.token, 'test_secret') as { role: string }
      expect(decoded.role).toBe('professional')
    })
  })
})
