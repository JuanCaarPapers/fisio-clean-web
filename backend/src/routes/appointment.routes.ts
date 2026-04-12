import { Router } from 'express'
import { AppointmentController } from '../controllers/appointment.controller'
import { authenticateToken, requireRole } from '../middleware/auth.middleware'

const router = Router()

// Cancelación por token — pública, sin auth
router.get('/cancel/:token', AppointmentController.cancelByToken)

// Rutas protegidas para pacientes
router.use(authenticateToken, requireRole('patient'))
router.get('/', AppointmentController.findMyAppointments)
router.post('/', AppointmentController.create)
router.delete('/:id', AppointmentController.cancel)

export default router
