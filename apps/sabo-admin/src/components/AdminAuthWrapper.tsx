import React from 'react'
import { AuthProvider } from '@sabo/shared-auth'
import { AdminRouteGuardShared } from '../components/AdminRouteGuardShared'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  return (
    <AuthProvider>
      <AdminRouteGuardShared>
        {children}
      </AdminRouteGuardShared>
    </AuthProvider>
  )
}
