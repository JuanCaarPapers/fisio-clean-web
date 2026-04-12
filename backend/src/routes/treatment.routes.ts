import { Router } from 'express'
import { TreatmentController } from '../controllers/treatment.controller'

const router = Router()

router.get('/', TreatmentController.findAll)

export default router
