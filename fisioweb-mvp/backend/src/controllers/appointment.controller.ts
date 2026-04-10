import { Request, Response } from 'express'
import { AppointmentService } from '../services/appointment.service'

export class AppointmentController {
  static async findMyAppointments(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await AppointmentService.findByPatient(req.user!.id)
      res.json(appointments)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const { professionalId, treatmentId, startTime } = req.body
    if (!professionalId || !treatmentId || !startTime) {
      res.status(400).json({ error: 'professionalId, treatmentId y startTime son obligatorios', code: 'MISSING_FIELDS' })
      return
    }
    try {
      const appointment = await AppointmentService.create(req.user!.id, professionalId, treatmentId, startTime)
      res.status(201).json(appointment)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await AppointmentService.cancelById(req.params.id as string, req.user!.id)
      res.json(appointment)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async cancelByToken(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await AppointmentService.cancelByToken(req.params.token as string)
      res.json(appointment)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }
}
