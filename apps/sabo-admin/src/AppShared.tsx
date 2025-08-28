import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthWrapper } from './components/AdminAuthWrapper'
import AdminDashboardFunctional from './pages/admin/AdminDashboardFunctional'
import AdminTournaments from './pages/admin/AdminTournaments'
import AdminUsers from './pages/admin/AdminUsers'
import AdminClubs from './pages/admin/AdminClubs'
import AdminSettings from './pages/admin/AdminSettings'

function App() {
  return (
    <AdminAuthWrapper>
      <BrowserRouter>
        <Routes>
          {/* All routes are now protected by AdminAuthWrapper */}
          <Route path="/dashboard" element={<AdminDashboardFunctional />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/tournaments" element={<AdminTournaments />} />
          <Route path="/clubs" element={<AdminClubs />} />
          <Route path="/settings" element={<AdminSettings />} />
          
          {/* Default redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthWrapper>
  )
}

export default App
