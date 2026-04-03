import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode
  adminOnly?: boolean
}) {
  const { token, user } = useAuth()
  const location = useLocation()

  if (!token || !user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}
