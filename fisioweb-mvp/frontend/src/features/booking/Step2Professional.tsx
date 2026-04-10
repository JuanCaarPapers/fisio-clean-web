import { useProfessionals } from '../../hooks/useProfessionals'

interface Props {
  onSelect: (id: string) => void
  onBack: () => void
}

export default function Step2Professional({ onSelect, onBack }: Props) {
  const { professionals, loading, error } = useProfessionals()

  if (loading) return <p className="text-gray-500">Cargando profesionales...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona un profesional</h2>
      <div className="space-y-3 mb-4">
        {professionals.map((prof) => (
          <button
            key={prof.id}
            onClick={() => onSelect(prof.id)}
            className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
                {prof.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{prof.name}</p>
                <p className="text-sm text-blue-600">{prof.specialty}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
        Volver
      </button>
    </div>
  )
}
