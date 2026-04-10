import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface JwtPayload {
  id: string
  email: string
  role: 'patient' | 'professional' | 'admin'
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Token requerido', code: 'MISSING_TOKEN' })
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).json({ error: 'Error de configuración del servidor', code: 'SERVER_ERROR' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado', code: 'INVALID_TOKEN' })
  }
}

export function requireRole(...roles: Array<'patient' | 'professional' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado', code: 'UNAUTHENTICATED' })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acceso denegado', code: 'FORBIDDEN' })
      return
    }
    next()
  }
}
