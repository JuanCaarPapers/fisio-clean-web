import prisma from '../prisma'
import { EmailMockService } from './email-mock.service'

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart
}

export class AppointmentService {
  static async create(
    patientId: string,
    professionalId: string,
    treatmentId: string,
    startTimeStr: string,
  ) {
    const startTime = new Date(startTimeStr)
    if (isNaN(startTime.getTime())) {
      throw Object.assign(new Error('Fecha de inicio inválida'), { code: 'INVALID_DATE', status: 400 })
    }

    return prisma.$transaction(async (tx) => {
      const treatment = await tx.treatment.findUnique({ where: { id: treatmentId } })
      if (!treatment || !treatment.isActive) {
        throw Object.assign(new Error('Tratamiento no disponible'), { code: 'TREATMENT_UNAVAILABLE', status: 400 })
      }

      const professional = await tx.professional.findUnique({ where: { id: professionalId } })
      if (!professional || !professional.isActive) {
        throw Object.assign(new Error('Profesional no disponible'), { code: 'PROFESSIONAL_UNAVAILABLE', status: 400 })
      }

      const endTime = new Date(startTime.getTime() + treatment.durationMins * 60 * 1000)

      // Verificar que startTime cae dentro del horario disponible del profesional
      const jsDow = startTime.getDay()
      const modelDow = jsDow === 0 ? 6 : jsDow - 1

      const availability = await tx.availability.findFirst({
        where: { professionalId, dayOfWeek: modelDow },
      })

      if (!availability) {
        throw Object.assign(new Error('El profesional no tiene disponibilidad ese día'), {
          code: 'NO_AVAILABILITY',
          status: 409,
        })
      }

      const baseDate = new Date(startTime)
      const [sh, sm] = availability.startTime.split(':').map(Number)
      const [eh, em] = availability.endTime.split(':').map(Number)
      const availStart = new Date(baseDate.setHours(sh, sm, 0, 0))
      const availEnd = new Date(new Date(startTime).setHours(eh, em, 0, 0))

      if (startTime < availStart || endTime > availEnd) {
        throw Object.assign(new Error('La cita está fuera del horario disponible'), {
          code: 'OUTSIDE_AVAILABILITY',
          status: 409,
        })
      }

      // Verificar solapamiento con citas existentes
      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          professionalId,
          status: 'CONFIRMED',
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      })

      if (conflictingAppointment) {
        throw Object.assign(new Error('El horario seleccionado ya está ocupado'), {
          code: 'SLOT_TAKEN',
          status: 409,
        })
      }

      // Verificar solapamiento con bloqueos
      const conflictingBlock = await tx.block.findFirst({
        where: {
          professionalId,
          AND: [
            { startDatetime: { lt: endTime } },
            { endDatetime: { gt: startTime } },
          ],
        },
      })

      if (conflictingBlock) {
        throw Object.assign(new Error('El profesional tiene un bloqueo en ese horario'), {
          code: 'BLOCKED',
          status: 409,
        })
      }

      const appointment = await tx.appointment.create({
        data: { patientId, professionalId, treatmentId, startTime, endTime },
        include: { patient: true, professional: true, treatment: true },
      })

      EmailMockService.sendConfirmation(appointment)

      return appointment
    })
  }

  static async findByPatient(patientId: string) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: { professional: { select: { id: true, name: true, specialty: true } }, treatment: true },
      orderBy: { startTime: 'desc' },
    })
  }

  static async cancelById(id: string, patientId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, professional: true, treatment: true },
    })

    if (!appointment) {
      throw Object.assign(new Error('Cita no encontrada'), { code: 'NOT_FOUND', status: 404 })
    }

    if (appointment.patientId !== patientId) {
      throw Object.assign(new Error('No tienes permiso para cancelar esta cita'), { code: 'FORBIDDEN', status: 403 })
    }

    if (appointment.status === 'CANCELLED') {
      throw Object.assign(new Error('La cita ya está cancelada'), { code: 'ALREADY_CANCELLED', status: 400 })
    }

    const cancelled = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { patient: true, professional: true, treatment: true },
    })

    EmailMockService.sendCancellation(cancelled)
    return cancelled
  }

  static async cancelByToken(token: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: { patient: true, professional: true, treatment: true },
    })

    if (!appointment) {
      throw Object.assign(new Error('Token de cancelación inválido'), { code: 'INVALID_TOKEN', status: 404 })
    }

    if (appointment.status === 'CANCELLED') {
      throw Object.assign(new Error('La cita ya está cancelada'), { code: 'ALREADY_CANCELLED', status: 400 })
    }

    const cancelled = await prisma.appointment.update({
      where: { cancelToken: token },
      data: { status: 'CANCELLED' },
      include: { patient: true, professional: true, treatment: true },
    })

    EmailMockService.sendCancellation(cancelled)
    return cancelled
  }

  static async findAll() {
    return prisma.appointment.findMany({
      include: {
        patient: { select: { id: true, name: true, email: true } },
        professional: { select: { id: true, name: true, specialty: true } },
        treatment: true,
      },
      orderBy: { startTime: 'desc' },
    })
  }

  static async findByProfessional(professionalId: string) {
    return prisma.appointment.findMany({
      where: { professionalId },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
        treatment: true,
      },
      orderBy: { startTime: 'asc' },
    })
  }
}
