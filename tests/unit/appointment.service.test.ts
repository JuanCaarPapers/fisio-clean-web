import { AppointmentService } from '../../backend/src/services/appointment.service'

jest.mock('../../backend/src/services/email-mock.service', () => ({
  EmailMockService: {
    sendConfirmation: jest.fn(),
    sendCancellation: jest.fn(),
  },
}))

jest.mock('../../backend/src/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    appointment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

import prisma from '../../backend/src/prisma'
import { EmailMockService } from '../../backend/src/services/email-mock.service'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

// Lunes 2026-04-13 a las 10:00 UTC
const VALID_START = '2026-04-13T10:00:00.000Z'

// Stub que simula el contexto de la transacción con BD disponible
function setupTransactionMock({
  treatment = { id: 't1', durationMins: 60, isActive: true },
  professional = { id: 'prof-1', isActive: true },
  availability = { startTime: '09:00', endTime: '18:00', dayOfWeek: 0 },
  conflictingAppointment = null,
  conflictingBlock = null,
  createdAppointment = null,
}: {
  treatment?: object | null
  professional?: object | null
  availability?: object | null
  conflictingAppointment?: object | null
  conflictingBlock?: object | null
  createdAppointment?: object | null
} = {}) {
  mockPrisma.$transaction = jest.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      treatment: { findUnique: jest.fn().mockResolvedValue(treatment) },
      professional: { findUnique: jest.fn().mockResolvedValue(professional) },
      availability: { findFirst: jest.fn().mockResolvedValue(availability) },
      appointment: {
        findFirst: jest.fn().mockResolvedValue(conflictingAppointment),
        create: jest.fn().mockResolvedValue(
          createdAppointment ?? {
            id: 'app-1',
            patientId: 'patient-1',
            professionalId: 'prof-1',
            treatmentId: 't1',
            startTime: new Date(VALID_START),
            endTime: new Date(new Date(VALID_START).getTime() + 60 * 60 * 1000),
            status: 'CONFIRMED',
            cancelToken: 'token-1',
            patient: { id: 'patient-1', email: 'p@p.com', name: 'Paciente' },
            professional: { id: 'prof-1', name: 'Prof', email: 'pr@pr.com' },
            treatment: { name: 'Fisio', durationMins: 60 },
          },
        ),
      },
      block: { findFirst: jest.fn().mockResolvedValue(conflictingBlock) },
    }
    return fn(tx)
  })
}

describe('AppointmentService.create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('crea una cita válida y llama a EmailMockService.sendConfirmation', async () => {
    setupTransactionMock()

    const appointment = await AppointmentService.create('patient-1', 'prof-1', 't1', VALID_START)

    expect(appointment.id).toBe('app-1')
    expect(EmailMockService.sendConfirmation).toHaveBeenCalledTimes(1)
  })

  it('lanza error si hay doble booking', async () => {
    setupTransactionMock({
      conflictingAppointment: { id: 'existing-app' },
    })

    await expect(
      AppointmentService.create('patient-1', 'prof-1', 't1', VALID_START),
    ).rejects.toMatchObject({ code: 'SLOT_TAKEN' })
  })

  it('lanza error si hay un bloqueo activo', async () => {
    setupTransactionMock({
      conflictingBlock: { id: 'block-1' },
    })

    await expect(
      AppointmentService.create('patient-1', 'prof-1', 't1', VALID_START),
    ).rejects.toMatchObject({ code: 'BLOCKED' })
  })

  it('lanza error si el profesional no tiene disponibilidad ese día', async () => {
    setupTransactionMock({ availability: null })

    await expect(
      AppointmentService.create('patient-1', 'prof-1', 't1', VALID_START),
    ).rejects.toMatchObject({ code: 'NO_AVAILABILITY' })
  })

  it('lanza error si el tratamiento no está disponible', async () => {
    setupTransactionMock({ treatment: null })

    await expect(
      AppointmentService.create('patient-1', 'prof-1', 't1', VALID_START),
    ).rejects.toMatchObject({ code: 'TREATMENT_UNAVAILABLE' })
  })

  it('lanza error con fecha inválida', async () => {
    await expect(
      AppointmentService.create('patient-1', 'prof-1', 't1', 'no-es-fecha'),
    ).rejects.toMatchObject({ code: 'INVALID_DATE' })
  })
})

describe('AppointmentService.cancelById', () => {
  it('cancela la cita y llama a EmailMockService.sendCancellation', async () => {
    const mockAppointment = {
      id: 'app-1',
      patientId: 'patient-1',
      status: 'CONFIRMED',
      patient: { email: 'p@p.com', name: 'P' },
      professional: { name: 'Prof', email: 'pr@pr.com' },
      treatment: { name: 'Fisio' },
    }

    mockPrisma.appointment.findUnique = jest.fn().mockResolvedValue(mockAppointment)
    mockPrisma.appointment.update = jest.fn().mockResolvedValue({ ...mockAppointment, status: 'CANCELLED' })

    await AppointmentService.cancelById('app-1', 'patient-1')

    expect(mockPrisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'CANCELLED' } }),
    )
    expect(EmailMockService.sendCancellation).toHaveBeenCalledTimes(1)
  })

  it('lanza error si el paciente no es el propietario', async () => {
    mockPrisma.appointment.findUnique = jest.fn().mockResolvedValue({
      id: 'app-1',
      patientId: 'otro-patient',
      status: 'CONFIRMED',
    })

    await expect(AppointmentService.cancelById('app-1', 'patient-1')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it('lanza error si la cita ya está cancelada', async () => {
    mockPrisma.appointment.findUnique = jest.fn().mockResolvedValue({
      id: 'app-1',
      patientId: 'patient-1',
      status: 'CANCELLED',
    })

    await expect(AppointmentService.cancelById('app-1', 'patient-1')).rejects.toMatchObject({
      code: 'ALREADY_CANCELLED',
    })
  })
})
