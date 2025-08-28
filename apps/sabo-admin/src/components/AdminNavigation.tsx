import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { 
  Home, Users, Building2, Trophy, Activity, Settings, 
  DollarSign, FileText,
  Bell, TrendingUp, Sun, Moon, Menu, X,
  UserCog, Eye, MessageSquare, CreditCard, HelpCircle, MessageCircle, Target, 
  Folder, Image, Lock, Shield, LogOut
} from 'lucide-react'
import { useAuth } from '@sabo/shared-auth'

interface AdminNavigationProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export function AdminNavigation({ theme, toggleTheme }: AdminNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { signOut, user } = useAuth()

  const navigation = [
    // Overview
    { name: 'Overview', href: '/overview', icon: Eye, category: 'overview' },
    
    // Core Admin 
    { name: 'Dashboard', href: '/dashboard', icon: Home, category: 'core' },
    { name: 'Users', href: '/users', icon: Users, category: 'core' },
    { name: 'Users Enterprise', href: '/users-enterprise', icon: UserCog, category: 'core' },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy, category: 'core' },
    { name: 'Tournament Manager', href: '/tournament-manager', icon: Target, category: 'core' },
    { name: 'Clubs', href: '/clubs', icon: Building2, category: 'core' },
    
    // System Management
    { name: 'System Health', href: '/system-health', icon: Activity, category: 'system' },
    { name: 'Settings', href: '/settings', icon: Settings, category: 'system' },
    
    // Analytics & Reports
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, category: 'analytics' },
    { name: 'Reports', href: '/reports', icon: FileText, category: 'analytics' },
    
    // Content Management
    { name: 'Content', href: '/content', icon: Folder, category: 'content' },
    { name: 'Media', href: '/media', icon: Image, category: 'content' },
    { name: 'Notifications', href: '/notifications', icon: Bell, category: 'content' },
    { name: 'Messages', href: '/messages', icon: MessageSquare, category: 'content' },
    
    // Security & Permissions
    { name: 'Permissions', href: '/permissions', icon: Lock, category: 'security' },
    { name: 'Audit Logs', href: '/audit-logs', icon: Shield, category: 'security' },
    
    // Financial Management
    { name: 'Finance', href: '/finance', icon: DollarSign, category: 'financial' },
    { name: 'Payments', href: '/payments', icon: CreditCard, category: 'financial' },
    { name: 'Billing', href: '/billing', icon: FileText, category: 'financial' },
    
    // Support & Feedback
    { name: 'Support', href: '/support', icon: HelpCircle, category: 'support' },
    { name: 'Feedback', href: '/feedback', icon: MessageCircle, category: 'support' },
  ]

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  }

  // Group navigation by category
  const categories = {
    core: navigation.filter(item => item.category === 'core'),
    financial: navigation.filter(item => item.category === 'financial'),
    security: navigation.filter(item => item.category === 'security'),
    system: navigation.filter(item => item.category === 'system'),
    advanced: navigation.filter(item => item.category === 'advanced'),
  }

  return (
    <>
      <nav className="bg-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary">🎯 SABO Admin</h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-1">
                  {Object.entries(categories).map(([categoryName, items]) => (
                    <div key={categoryName} className="flex items-center space-x-1">
                      {items.map((item) => {
                        const isActive = location.pathname === item.href
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`px-2 py-2 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                              isActive
                                ? 'bg-accent text-accent-foreground'
                                : 'text-secondary hover:bg-muted hover:text-primary'
                            }`}
                            title={item.name}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="hidden lg:block">{item.name}</span>
                          </Link>
                        )
                      })}
                      {categoryName !== 'advanced' && (
                        <div className="w-px h-6 bg-border mx-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-muted rounded transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <span className="text-secondary text-sm">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-muted rounded transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-primary hover:bg-muted"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-secondary border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile navigation items */}
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-secondary hover:bg-muted hover:text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Mobile actions */}
            <div className="border-t border-border pt-4 mt-4">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-secondary hover:text-primary hover:bg-muted w-full transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <div className="px-3 py-2 text-sm text-secondary">
                {user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-secondary hover:text-primary hover:bg-muted w-full transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
