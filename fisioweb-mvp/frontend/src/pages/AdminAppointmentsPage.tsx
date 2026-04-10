import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { Appointment, Professional, Treatment } from '../types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProf, setFilterProf] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ patientId: '', professionalId: '', treatmentId: '', startTime: '' })
  const [formError, setFormError] = useState<string | null>(null)

  function loadData() {
    setLoading(true)
    Promise.all([
      api.get<Appointment[]>('/admin/appointments'),
      api.get<Professional[]>('/professionals'),
      api.get<Treatment[]>('/treatments'),
    ])
      .then(([a, p, t]) => {
        setAppointments(a.data)
        setProfessionals(p.data)
        setTreatments(t.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const filtered = filterProf
    ? appointments.filter((a) => a.professionalId === filterProf)
    : appointments

  async function handleCreate() {
    setFormError(null)
    try {
      await api.post('/admin/appointments', form)
      setShowModal(false)
      setForm({ patientId: '', professionalId: '', treatmentId: '', startTime: '' })
      loadData()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setFormError(axiosErr.response?.data?.error ?? 'Error al crear la cita')
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agenda global</h1>
        <div className="flex gap-3">
          <Link to="/admin/professionals" className="text-sm text-gray-600 hover:text-blue-600">Profesionales</Link>
          <Link to="/admin/treatments" className="text-sm text-gray-600 hover:text-blue-600">Tratamientos</Link>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Nueva cita
          </button>
        </div>
      </div>

      <div className="mb-4">
        <select
          value={filterProf}
          onChange={(e) => setFilterProf(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los profesionales</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Cargando...</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Paciente', 'Profesional', 'Tratamiento', 'Inicio', 'Estado'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((appt) => (
              <tr key={appt.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{appt.patient?.name}</td>
                <td className="px-4 py-3 text-gray-700">{appt.professional?.name}</td>
                <td className="px-4 py-3 text-gray-700">{appt.treatment?.name}</td>
                <td className="px-4 py-3 text-gray-600">{formatDateTime(appt.startTime)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {appt.status === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-900 mb-4">Nueva cita manual</h2>
            <div className="space-y-3">
              {(['patientId', 'professionalId', 'treatmentId', 'startTime'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs text-gray-600 mb-1 capitalize">{field}</label>
                  {field === 'professionalId' ? (
                    <select
                      value={form[field]}
                      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="">Selecciona profesional</option>
                      {professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  ) : field === 'treatmentId' ? (
                    <select
                      value={form[field]}
                      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="">Selecciona tratamiento</option>
                      {treatments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field === 'startTime' ? 'datetime-local' : 'text'}
                      value={form[field]}
                      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                      placeholder={field === 'patientId' ? 'ID del paciente' : ''}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
            {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm">
                Cancelar
              </button>
              <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm">
                Crear cita
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
