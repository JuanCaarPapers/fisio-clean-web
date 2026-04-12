import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { Appointment } from '../types'

export default function CancelByTokenPage() {
  const { token } = useParams<{ token: string }>()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api
      .get<Appointment>(`/appointments/cancel/${token}`)
      .then((res) => setAppointment(res.data))
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setError(axiosErr.response?.data?.error ?? 'Token inválido o cita no encontrada')
      })
      .finally(() => setLoading(false))
  }, [token])

  return (
    <Layout>
      <div className="max-w-md mx-auto text-center">
        {loading && <p className="text-gray-500">Procesando cancelación...</p>}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <p className="text-red-700 font-medium mb-2">No se pudo cancelar la cita</p>
            <p className="text-red-600 text-sm">{error}</p>
            <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
              Volver al inicio
            </Link>
          </div>
        )}

        {appointment && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8">
            <p className="text-2xl mb-2">OK</p>
            <p className="text-green-800 font-semibold mb-4">Cita cancelada correctamente</p>
            <p className="text-green-700 text-sm mb-6">
              La cita del{' '}
              {new Date(appointment.startTime).toLocaleString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              ha sido cancelada.
            </p>
            <Link to="/" className="text-blue-600 hover:underline text-sm">
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}
