import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { Appointment } from '../types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupByDay(appointments: Appointment[]): Record<string, Appointment[]> {
  return appointments.reduce<Record<string, Appointment[]>>((acc, appt) => {
    const day = new Date(appt.startTime).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!acc[day]) acc[day] = []
    acc[day].push(appt)
    return acc
  }, {})
}

export default function PhysioAgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<Appointment[]>('/physio/agenda')
      .then((res) => setAppointments(res.data.filter((a) => a.status === 'CONFIRMED')))
      .catch(() => setError('No se pudo cargar la agenda'))
      .finally(() => setLoading(false))
  }, [])

  const grouped = groupByDay(appointments)

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi agenda</h1>

      {loading && <p className="text-gray-500">Cargando agenda...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && appointments.length === 0 && (
        <p className="text-gray-500">No tienes citas próximas.</p>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([day, appts]) => (
          <div key={day}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3 capitalize">{day}</h2>
            <div className="space-y-2">
              {appts.map((appt) => (
                <div key={appt.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {appt.patient?.name ?? 'Paciente'}
                    </p>
                    <p className="text-sm text-blue-600">{appt.treatment?.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(appt.startTime)}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Confirmada
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
