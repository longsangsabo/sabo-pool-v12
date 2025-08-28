import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { Loader2 } from 'lucide-react'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAdmin, isLoading, user } = useAdminAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Verifying admin credentials...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to unauthorized page if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
            <p className="text-gray-300 mb-4">
              You do not have administrative privileges to access this system.
            </p>
            <p className="text-sm text-gray-400">
              Contact the system administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render protected content for admin users
  return <>{children}</>
}
