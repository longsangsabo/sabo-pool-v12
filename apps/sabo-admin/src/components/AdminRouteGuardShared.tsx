import React from 'react'
import { useAuth } from '@sabo/shared-auth'
import { AdminLogin } from './AdminLogin'

interface AdminRouteGuardSharedProps {
  children: React.ReactNode
}

export function AdminRouteGuardShared({ children }: AdminRouteGuardSharedProps) {
  const { user, loading } = useAuth()

  // Admin email whitelist - only these emails can access admin
  const ADMIN_EMAILS = [
    'longsangsabo@gmail.com',
    'longsang063@gmail.com'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading admin access...</p>
        </div>
      </div>
    )
  }

  // Check if user is not logged in
  if (!user) {
    return <AdminLogin />
  }

  // Check if user has admin privileges
  const isAdmin = Boolean(
    user && 
    ADMIN_EMAILS.includes(user.email || '') &&
    user.role === 'admin'
  )

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            You need administrator privileges to access this application.
          </p>
          <p className="text-sm text-gray-500">
            Logged in as: {user.email}
          </p>
          <button
            onClick={() => window.location.href = 'http://localhost:8080'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go to User App
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
