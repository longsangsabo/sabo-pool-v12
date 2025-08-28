#!/bin/bash

# ===================================
# PHASE 1.1: Missing Modules Auto-Fix
# Priority #1 - Quick wins with low effort
# ===================================

echo "🔧 Phase 1.1: Fixing Missing Modules (61 errors)"
echo "================================================"

# Create missing directories first
echo "📁 Creating missing directory structure..."
mkdir -p src/utils
mkdir -p src/components/admin
mkdir -p src/components/tournament
mkdir -p src/schemas
mkdir -p src/repositories  
mkdir -p src/test/mocks
mkdir -p src/pages/mobile/profile/components
mkdir -p src/assets

# Create missing utility files
echo "📄 Creating missing utility files..."

# adminHelpers.ts
cat > src/utils/adminHelpers.ts << 'EOF'
/**
 * Admin Helper Utilities
 * Common utilities for admin functionality
 */

export const adminHelpers = {
  isAdmin: (user: any) => {
    return user?.role === 'admin' || user?.admin === true;
  },
  
  hasPermission: (user: any, permission: string) => {
    return user?.permissions?.includes(permission) || false;
  },
  
  formatAdminRoute: (path: string) => {
    return `/admin${path.startsWith('/') ? path : '/' + path}`;
  }
};
EOF

# authConfig utility
cat > src/components/utils/authConfig.ts << 'EOF'
/**
 * Authentication Configuration
 * Social login and auth configuration utilities
 */

export const authConfig = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback/google`
  },
  
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
    redirectUri: `${window.location.origin}/auth/callback/facebook`
  },
  
  twitter: {
    clientId: import.meta.env.VITE_TWITTER_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback/twitter`
  }
};

export const getAuthProvider = (provider: string) => {
  return authConfig[provider as keyof typeof authConfig];
};
EOF

# Create missing admin components
echo "📄 Creating missing admin components..."

# AdminBracketViewer
cat > src/components/admin/AdminBracketViewer.tsx << 'EOF'
/**
 * Admin Bracket Viewer Component
 * Placeholder for admin bracket management
 */
import React from 'react';

interface AdminBracketViewerProps {
  tournamentId?: string;
  editable?: boolean;
}

export const AdminBracketViewer: React.FC<AdminBracketViewerProps> = ({
  tournamentId,
  editable = false
}) => {
  return (
    <div className="admin-bracket-viewer">
      <h3>Admin Bracket Viewer</h3>
      <p>Tournament ID: {tournamentId}</p>
      <p>Editable: {editable ? 'Yes' : 'No'}</p>
      {/* TODO: Implement admin bracket viewing functionality */}
    </div>
  );
};

export default AdminBracketViewer;
EOF

# TournamentManagementFlow
cat > src/components/tournament/TournamentManagementFlow.tsx << 'EOF'
/**
 * Tournament Management Flow Component
 * Placeholder for tournament management workflow
 */
import React from 'react';

interface TournamentManagementFlowProps {
  tournamentId?: string;
  mode?: 'create' | 'edit' | 'view';
}

export const TournamentManagementFlow: React.FC<TournamentManagementFlowProps> = ({
  tournamentId,
  mode = 'view'
}) => {
  return (
    <div className="tournament-management-flow">
      <h3>Tournament Management Flow</h3>
      <p>Mode: {mode}</p>
      <p>Tournament ID: {tournamentId}</p>
      {/* TODO: Implement tournament management flow */}
    </div>
  );
};

export default TournamentManagementFlow;
EOF

# TournamentPrizesManager  
cat > src/components/tournament/TournamentPrizesManager.tsx << 'EOF'
/**
 * Tournament Prizes Manager Component
 * Placeholder for managing tournament prizes
 */
import React from 'react';

interface TournamentPrizesManagerProps {
  tournamentId?: string;
  editable?: boolean;
}

export const TournamentPrizesManager: React.FC<TournamentPrizesManagerProps> = ({
  tournamentId,
  editable = false
}) => {
  return (
    <div className="tournament-prizes-manager">
      <h3>Tournament Prizes Manager</h3>
      <p>Tournament ID: {tournamentId}</p>
      <p>Editable: {editable ? 'Yes' : 'No'}</p>
      {/* TODO: Implement tournament prizes management */}
    </div>
  );
};

export default TournamentPrizesManager;
EOF

# Create missing schemas
echo "📄 Creating missing schema files..."

# tournamentSchema
cat > src/schemas/tournamentSchema.ts << 'EOF'
/**
 * Tournament Schema Definitions
 * Zod schemas for tournament validation
 */
import { z } from 'zod';

export const tournamentSchema = z.object({
  name: z.string().min(1, 'Tournament name is required'),
  description: z.string().optional(),
  tournament_type: z.enum(['single_elimination', 'double_elimination', 'round_robin', 'swiss']),
  game_format: z.enum(['8_ball', '9_ball', '10_ball', 'straight_pool']),
  max_participants: z.number().min(4).max(128),
  entry_fee: z.number().min(0),
  prize_pool: z.number().min(0),
  tournament_start: z.string(),
  tournament_end: z.string(),
  registration_start: z.string(),
  registration_end: z.string(),
  venue_address: z.string().min(1, 'Venue address is required'),
  rules: z.string().optional(),
  is_public: z.boolean().default(true),
  requires_approval: z.boolean().default(false)
});

