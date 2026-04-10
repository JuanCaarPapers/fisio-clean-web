import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function loadAppointments() {
    setLoading(true)
    api
      .get<Appointment[]>('/appointments')
      .then((res) => setAppointments(res.data))
      .catch(() => setError('No se pudieron cargar las citas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  async function handleCancel(id: string) {
    if (!confirm('¿Cancelar esta cita?')) return
    try {
      await api.delete(`/appointments/${id}`)
      loadAppointments()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      alert(axiosErr.response?.data?.error ?? 'Error al cancelar la cita')
    }
  }

  const now = new Date()

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mis citas</h1>
        <Link
          to="/book"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Nueva cita
        </Link>
      </div>

      {loading && <p className="text-gray-500">Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && appointments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No tienes citas todavía.</p>
          <Link to="/book" className="text-blue-600 hover:underline">
            Reservar una cita
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {appointments.map((appt) => {
          const isPast = new Date(appt.startTime) < now
          const isCancellable = appt.status === 'CONFIRMED' && !isPast

          return (
            <div
              key={appt.id}
              className={`bg-white border rounded-xl p-5 flex justify-between items-center ${
                appt.status === 'CANCELLED' ? 'opacity-60' : 'border-gray-200'
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{appt.treatment?.name}</p>
                <p className="text-sm text-gray-600">{appt.professional?.name}</p>
                <p className="text-sm text-gray-500 mt-1">{formatDateTime(appt.startTime)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    appt.status === 'CONFIRMED'
                      ? isPast ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {appt.status === 'CANCELLED' ? 'Cancelada' : isPast ? 'Completada' : 'Confirmada'}
                </span>
                {isCancellable && (
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
