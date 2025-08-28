import { ReactNode } from 'react'
import { AdminNavigation } from './AdminNavigation'

interface AdminLayoutProps {
  children: ReactNode
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export function AdminLayout({ children, theme, toggleTheme }: AdminLayoutProps) {
  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar Navigation */}
      <AdminNavigation theme={theme} toggleTheme={toggleTheme} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-full`}>
          {children}
        </div>
      </main>
    </div>
  )
}
