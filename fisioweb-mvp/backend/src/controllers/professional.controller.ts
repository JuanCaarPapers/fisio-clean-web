import { Request, Response } from 'express'
import { ProfessionalService } from '../services/professional.service'

export class ProfessionalController {
  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const professionals = await ProfessionalService.findAll()
      res.json(professionals)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const professional = await ProfessionalService.findById(req.params.id as string)
      res.json(professional)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const { name, email, password, specialty, bio, photoUrl } = req.body
    if (!name || !email || !password || !specialty) {
      res.status(400).json({ error: 'Nombre, email, contraseña y especialidad son obligatorios', code: 'MISSING_FIELDS' })
      return
    }
    try {
      const professional = await ProfessionalService.create({ name, email, password, specialty, bio, photoUrl })
      res.status(201).json(professional)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const professional = await ProfessionalService.update(req.params.id as string, req.body)
      res.json(professional)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async toggleActive(req: Request, res: Response): Promise<void> {
    try {
      const professional = await ProfessionalService.toggleActive(req.params.id as string)
      res.json(professional)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }
}
