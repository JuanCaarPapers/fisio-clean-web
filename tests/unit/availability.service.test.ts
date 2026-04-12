import { AvailabilityService } from '../../backend/src/services/availability.service'

jest.mock('../../backend/src/prisma', () => ({
  __esModule: true,
  default: {
    availability: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    treatment: {
      findUnique: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
    },
    block: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

import prisma from '../../backend/src/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

// Lunes 2026-04-13 (dayOfWeek JS=1 → modelo=0)
const MONDAY = '2026-04-13'

describe('AvailabilityService.getSlots', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('devuelve array vacío si el profesional no tiene disponibilidad ese día', async () => {
    mockPrisma.availability.findFirst = jest.fn().mockResolvedValue(null)
    mockPrisma.treatment.findUnique = jest.fn().mockResolvedValue({ id: 't1', durationMins: 60 })

    const slots = await AvailabilityService.getSlots('prof-1', MONDAY, 't1')
    expect(slots).toEqual([])
  })

  it('genera slots correctamente para un día sin citas ni bloqueos', async () => {
    mockPrisma.availability.findFirst = jest.fn().mockResolvedValue({
      startTime: '09:00',
      endTime: '11:00',
      dayOfWeek: 0,
    })
    mockPrisma.treatment.findUnique = jest.fn().mockResolvedValue({ id: 't1', durationMins: 60 })
    mockPrisma.appointment.findMany = jest.fn().mockResolvedValue([])
    mockPrisma.block.findMany = jest.fn().mockResolvedValue([])

    const slots = await AvailabilityService.getSlots('prof-1', MONDAY, 't1')
    expect(slots).toHaveLength(2) // 09:00-10:00 y 10:00-11:00
  })

  it('filtra slots que solapan con citas confirmadas', async () => {
    const date = new Date(MONDAY)
    const appointmentStart = new Date(date)
    appointmentStart.setHours(9, 0, 0, 0)
    const appointmentEnd = new Date(date)
    appointmentEnd.setHours(10, 0, 0, 0)

    mockPrisma.availability.findFirst = jest.fn().mockResolvedValue({
      startTime: '09:00',
      endTime: '11:00',
      dayOfWeek: 0,
    })
    mockPrisma.treatment.findUnique = jest.fn().mockResolvedValue({ id: 't1', durationMins: 60 })
    mockPrisma.appointment.findMany = jest.fn().mockResolvedValue([
      { startTime: appointmentStart, endTime: appointmentEnd, status: 'CONFIRMED' },
    ])
    mockPrisma.block.findMany = jest.fn().mockResolvedValue([])

    const slots = await AvailabilityService.getSlots('prof-1', MONDAY, 't1')
    expect(slots).toHaveLength(1) // Solo 10:00-11:00
    expect(new Date(slots[0].startTime).getHours()).toBe(10)
  })

  it('filtra slots que solapan con bloqueos', async () => {
    const date = new Date(MONDAY)
    const blockStart = new Date(date)
    blockStart.setHours(9, 0, 0, 0)
    const blockEnd = new Date(date)
    blockEnd.setHours(10, 0, 0, 0)

    mockPrisma.availability.findFirst = jest.fn().mockResolvedValue({
      startTime: '09:00',
      endTime: '11:00',
      dayOfWeek: 0,
    })
    mockPrisma.treatment.findUnique = jest.fn().mockResolvedValue({ id: 't1', durationMins: 60 })
    mockPrisma.appointment.findMany = jest.fn().mockResolvedValue([])
    mockPrisma.block.findMany = jest.fn().mockResolvedValue([
      { startDatetime: blockStart, endDatetime: blockEnd },
    ])

    const slots = await AvailabilityService.getSlots('prof-1', MONDAY, 't1')
    expect(slots).toHaveLength(1)
    expect(new Date(slots[0].startTime).getHours()).toBe(10)
  })

  it('lanza error si la fecha es inválida', async () => {
    await expect(AvailabilityService.getSlots('prof-1', 'fecha-invalida', 't1')).rejects.toMatchObject({
      code: 'INVALID_DATE',
    })
  })
})
