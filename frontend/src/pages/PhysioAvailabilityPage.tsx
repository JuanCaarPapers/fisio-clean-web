import { useState, useEffect, FormEvent } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { Availability } from '../types'

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

interface DayConfig {
  enabled: boolean
  startTime: string
  endTime: string
}

const DEFAULT_DAY: DayConfig = { enabled: false, startTime: '09:00', endTime: '18:00' }

export default function PhysioAvailabilityPage() {
  const [days, setDays] = useState<DayConfig[]>(DAY_NAMES.map(() => ({ ...DEFAULT_DAY })))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar disponibilidad actual del profesional autenticado
  useEffect(() => {
    api.get<Availability[]>('/physio/agenda').catch(() => null)
    // Obtenemos la disponibilidad del perfil del profesional a través de los profesionales públicos
    // No hay endpoint GET /physio/availability, pero el token tiene el id del profesional
    // Usamos GET /professionals/:id para obtener la disponibilidad actual
    const token = localStorage.getItem('token')
    if (!token) return
    const payload = JSON.parse(atob(token.split('.')[1]))
    api
      .get<{ availability: Availability[] }>(`/professionals/${payload.id}`)
      .then((res) => {
        const avail = res.data.availability ?? []
        const newDays = DAY_NAMES.map((_, i) => {
          const existing = avail.find((a) => a.dayOfWeek === i)
          if (existing) return { enabled: true, startTime: existing.startTime, endTime: existing.endTime }
          return { ...DEFAULT_DAY }
        })
        setDays(newDays)
      })
      .catch(() => null)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)

    const slots = days
      .map((d, i) => ({ ...d, dayOfWeek: i }))
      .filter((d) => d.enabled)
      .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }))

    try {
      await api.put('/physio/availability', { slots })
      setSaved(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error ?? 'Error al guardar la disponibilidad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurar disponibilidad</h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 mb-6">
          {DAY_NAMES.map((name, i) => (
            <div key={name} className="flex items-center gap-4 px-5 py-4">
              <input
                type="checkbox"
                checked={days[i].enabled}
                onChange={(e) =>
                  setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, enabled: e.target.checked } : d)))
                }
                className="h-4 w-4 text-blue-600"
              />
              <span className="w-24 text-sm font-medium text-gray-700">{name}</span>
              <input
                type="time"
                value={days[i].startTime}
                disabled={!days[i].enabled}
                onChange={(e) =>
                  setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, startTime: e.target.value } : d)))
                }
                className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-40"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="time"
                value={days[i].endTime}
                disabled={!days[i].enabled}
                onChange={(e) =>
                  setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, endTime: e.target.value } : d)))
                }
                className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-40"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {saved && <p className="text-green-600 text-sm mb-4">Disponibilidad guardada correctamente.</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar disponibilidad'}
        </button>
      </form>
    </Layout>
  )
}
