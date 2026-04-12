import { Request, Response } from 'express'
import { TreatmentService } from '../services/treatment.service'

export class TreatmentController {
  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const treatments = await TreatmentService.findAll()
      res.json(treatments)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const { name, description, durationMins } = req.body
    if (!name || !durationMins) {
      res.status(400).json({ error: 'Nombre y duración son obligatorios', code: 'MISSING_FIELDS' })
      return
    }
    try {
      const treatment = await TreatmentService.create({ name, description, durationMins: Number(durationMins) })
      res.status(201).json(treatment)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const treatment = await TreatmentService.update(req.params.id as string, req.body)
      res.json(treatment)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const treatment = await TreatmentService.deactivate(req.params.id as string)
      res.json(treatment)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }
}
