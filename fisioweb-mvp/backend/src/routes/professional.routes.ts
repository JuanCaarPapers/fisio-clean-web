import { Router } from 'express'
import { ProfessionalController } from '../controllers/professional.controller'

const router = Router()

router.get('/', ProfessionalController.findAll)
router.get('/:id', ProfessionalController.findById)

export default router
