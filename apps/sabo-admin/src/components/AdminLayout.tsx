import { ReactNode } from 'react'
import { AdminNavigation } from './AdminNavigation'

interface AdminLayoutProps {
  children: ReactNode
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export function AdminLayout({ children, theme, toggleTheme }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-primary transition-colors duration-200">
      <AdminNavigation theme={theme} toggleTheme={toggleTheme} />
      <main className="transition-colors duration-200">
        {children}
      </main>
    </div>
  )
}
