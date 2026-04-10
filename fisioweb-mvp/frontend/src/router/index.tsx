import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ReactNode } from 'react'
import { UserRole } from '../types'

import HomePage from '../pages/HomePage'
import ProfessionalDetailPage from '../pages/ProfessionalDetailPage'
import TreatmentsPage from '../pages/TreatmentsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import BookingPage from '../features/booking/BookingPage'
import MyAppointmentsPage from '../pages/MyAppointmentsPage'
import CancelByTokenPage from '../pages/CancelByTokenPage'
import PhysioAgendaPage from '../pages/PhysioAgendaPage'
import PhysioAvailabilityPage from '../pages/PhysioAvailabilityPage'
import AdminAppointmentsPage from '../pages/AdminAppointmentsPage'
import AdminProfessionalsPage from '../pages/AdminProfessionalsPage'
import AdminTreatmentsPage from '../pages/AdminTreatmentsPage'

function ProtectedRoute({ children, role }: { children: ReactNode; role: UserRole }) {
  const { isAuthenticated, hasRole } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasRole(role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/professionals/:id', element: <ProfessionalDetailPage /> },
  { path: '/treatments', element: <TreatmentsPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/appointments/cancel/:token', element: <CancelByTokenPage /> },
  {
    path: '/book',
    element: (
      <ProtectedRoute role="patient">
        <BookingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-appointments',
    element: (
      <ProtectedRoute role="patient">
        <MyAppointmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/physio/agenda',
    element: (
      <ProtectedRoute role="professional">
        <PhysioAgendaPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/physio/availability',
    element: (
      <ProtectedRoute role="professional">
        <PhysioAvailabilityPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminAppointmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/professionals',
    element: (
      <ProtectedRoute role="admin">
        <AdminProfessionalsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/treatments',
    element: (
      <ProtectedRoute role="admin">
        <AdminTreatmentsPage />
      </ProtectedRoute>
    ),
  },
])
