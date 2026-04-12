export interface Professional {
  id: string
  name: string
  email: string
  specialty: string
  bio?: string
  photoUrl?: string
  isActive: boolean
  availability?: Availability[]
}

export interface Treatment {
  id: string
  name: string
  description?: string
  durationMins: number
  isActive: boolean
}

export interface Availability {
  id: string
  professionalId: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
}

export interface Appointment {
  id: string
  patientId: string
  professionalId: string
  treatmentId: string
  startTime: string
  endTime: string
  status: 'CONFIRMED' | 'CANCELLED'
  cancelToken: string
  createdAt: string
  professional?: Pick<Professional, 'id' | 'name' | 'specialty'>
  treatment?: Treatment
  patient?: { id: string; name: string; email: string }
}

export type UserRole = 'patient' | 'professional' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}
