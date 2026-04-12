import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useProfessionals } from '../hooks/useProfessionals'

export default function HomePage() {
  const { professionals, loading, error } = useProfessionals()

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nuestros fisioterapeutas</h1>
        <p className="text-gray-600">Elige a tu profesional y reserva tu cita online.</p>
      </div>

      {loading && <p className="text-gray-500">Cargando profesionales...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((prof) => (
          <div key={prof.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold">
                {prof.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{prof.name}</h2>
                <p className="text-sm text-blue-600">{prof.specialty}</p>
              </div>
            </div>
            {prof.bio && (
              <p className="text-sm text-gray-600 line-clamp-3">{prof.bio}</p>
            )}
            <div className="flex gap-2 mt-auto">
              <Link
                to={`/professionals/${prof.id}`}
                className="flex-1 text-center text-sm text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50"
              >
                Ver perfil
              </Link>
              <Link
                to={`/book?professionalId=${prof.id}`}
                className="flex-1 text-center text-sm bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
              >
                Reservar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
