import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { Professional } from '../types'

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ProfessionalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    api
      .get<Professional>(`/professionals/${id}`)
      .then((res) => setProfessional(res.data))
      .catch(() => setError('Profesional no encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout><p className="text-gray-500">Cargando...</p></Layout>
  if (error || !professional) return <Layout><p className="text-red-500">{error}</p></Layout>

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-semibold">
              {professional.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{professional.name}</h1>
              <p className="text-blue-600 font-medium">{professional.specialty}</p>
            </div>
          </div>
          {professional.bio && (
            <p className="text-gray-700 leading-relaxed mb-6">{professional.bio}</p>
          )}
          {professional.availability && professional.availability.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Horario disponible</h3>
              <div className="space-y-1">
                {professional.availability
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((av) => (
                    <div key={av.id} className="flex justify-between text-sm text-gray-600">
                      <span>{DAY_NAMES[av.dayOfWeek]}</span>
                      <span>{av.startTime} – {av.endTime}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        <Link
          to={`/book?professionalId=${professional.id}`}
          className="block text-center bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700"
        >
          Reservar cita con {professional.name.split(' ')[0]}
        </Link>
      </div>
    </Layout>
  )
}
