import { useState, useEffect } from 'react'
import api from '../../services/api'
import { TimeSlot } from '../../types'

interface Props {
  treatmentId: string
  professionalId: string
  onSelect: (date: string, slot: TimeSlot) => void
  onBack: () => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function Step3DateTime({ treatmentId, professionalId, onSelect, onBack }: Props) {
  const [date, setDate] = useState(getTodayStr())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!date) return
    setLoading(true)
    setError(null)
    api
      .get<TimeSlot[]>(`/availability/${professionalId}`, { params: { date, treatmentId } })
      .then((res) => setSlots(res.data))
      .catch(() => setError('No se pudieron cargar los horarios'))
      .finally(() => setLoading(false))
  }, [date, treatmentId, professionalId])

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona fecha y hora</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input
          type="date"
          value={date}
          min={getTodayStr()}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <p className="text-gray-500 text-sm">Buscando horarios disponibles...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && slots.length === 0 && (
        <p className="text-gray-500 text-sm">No hay horarios disponibles para este día.</p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        {slots.map((slot) => (
          <button
            key={slot.startTime}
            onClick={() => onSelect(date, slot)}
            className="bg-white border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            {formatTime(slot.startTime)}
          </button>
        ))}
      </div>

      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
        Volver
      </button>
    </div>
  )
}
