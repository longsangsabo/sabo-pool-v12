import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for admin app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://exlqvlbawytbglioqfbc.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2Mjk4MDYsImV4cCI6MjAzOTIwNTgwNn0.WLmOTUgtyC-o7PLRQ7CTLxEm7TQgI82mOhQy5fTb3kA'

const supabase = createClient(supabaseUrl, supabaseKey)

interface AdminProfile {
  id: string
  email: string
  display_name: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

interface AdminAuthContextType {
  user: User | null
  profile: AdminProfile | null
  session: Session | null
  isAdmin: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// Admin email whitelist - only these emails can access admin
const ADMIN_EMAILS = [
  'longsangsabo@gmail.com',
  'longsang063@gmail.com'
]

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is admin based on email whitelist and database flag
  const isAdmin = Boolean(
    user && 
    profile && 
    ADMIN_EMAILS.includes(user.email || '') &&
    profile.is_admin === true
  )

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching admin profile:', error)
        return null
      }

      return data as AdminProfile
    } catch (error) {
      console.error('Error fetching admin profile:', error)
      return null
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Check email whitelist before attempting sign in
      if (!ADMIN_EMAILS.includes(email)) {
        return { 
          error: { 
            message: 'Access denied. This email is not authorized for admin access.' 
          } 
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error }
      }

      // Additional admin verification after successful login
      if (data.user) {
        const profile = await fetchProfile(data.user.id)
        if (!profile?.is_admin) {
          await supabase.auth.signOut()
          return { 
            error: { 
              message: 'Access denied. Admin privileges not found.' 
            } 
          }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
    // Clear state immediately
    setUser(null)
    setProfile(null) 
    setSession(null)
  }

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.refreshSession()
    setSession(session)
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile)
      }
      
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setProfile(profile)
          
          // Additional security: force logout if not admin
          if (!profile?.is_admin || !ADMIN_EMAILS.includes(session.user.email || '')) {
            console.warn('Non-admin user detected, forcing logout')
            await supabase.auth.signOut()
          }
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Log admin activities for security
  useEffect(() => {
    if (user && isAdmin) {
      console.log('Admin session active:', {
        email: user.email,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
    }
  }, [user, isAdmin])

  const value: AdminAuthContextType = {
    user,
    profile,
    session,
    isAdmin,
    isLoading,
    signIn,
    signOut,
    refreshSession
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
