import { ReactNode } from 'react'
import { AdminNavigation } from './AdminNavigation'

interface AdminLayoutProps {
  children: ReactNode
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export function AdminLayout({ children, theme, toggleTheme }: AdminLayoutProps) {
  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-gray-900' : 'bg-neutral-background'}`}>
      {/* Sidebar Navigation */}
      <AdminNavigation theme={theme} toggleTheme={toggleTheme} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className={`${theme === 'dark' ? 'bg-gray-900 text-var(--color-background)' : 'bg-var(--color-background) text-gray-900'} min-h-full p-6`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
