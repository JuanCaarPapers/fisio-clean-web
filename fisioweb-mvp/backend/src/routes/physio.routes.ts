import { Router, Request, Response } from 'express'
import { authenticateToken, requireRole } from '../middleware/auth.middleware'
import { AppointmentService } from '../services/appointment.service'
import { AvailabilityService } from '../services/availability.service'
import prisma from '../prisma'

const router = Router()

router.use(authenticateToken, requireRole('professional'))

// Mi agenda
router.get('/agenda', async (req: Request, res: Response) => {
  try {
    const appointments = await AppointmentService.findByProfessional(req.user!.id)
    res.json(appointments)
  } catch (err) {
    const error = err as { message: string; code?: string; status?: number }
    res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
  }
})

// Actualizar disponibilidad semanal
router.put('/availability', async (req: Request, res: Response) => {
  const { slots } = req.body
  if (!Array.isArray(slots)) {
    res.status(400).json({ error: 'slots debe ser un array', code: 'MISSING_FIELDS' })
    return
  }
  try {
    const result = await AvailabilityService.updateAvailability(req.user!.id, slots)
    res.json(result)
  } catch (err) {
    const error = err as { message: string; code?: string; status?: number }
    res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
  }
})

// Crear bloqueo
router.post('/blocks', async (req: Request, res: Response) => {
  const { startDatetime, endDatetime, reason } = req.body
  if (!startDatetime || !endDatetime) {
    res.status(400).json({ error: 'startDatetime y endDatetime son obligatorios', code: 'MISSING_FIELDS' })
    return
  }
  try {
    const block = await prisma.block.create({
      data: {
        professionalId: req.user!.id,
        startDatetime: new Date(startDatetime),
        endDatetime: new Date(endDatetime),
        reason,
      },
    })
    res.status(201).json(block)
  } catch (err) {
    const error = err as { message: string; code?: string; status?: number }
    res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
  }
})

// Eliminar bloqueo
router.delete('/blocks/:id', async (req: Request, res: Response) => {
  try {
    const block = await prisma.block.findUnique({ where: { id: req.params.id as string } })
    if (!block) {
      res.status(404).json({ error: 'Bloqueo no encontrado', code: 'NOT_FOUND' })
      return
    }
    if (block.professionalId !== req.user!.id) {
      res.status(403).json({ error: 'Acceso denegado', code: 'FORBIDDEN' })
      return
    }
    await prisma.block.delete({ where: { id: req.params.id as string } })
    res.status(204).send()
  } catch (err) {
    const error = err as { message: string; code?: string; status?: number }
    res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
  }
})

export default router
