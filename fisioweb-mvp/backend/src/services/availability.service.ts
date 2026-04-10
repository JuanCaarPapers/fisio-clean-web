import prisma from '../prisma'

// Convierte "HH:MM" y una fecha base en un objeto Date
function timeStringToDate(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date(baseDate)
  date.setHours(hours, minutes, 0, 0)
  return date
}

// Comprueba si dos intervalos solapan (exclusivo en los extremos)
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart
}

export interface TimeSlot {
  startTime: string
  endTime: string
}

export class AvailabilityService {
  // Retorna slots libres para un profesional en una fecha dada para un tratamiento
  static async getSlots(professionalId: string, dateStr: string, treatmentId: string): Promise<TimeSlot[]> {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      throw Object.assign(new Error('Fecha inválida'), { code: 'INVALID_DATE', status: 400 })
    }

    // 0=Domingo en JS, pero en nuestro modelo 0=Lunes
    // Convertimos: JS domingo(0) → 6, lunes(1) → 0, ...
    const jsDow = date.getDay()
    const modelDow = jsDow === 0 ? 6 : jsDow - 1

    const availability = await prisma.availability.findFirst({
      where: { professionalId, dayOfWeek: modelDow },
    })

    if (!availability) return []

    const treatment = await prisma.treatment.findUnique({ where: { id: treatmentId } })
    if (!treatment) {
      throw Object.assign(new Error('Tratamiento no encontrado'), { code: 'NOT_FOUND', status: 404 })
    }

    // Inicio y fin del horario disponible ese día
    const dayStart = timeStringToDate(availability.startTime, date)
    const dayEnd = timeStringToDate(availability.endTime, date)

    // Citas confirmadas del profesional ese día
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        status: 'CONFIRMED',
        startTime: { gte: startOfDay, lte: endOfDay },
      },
    })

    // Bloqueos activos del profesional ese día
    const blocks = await prisma.block.findMany({
      where: {
        professionalId,
        startDatetime: { lte: endOfDay },
        endDatetime: { gte: startOfDay },
      },
    })

    // Generar slots en intervalos de durationMins
    const slots: TimeSlot[] = []
    const slotDuration = treatment.durationMins * 60 * 1000 // en ms
    let current = new Date(dayStart)

    while (current.getTime() + slotDuration <= dayEnd.getTime()) {
      const slotEnd = new Date(current.getTime() + slotDuration)

      const blockedByAppointment = existingAppointments.some((a) =>
        overlaps(current, slotEnd, a.startTime, a.endTime),
      )

      const blockedByBlock = blocks.some((b) =>
        overlaps(current, slotEnd, b.startDatetime, b.endDatetime),
      )

      if (!blockedByAppointment && !blockedByBlock) {
        slots.push({
          startTime: current.toISOString(),
          endTime: slotEnd.toISOString(),
        })
      }

      current = new Date(current.getTime() + slotDuration)
    }

    return slots
  }

  // Reemplaza la disponibilidad semanal de un profesional de forma atómica
  static async updateAvailability(
    professionalId: string,
    slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({ where: { professionalId } })
      const created = await tx.availability.createMany({
        data: slots.map((s) => ({ ...s, professionalId })),
      })
      return created
    })
  }
}
