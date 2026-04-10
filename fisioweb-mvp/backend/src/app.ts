import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import professionalRoutes from './routes/professional.routes'
import treatmentRoutes from './routes/treatment.routes'
import availabilityRoutes from './routes/availability.routes'
import appointmentRoutes from './routes/appointment.routes'
import physioRoutes from './routes/physio.routes'
import adminRoutes from './routes/admin.routes'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/professionals', professionalRoutes)
app.use('/api/treatments', treatmentRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/physio', physioRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

// Handler de errores global
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor', code: 'SERVER_ERROR' })
})

export default app
