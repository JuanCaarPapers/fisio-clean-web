import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { Treatment } from '../types'

interface FormData {
  name: string
  description: string
  durationMins: number
}

const EMPTY_FORM: FormData = { name: '', description: '', durationMins: 60 }

export default function AdminTreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Treatment | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  function loadAll() {
    setLoading(true)
    api
      .get<Treatment[]>('/treatments')
      .then((res) => setTreatments(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(t: Treatment) {
    setEditTarget(t)
    setForm({ name: t.name, description: t.description ?? '', durationMins: t.durationMins })
    setFormError(null)
    setShowModal(true)
  }

  async function handleSubmit() {
    setFormError(null)
    try {
      if (editTarget) {
        await api.put(`/admin/treatments/${editTarget.id}`, form)
      } else {
        await api.post('/admin/treatments', form)
      }
      setShowModal(false)
      loadAll()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setFormError(axiosErr.response?.data?.error ?? 'Error al guardar')
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('¿Desactivar este tratamiento?')) return
    try {
      await api.delete(`/admin/treatments/${id}`)
      loadAll()
    } catch {
      alert('Error al desactivar el tratamiento')
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de tratamientos</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nuevo tratamiento
        </button>
      </div>

      {loading && <p className="text-gray-500">Cargando...</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Nombre', 'Descripción', 'Duración', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {treatments.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{t.description}</td>
                <td className="px-4 py-3 text-blue-600">{t.durationMins} min</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(t)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeactivate(t.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Desactivar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-900 mb-4">
              {editTarget ? 'Editar tratamiento' : 'Nuevo tratamiento'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={form.durationMins}
                  onChange={(e) => setForm((f) => ({ ...f, durationMins: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm"
              >
                {editTarget ? 'Guardar cambios' : 'Crear tratamiento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
