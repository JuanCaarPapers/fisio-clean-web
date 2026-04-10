import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Professional, Treatment, TimeSlot } from '../../types'

interface Props {
  treatmentId: string
  professionalId: string
  slot: TimeSlot
  onConfirmed: () => void
  onBack: () => void
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Step4Confirm({ treatmentId, professionalId, slot, onConfirmed, onBack }: Props) {
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<Treatment[]>('/treatments').then((r) => r.data.find((t) => t.id === treatmentId) ?? null),
      api.get<Professional>(`/professionals/${professionalId}`).then((r) => r.data),
    ]).then(([t, p]) => {
      setTreatment(t)
      setProfessional(p)
    })
  }, [treatmentId, professionalId])

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      await api.post('/appointments', {
        professionalId,
        treatmentId,
        startTime: slot.startTime,
      })
      onConfirmed()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error ?? 'Error al confirmar la cita')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirmar reserva</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tratamiento</span>
          <span className="font-medium text-gray-900">{treatment?.name ?? '...'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Profesional</span>
          <span className="font-medium text-gray-900">{professional?.name ?? '...'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Inicio</span>
          <span className="font-medium text-gray-900">{formatDateTime(slot.startTime)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Fin</span>
          <span className="font-medium text-gray-900">{formatDateTime(slot.endTime)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 hover:bg-gray-50"
        >
          Volver
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Confirmando...' : 'Confirmar cita'}
        </button>
      </div>
    </div>
  )
}
