import bcrypt from 'bcryptjs'
import prisma from '../prisma'

const SAFE_FIELDS = {
  id: true,
  name: true,
  email: true,
  specialty: true,
  bio: true,
  photoUrl: true,
  isActive: true,
  createdAt: true,
  availability: true,
} as const

export class ProfessionalService {
  static async findAll() {
    return prisma.professional.findMany({
      where: { isActive: true },
      select: SAFE_FIELDS,
      orderBy: { name: 'asc' },
    })
  }

  static async findById(id: string) {
    const professional = await prisma.professional.findUnique({
      where: { id },
      select: SAFE_FIELDS,
    })
    if (!professional) {
      throw Object.assign(new Error('Profesional no encontrado'), { code: 'NOT_FOUND', status: 404 })
    }
    return professional
  }

  static async create(data: {
    name: string
    email: string
    password: string
    specialty: string
    bio?: string
    photoUrl?: string
  }) {
    const existing = await prisma.professional.findUnique({ where: { email: data.email } })
    if (existing) {
      throw Object.assign(new Error('El email ya está en uso'), { code: 'EMAIL_IN_USE', status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 12)
    const professional = await prisma.professional.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        specialty: data.specialty,
        bio: data.bio,
        photoUrl: data.photoUrl,
      },
      select: SAFE_FIELDS,
    })
    return professional
  }

  static async update(
    id: string,
    data: {
      name?: string
      email?: string
      specialty?: string
      bio?: string
      photoUrl?: string
    },
  ) {
    await this.findById(id)
    return prisma.professional.update({
      where: { id },
      data,
      select: SAFE_FIELDS,
    })
  }

  static async toggleActive(id: string) {
    const professional = await prisma.professional.findUnique({ where: { id } })
    if (!professional) {
      throw Object.assign(new Error('Profesional no encontrado'), { code: 'NOT_FOUND', status: 404 })
    }
    return prisma.professional.update({
      where: { id },
      data: { isActive: !professional.isActive },
      select: SAFE_FIELDS,
    })
  }
}
