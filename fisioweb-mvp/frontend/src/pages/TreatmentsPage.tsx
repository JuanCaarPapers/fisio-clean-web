import Layout from '../components/Layout'
import { useTreatments } from '../hooks/useTreatments'

export default function TreatmentsPage() {
  const { treatments, loading, error } = useTreatments()

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tratamientos</h1>
        <p className="text-gray-600">Conoce los servicios que ofrecemos.</p>
      </div>

      {loading && <p className="text-gray-500">Cargando tratamientos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {treatments.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-semibold text-gray-900">{t.name}</h2>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {t.durationMins} min
              </span>
            </div>
            {t.description && <p className="text-sm text-gray-600">{t.description}</p>}
          </div>
        ))}
      </div>
    </Layout>
  )
}
