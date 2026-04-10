import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios', code: 'MISSING_FIELDS' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres', code: 'WEAK_PASSWORD' })
      return
    }

    try {
      const result = await AuthService.register(name, email, password, phone)
      res.status(201).json(result)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son obligatorios', code: 'MISSING_FIELDS' })
      return
    }

    try {
      const result = await AuthService.login(email, password)
      res.json(result)
    } catch (err) {
      const error = err as { message: string; code?: string; status?: number }
      res.status(error.status ?? 500).json({ error: error.message, code: error.code ?? 'SERVER_ERROR' })
    }
  }
}
