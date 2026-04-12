import prisma from '../prisma'

export class TreatmentService {
  static async findAll() {
    return prisma.treatment.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  }

  static async findById(id: string) {
    const treatment = await prisma.treatment.findUnique({ where: { id } })
    if (!treatment) {
      throw Object.assign(new Error('Tratamiento no encontrado'), { code: 'NOT_FOUND', status: 404 })
    }
    return treatment
  }

  static async create(data: { name: string; description?: string; durationMins: number }) {
    return prisma.treatment.create({ data })
  }

  static async update(id: string, data: { name?: string; description?: string; durationMins?: number }) {
    await this.findById(id)
    return prisma.treatment.update({ where: { id }, data })
  }

  static async deactivate(id: string) {
    await this.findById(id)
    return prisma.treatment.update({
      where: { id },
      data: { isActive: false },
    })
  }
}
