import { Link, useNavigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-blue-600">
            FisioWeb
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/treatments" className="text-gray-600 hover:text-blue-600">
              Tratamientos
            </Link>
            {!isAuthenticated && (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Registrarse
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'patient' && (
              <>
                <Link to="/book" className="text-gray-600 hover:text-blue-600">
                  Reservar
                </Link>
                <Link to="/my-appointments" className="text-gray-600 hover:text-blue-600">
                  Mis citas
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'professional' && (
              <>
                <Link to="/physio/agenda" className="text-gray-600 hover:text-blue-600">
                  Mi agenda
                </Link>
                <Link to="/physio/availability" className="text-gray-600 hover:text-blue-600">
                  Disponibilidad
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-600 hover:text-blue-600">
                  Agenda
                </Link>
                <Link to="/admin/professionals" className="text-gray-600 hover:text-blue-600">
                  Profesionales
                </Link>
                <Link to="/admin/treatments" className="text-gray-600 hover:text-blue-600">
                  Tratamientos
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 text-sm"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
