import { Router, Request, Response } from 'express'
import { authenticateToken, requireRole } from '../middleware/auth.middleware'
import { AppointmentService } from '../services/appointment.service'
import { ProfessionalService } from '../services/professional.service'
import { TreatmentService } from '../services/treatment.service'
import { ProfessionalController } from '../controllers/professional.controller'
import { TreatmentController } from '../controllers/treatment.controller'

const router = Router()

router.use(authenticateToken, requireRole('admin'))

// Agenda global
router.get('/appointments', async (req: Request, res: Response) => {
  try {
    const appointments = await AppointmentService.findAll()
    res.json(appointments)
  } catch (err) {
    const error = err as { message: string; code?: string; status?: number }
    res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
  }
})

// Crear cita manual
router.post('/appointments', async (req: Request, res: Response) => {
  const { patientId, professionalId, treatmentId, startTime } = req.body
  if (!patientId || !professionalId || !treatmentId || !startTime) {
    res.status(400).json({ error: 'patientId, professionalId, treatmentId y startTime son obligatorios', code: 'MISSING_FIELDS' })
    return
  }
  try {
    const appointment = await AppointmentService.create(patientId, professionalId, treatmentId, startTime)
    res.status(201).json(appointment)
  } catch (err) {
    const error = err as { message: string; code?: string; status?: number }
    res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
  }
})

// Profesionales
router.post('/professionals', ProfessionalController.create)
router.put('/professionals/:id', ProfessionalController.update)
router.patch('/professionals/:id/toggle', ProfessionalController.toggleActive)

// Tratamientos
router.post('/treatments', TreatmentController.create)
router.put('/treatments/:id', TreatmentController.update)
router.delete('/treatments/:id', TreatmentController.deactivate)

export default router
