import { useTreatments } from '../../hooks/useTreatments'

export default function Step1Treatment({ onSelect }: { onSelect: (id: string) => void }) {
  const { treatments, loading, error } = useTreatments()

  if (loading) return <p className="text-gray-500">Cargando tratamientos...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona un tratamiento</h2>
      <div className="space-y-3">
        {treatments.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{t.name}</p>
                {t.description && <p className="text-sm text-gray-500 mt-0.5">{t.description}</p>}
              </div>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-4 shrink-0">
                {t.durationMins} min
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
