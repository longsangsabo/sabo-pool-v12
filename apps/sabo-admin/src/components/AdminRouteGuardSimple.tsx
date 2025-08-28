import { useAdminAuth } from '../hooks/useAdminAuth'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export function AdminRouteGuardSimple({ children }: AdminRouteGuardProps) {
  const { isAdmin, isLoading } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
