import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AdminLayout } from './components/AdminLayout'
import { AuthProvider } from '@sabo/shared-auth'

// Production-ready consolidated components
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTournaments from './pages/admin/AdminTournaments'
import AdminSettings from './pages/admin/AdminSettings'

// Additional functional admin pages
import AdminUserManagementEnterprise from './pages/admin/AdminUserManagementEnterprise'
import AdminClubs from './pages/admin/AdminClubs'
import AdminSystemHealthMonitoring from './pages/admin/AdminSystemHealthMonitoring'

// Alternative functional versions
import AdminTournamentManagerFunctional from './pages/admin/AdminTournamentManagerFunctional'

// All implemented admin pages
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminReports from './pages/admin/AdminReports'
import AdminContent from './pages/admin/AdminContent'
import AdminMedia from './pages/admin/AdminMedia'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminMessages from './pages/admin/AdminMessages'
import AdminPermissions from './pages/admin/AdminPermissions'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import AdminFinance from './pages/admin/AdminFinance'
import AdminPayments from './pages/admin/AdminPayments'
import AdminBilling from './pages/admin/AdminBilling'
import AdminSupport from './pages/admin/AdminSupport'
import AdminFeedback from './pages/admin/AdminFeedback'

// Overview page
import AdminOverview from './pages/AdminOverview'

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
    <AuthProvider>
      <BrowserRouter>
        <AdminLayout theme={theme} toggleTheme={toggleTheme}>
            <Routes>
              {/* Overview Page */}
              <Route path="/overview" element={<AdminOverview />} />
              
              {/* Core Management Routes */}
              <Route path="/dashboard" element={<AdminDashboard />} />
              
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/users-enterprise" element={<AdminUserManagementEnterprise />} />
              
              <Route path="/tournaments" element={<AdminTournaments />} />
              <Route path="/tournament-manager" element={<AdminTournamentManagerFunctional />} />
              
              <Route path="/clubs" element={<AdminClubs />} />
              
              {/* System Management Routes */}
              <Route path="/system-health" element={<AdminSystemHealthMonitoring />} />
              <Route path="/settings" element={<AdminSettings />} />
              
              {/* Advanced Analytics & Reports */}
              <Route path="/analytics" element={<AdminAnalytics />} />
              <Route path="/reports" element={<AdminReports />} />
              
              {/* Content Management */}
              <Route path="/content" element={<AdminContent />} />
              <Route path="/media" element={<AdminMedia />} />
              <Route path="/notifications" element={<AdminNotifications />} />
              <Route path="/messages" element={<AdminMessages />} />
              
              {/* Security & Permissions */}
              <Route path="/permissions" element={<AdminPermissions />} />
              <Route path="/audit-logs" element={<AdminAuditLogs />} />
              
              {/* Financial Management */}
              <Route path="/finance" element={<AdminFinance />} />
              <Route path="/payments" element={<AdminPayments />} />
              <Route path="/billing" element={<AdminBilling />} />
              
              {/* Support & Feedback */}
              <Route path="/support" element={<AdminSupport />} />
              <Route path="/feedback" element={<AdminFeedback />} />
              
              {/* Default redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </BrowserRouter>
      </AuthProvider>
  )
}

export default App
