import { useReducer } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import Step1Treatment from './Step1Treatment'
import Step2Professional from './Step2Professional'
import Step3DateTime from './Step3DateTime'
import Step4Confirm from './Step4Confirm'

export interface BookingState {
  treatmentId: string | null
  professionalId: string | null
  date: string | null
  slot: { startTime: string; endTime: string } | null
}

type BookingAction =
  | { type: 'SET_TREATMENT'; payload: string }
  | { type: 'SET_PROFESSIONAL'; payload: string }
  | { type: 'SET_SLOT'; payload: { date: string; slot: { startTime: string; endTime: string } } }
  | { type: 'RESET' }

function reducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_TREATMENT':
      return { ...state, treatmentId: action.payload, professionalId: null, date: null, slot: null }
    case 'SET_PROFESSIONAL':
      return { ...state, professionalId: action.payload, date: null, slot: null }
    case 'SET_SLOT':
      return { ...state, date: action.payload.date, slot: action.payload.slot }
    case 'RESET':
      return { treatmentId: null, professionalId: null, date: null, slot: null }
    default:
      return state
  }
}

const STEPS = ['Tratamiento', 'Profesional', 'Fecha y hora', 'Confirmar']

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initialProfId = searchParams.get('professionalId')

  const [state, dispatch] = useReducer(reducer, {
    treatmentId: null,
    professionalId: initialProfId,
    date: null,
    slot: null,
  })

  const currentStep = !state.treatmentId ? 0 : !state.professionalId ? 1 : !state.slot ? 2 : 3

  function handleConfirmed() {
    navigate('/my-appointments')
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reservar cita</h1>

        {/* Indicador de pasos */}
        <div className="flex items-center mb-8">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < currentStep
                    ? 'bg-green-500 text-white'
                    : i === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm ${i === currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {step}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300 mx-3" />}
            </div>
          ))}
        </div>

        {currentStep === 0 && (
          <Step1Treatment onSelect={(id) => dispatch({ type: 'SET_TREATMENT', payload: id })} />
        )}
        {currentStep === 1 && (
          <Step2Professional
            onSelect={(id) => dispatch({ type: 'SET_PROFESSIONAL', payload: id })}
            onBack={() => dispatch({ type: 'RESET' })}
          />
        )}
        {currentStep === 2 && state.treatmentId && state.professionalId && (
          <Step3DateTime
            treatmentId={state.treatmentId}
            professionalId={state.professionalId}
            onSelect={(date, slot) => dispatch({ type: 'SET_SLOT', payload: { date, slot } })}
            onBack={() => dispatch({ type: 'SET_TREATMENT', payload: state.treatmentId! })}
          />
        )}
        {currentStep === 3 && state.treatmentId && state.professionalId && state.slot && (
          <Step4Confirm
            treatmentId={state.treatmentId}
            professionalId={state.professionalId}
            slot={state.slot}
            onConfirmed={handleConfirmed}
            onBack={() => dispatch({ type: 'SET_PROFESSIONAL', payload: state.professionalId! })}
          />
        )}
      </div>
    </Layout>
  )
}
