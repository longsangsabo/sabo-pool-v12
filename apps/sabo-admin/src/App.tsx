import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AdminAuthWrapper } from './components/AdminAuthWrapper'
import { AdminLayout } from './components/AdminLayout'
// Use migrated components for production-ready admin app
import AdminDashboardMigrated from './pages/admin/AdminDashboardMigrated'
import AdminUsersMigrated from './pages/admin/AdminUsersMigrated'
import AdminTournamentsMigrated from './pages/admin/AdminTournamentsMigrated'
import AdminSettingsMigrated from './pages/admin/AdminSettingsMigrated'
// Add missing admin pages
import AdminUserManagementEnterprise from './pages/admin/AdminUserManagementEnterprise'
import AdminClubs from './pages/admin/AdminClubs'
// Keep system health monitoring for now
import AdminSystemHealthMonitoring from './pages/admin/AdminSystemHealthMonitoring'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark' || 'dark'
    setTheme(savedTheme)
    document.documentElement.className = savedTheme
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('admin-theme', newTheme)
    document.documentElement.className = newTheme
  }

  return (
    <AdminAuthWrapper>
      <BrowserRouter>
        <AdminLayout theme={theme} toggleTheme={toggleTheme}>
          <Routes>
            {/* Core migrated admin pages - production ready */}
            <Route path="/dashboard" element={<AdminDashboardMigrated />} />
            <Route path="/users" element={<AdminUsersMigrated />} />
            <Route path="/tournaments" element={<AdminTournamentsMigrated />} />
            <Route path="/settings" element={<AdminSettingsMigrated />} />
            
            {/* Additional admin pages */}
            <Route path="/users-enterprise" element={<AdminUserManagementEnterprise />} />
            <Route path="/clubs" element={<AdminClubs />} />
            
            {/* System monitoring - keep existing for now */}
            <Route path="/system-health" element={<AdminSystemHealthMonitoring />} />
            
            {/* Default redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
    </AdminAuthWrapper>
  )
}

export default App
