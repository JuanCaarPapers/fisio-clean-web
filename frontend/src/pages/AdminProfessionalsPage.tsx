import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { Professional } from '../types'

interface FormData {
  name: string
  email: string
  password: string
  specialty: string
  bio: string
}

const EMPTY_FORM: FormData = { name: '', email: '', password: '', specialty: '', bio: '' }

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Professional | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  function loadAll() {
    setLoading(true)
    // Admin usa el endpoint público (solo activos) + toggle cambia estado
    // Para ver todos (activos + inactivos) necesitaríamos un endpoint admin específico
    // Para el MVP usamos el catálogo público
    api
      .get<Professional[]>('/professionals')
      .then((res) => setProfessionals(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(prof: Professional) {
    setEditTarget(prof)
    setForm({ name: prof.name, email: prof.email, password: '', specialty: prof.specialty, bio: prof.bio ?? '' })
    setFormError(null)
    setShowModal(true)
  }

  async function handleSubmit() {
    setFormError(null)
    try {
      if (editTarget) {
        const data: Partial<FormData> = { name: form.name, email: form.email, specialty: form.specialty, bio: form.bio }
        await api.put(`/admin/professionals/${editTarget.id}`, data)
      } else {
        await api.post('/admin/professionals', form)
      }
      setShowModal(false)
      loadAll()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setFormError(axiosErr.response?.data?.error ?? 'Error al guardar')
    }
  }

  async function handleToggle(id: string) {
    try {
      await api.patch(`/admin/professionals/${id}/toggle`)
      loadAll()
    } catch {
      alert('Error al cambiar el estado')
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de profesionales</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nuevo profesional
        </button>
      </div>

      {loading && <p className="text-gray-500">Cargando...</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Nombre', 'Especialidad', 'Email', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {professionals.map((prof) => (
              <tr key={prof.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{prof.name}</td>
                <td className="px-4 py-3 text-gray-700">{prof.specialty}</td>
                <td className="px-4 py-3 text-gray-600">{prof.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    prof.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {prof.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(prof)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggle(prof.id)}
                      className="text-gray-500 hover:underline text-xs"
                    >
                      {prof.isActive ? 'Desactivar' : 'Activar'}
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
              {editTarget ? 'Editar profesional' : 'Nuevo profesional'}
            </h2>
            <div className="space-y-3">
              {(['name', 'email', 'password', 'specialty', 'bio'] as const).map((field) => {
                if (field === 'password' && editTarget) return null
                return (
                  <div key={field}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">
                      {field === 'name' ? 'Nombre' : field === 'bio' ? 'Biografía (opcional)' : field}
                    </label>
                    {field === 'bio' ? (
                      <textarea
                        value={form[field]}
                        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    ) : (
                      <input
                        type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                        value={form[field]}
                        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    )}
                  </div>
                )
              })}
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
                {editTarget ? 'Guardar cambios' : 'Crear profesional'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
