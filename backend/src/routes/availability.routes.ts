import { Router, Request, Response } from 'express'
import { AvailabilityService } from '../services/availability.service'

const router = Router()

router.get('/:profId', async (req: Request, res: Response) => {
  const profId = req.params.profId as string
  const { date, treatmentId } = req.query

  if (!date || typeof date !== 'string') {
    res.status(400).json({ error: 'Parámetro date requerido (YYYY-MM-DD)', code: 'MISSING_DATE' })
    return
  }

  if (!treatmentId || typeof treatmentId !== 'string') {
    res.status(400).json({ error: 'Parámetro treatmentId requerido', code: 'MISSING_TREATMENT' })
    return
  }

  try {
    const slots = await AvailabilityService.getSlots(profId, date, treatmentId)
    res.json(slots)
  } catch (err) {
    const error = err as { message: string; code?: string; status?: number }
    res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
  }
})

export default router
