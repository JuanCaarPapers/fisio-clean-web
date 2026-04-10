import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma'
import { JwtPayload } from '../middleware/auth.middleware'

function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no configurado')
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<{ token: string }> {
    const existing = await prisma.patient.findUnique({ where: { email } })
    if (existing) {
      throw Object.assign(new Error('El email ya está registrado'), { code: 'EMAIL_IN_USE', status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const patient = await prisma.patient.create({
      data: { name, email, phone, passwordHash },
    })

    const token = signToken({ id: patient.id, email: patient.email, role: 'patient' })
    return { token }
  }

  static async login(email: string, password: string): Promise<{ token: string }> {
    // Comprobar si es admin
    const adminEmail = process.env.ADMIN_EMAIL
    const adminHashEnv = process.env.ADMIN_PASSWORD_HASH

    if (adminEmail && adminHashEnv && email === adminEmail) {
      const valid = await bcrypt.compare(password, adminHashEnv)
      if (!valid) {
        throw Object.assign(new Error('Credenciales incorrectas'), { code: 'INVALID_CREDENTIALS', status: 401 })
      }
      const token = signToken({ id: 'admin', email, role: 'admin' })
      return { token }
    }

    // Intentar como profesional
    const professional = await prisma.professional.findUnique({ where: { email } })
    if (professional) {
      const valid = await bcrypt.compare(password, professional.passwordHash)
      if (!valid) {
        throw Object.assign(new Error('Credenciales incorrectas'), { code: 'INVALID_CREDENTIALS', status: 401 })
      }
      const token = signToken({ id: professional.id, email: professional.email, role: 'professional' })
      return { token }
    }

    // Intentar como paciente
    const patient = await prisma.patient.findUnique({ where: { email } })
    if (patient) {
      const valid = await bcrypt.compare(password, patient.passwordHash)
      if (!valid) {
        throw Object.assign(new Error('Credenciales incorrectas'), { code: 'INVALID_CREDENTIALS', status: 401 })
      }
      const token = signToken({ id: patient.id, email: patient.email, role: 'patient' })
      return { token }
    }

    throw Object.assign(new Error('Credenciales incorrectas'), { code: 'INVALID_CREDENTIALS', status: 401 })
  }
}