export type TournamentFormData = z.infer<typeof tournamentSchema>;
EOF

# tournamentRegistrationSchema
cat > src/schemas/tournamentRegistrationSchema.ts << 'EOF'
/**
 * Tournament Registration Schema
 * Zod schemas for tournament registration validation
 */
import { z } from 'zod';

export const tournamentRegistrationSchema = z.object({
  tournament_id: z.string().uuid(),
  user_id: z.string().uuid(),
  emergency_contact_name: z.string().min(1, 'Emergency contact name is required'),
  emergency_contact_phone: z.string().min(10, 'Valid phone number required'),
  dietary_restrictions: z.string().optional(),
  accommodation_needed: z.boolean().default(false),
  waiver_signed: z.boolean().refine(val => val === true, {
    message: 'Waiver must be signed'
  }),
  payment_method: z.enum(['card', 'bank_transfer', 'cash']),
  special_requests: z.string().optional()
});

export type TournamentRegistrationData = z.infer<typeof tournamentRegistrationSchema>;
EOF

# Create missing hook files
echo "📄 Creating missing hook files..."

# use-toast hook (for SPAPointsCard)
cat > src/components/ranking/hooks/use-toast.ts << 'EOF'
/**
 * Toast Hook
 * Custom hook for toast notifications
 */
import { toast } from 'sonner';

export const useToast = () => {
  return {
    toast: (message: string, options?: any) => {
      toast(message, options);
    },
    success: (message: string) => {
      toast.success(message);
    },
    error: (message: string) => {
      toast.error(message);
    },
    warning: (message: string) => {
      toast.warning(message);
    },
    info: (message: string) => {
      toast(message);
    }
  };
};
EOF

# Create missing repository files
echo "📄 Creating missing repository files..."

# tournamentRepository
cat > src/repositories/tournamentRepository.ts << 'EOF'
/**
 * Tournament Repository
 * Data access layer for tournament operations
 */
import { supabase } from '@/integrations/supabase/client';

export const tournamentRepository = {
  async getTournaments() {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getTournament(id: string) {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createTournament(tournament: any) {
    const { data, error } = await supabase
      .from('tournaments')
      .insert(tournament)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTournament(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTournament(id: string) {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
EOF

# Create missing test mocks
echo "📄 Creating missing test mock files..."

# supabase test mock
cat > src/test/mocks/supabase.ts << 'EOF'
/**
 * Supabase Test Mocks
 * Mock implementations for testing
 */

export const mockSupabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
    signUp: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
};
EOF

# Create missing page components  
echo "📄 Creating missing page components..."

# TabEditProfile
cat > src/pages/mobile/profile/components/TabEditProfile.tsx << 'EOF'
/**
 * Tab Edit Profile Component
 * Mobile profile editing interface
 */
import React from 'react';

interface TabEditProfileProps {
  user?: any;
  onSave?: (data: any) => void;
}

export const TabEditProfile: React.FC<TabEditProfileProps> = ({
  user,
  onSave
}) => {
  return (
    <div className="tab-edit-profile">
      <h3>Edit Profile</h3>
      <p>User: {user?.name}</p>
      {/* TODO: Implement mobile profile editing */}
    </div>
  );
};

export default TabEditProfile;
EOF

# Create missing assets
echo "📄 Creating missing asset files..."

# Create placeholder image
cat > src/assets/sabo-club-bg.jpg.ts << 'EOF'
/**
 * SABO Club Background Image
 * Placeholder for missing image asset
 */
export default '/placeholder-bg.jpg';
EOF

# Create performance utility
echo "📄 Creating missing performance utilities..."

cat > src/utils/performance.ts << 'EOF'
/**
 * Performance Utilities
 * Performance monitoring and optimization helpers
 */

export const performanceUtils = {
  measureTime: (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  },

  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};
EOF

echo ""
echo "✅ Missing modules fix completed!"
echo "📊 Created files:"
echo "  - 📁 Directory structure for missing paths"
echo "  - 📄 src/utils/adminHelpers.ts"
echo "  - 📄 src/components/utils/authConfig.ts"
echo "  - 📄 src/components/admin/AdminBracketViewer.tsx"
echo "  - 📄 src/components/tournament/TournamentManagementFlow.tsx"
echo "  - 📄 src/components/tournament/TournamentPrizesManager.tsx"
echo "  - 📄 src/schemas/tournamentSchema.ts"
echo "  - 📄 src/schemas/tournamentRegistrationSchema.ts"
echo "  - 📄 src/components/ranking/hooks/use-toast.ts"
echo "  - 📄 src/repositories/tournamentRepository.ts"
echo "  - 📄 src/test/mocks/supabase.ts"
echo "  - 📄 src/pages/mobile/profile/components/TabEditProfile.tsx"
echo "  - 📄 src/assets/sabo-club-bg.jpg.ts"
echo "  - 📄 src/utils/performance.ts"
echo ""
echo "🎯 Next: Run TypeScript check to verify fixes"
