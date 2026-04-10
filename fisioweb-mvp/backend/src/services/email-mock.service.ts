import { Appointment, Patient, Professional, Treatment } from '@prisma/client'

type AppointmentWithRelations = Appointment & {
  patient: Patient
  professional: Professional
  treatment: Treatment
}

export class EmailMockService {
  static sendConfirmation(appointment: AppointmentWithRelations): void {
    console.log('[EMAIL] Confirmación de cita enviada:', {
      to: appointment.patient.email,
      paciente: appointment.patient.name,
      profesional: appointment.professional.name,
      tratamiento: appointment.treatment.name,
      inicio: appointment.startTime,
      fin: appointment.endTime,
      cancelToken: appointment.cancelToken,
    })
  }

  static sendCancellation(appointment: AppointmentWithRelations): void {
    console.log('[EMAIL] Cita cancelada notificada:', {
      to: appointment.patient.email,
      paciente: appointment.patient.name,
      profesional: appointment.professional.name,
      tratamiento: appointment.treatment.name,
      inicio: appointment.startTime,
    })
  }

  static sendReminder(appointment: AppointmentWithRelations): void {
    console.log('[EMAIL] Recordatorio de cita enviado:', {
      to: appointment.patient.email,
      paciente: appointment.patient.name,
      profesional: appointment.professional.name,
      inicio: appointment.startTime,
    })
  }
}
