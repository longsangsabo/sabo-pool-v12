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
    overview: navigation.filter(item => item.category === 'overview'),
    core: navigation.filter(item => item.category === 'core'),
    system: navigation.filter(item => item.category === 'system'),
    analytics: navigation.filter(item => item.category === 'analytics'),
    content: navigation.filter(item => item.category === 'content'),
    security: navigation.filter(item => item.category === 'security'),
    financial: navigation.filter(item => item.category === 'financial'),
    support: navigation.filter(item => item.category === 'support'),
  }

  return (
    <>
      {/* Sidebar Navigation */}
      <div className="hidden md:flex flex-col w-64 bg-secondary border-r border-border">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary">🎯 SABO Admin</h1>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 px-3 py-6 overflow-y-auto">
          <nav className="space-y-6">
            {Object.entries(categories).map(([categoryName, items]) => (
              <div key={categoryName}>
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {categoryName === 'overview' ? 'Overview' :
                   categoryName === 'core' ? 'Core Management' : 
                   categoryName === 'system' ? 'System' :
                   categoryName === 'analytics' ? 'Analytics' :
                   categoryName === 'content' ? 'Content' :
                   categoryName === 'security' ? 'Security' :
                   categoryName === 'financial' ? 'Financial' :
                   categoryName === 'support' ? 'Support' : categoryName}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const isActive = location.pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'text-secondary hover:bg-muted hover:text-primary'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
        
        {/* Bottom Actions */}
        <div className="border-t border-border p-4 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-muted rounded transition-colors"
          >
            {theme === 'dark' ? <Sun className="mr-3 h-5 w-5" /> : <Moon className="mr-3 h-5 w-5" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="px-3 py-2 text-sm text-muted-foreground border-t border-border">
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-muted rounded transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-secondary border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-primary">🎯 SABO Admin</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-primary hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

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
