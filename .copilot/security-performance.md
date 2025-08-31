# 🛡️ SABO Arena - Security & Performance Guidelines

> **SECURITY & PERFORMANCE** standards for AI assistants

## 🔒 Security Guidelines

### **1. Authentication & Authorization**

#### **Supabase Auth Patterns**
```typescript
// ✅ CORRECT: Secure auth implementation
export const useAuthGuard = (requiredRole?: UserRole) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    if (requiredRole && user.role !== requiredRole) {
      navigate('/unauthorized', { replace: true });
      return;
    }
  }, [user, loading, requiredRole, navigate]);
  
  return { user, isAuthorized: !!user && (!requiredRole || user.role === requiredRole) };
};

// ❌ WRONG: Client-side only checks
const BadAuthCheck = () => {
  const user = getCurrentUser(); // This can be bypassed
  if (user?.role === 'admin') {
    return <AdminPanel />;
  }
};
```

#### **Row Level Security (RLS)**
```sql
-- ✅ CORRECT: Proper RLS policies
CREATE POLICY "Users can only access their own tournaments"
ON tournaments FOR ALL
USING (auth.uid() = created_by);

CREATE POLICY "Tournament participants can view tournament data"
ON tournaments FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM tournament_participants 
    WHERE tournament_id = tournaments.id
  )
);

-- ❌ WRONG: Overly permissive policies
CREATE POLICY "Allow all access" ON tournaments FOR ALL USING (true);
```

### **2. Input Validation & Sanitization**

#### **Zod Validation Patterns**
```typescript
// ✅ CORRECT: Comprehensive validation
const TournamentSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Name contains invalid characters"),
  
  description: z.string()
    .max(500, "Description too long")
    .optional(),
    
  entryFee: z.number()
    .min(0, "Entry fee cannot be negative")
    .max(10000000, "Entry fee too high")
    .int("Entry fee must be a whole number"),
    
  maxParticipants: z.number()
    .min(4, "Minimum 4 participants required")
    .max(64, "Maximum 64 participants allowed")
    .int("Participant count must be whole number"),
});

// Server-side validation
export async function createTournament(rawData: unknown) {
  try {
    const validData = TournamentSchema.parse(rawData);
    // Proceed with validated data
    return await tournamentService.create(validData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Invalid input data", error.errors);
    }
    throw error;
  }
}

// ❌ WRONG: No validation
const badCreateTournament = (data: any) => {
  return tournamentService.create(data); // Dangerous!
};
```

### **3. Data Protection**

#### **Sensitive Data Handling**
```typescript
// ✅ CORRECT: Secure data handling
interface PublicUser {
  id: string;
  username: string;
  avatar?: string;
  stats: PlayerStats;
}

interface PrivateUser extends PublicUser {
  email: string;
  phoneNumber?: string;
  paymentMethods: PaymentMethod[];
}

// Only expose public data to client
export const getUserPublicProfile = (userId: string): Promise<PublicUser> => {
  return supabase
    .from('users')
    .select('id, username, avatar, stats')
    .eq('id', userId)
    .single();
};

// ❌ WRONG: Exposing sensitive data
const badGetUser = (userId: string) => {
  return supabase
    .from('users')
    .select('*') // This includes email, phone, etc.
    .eq('id', userId)
    .single();
};
```

#### **Payment Security**
```typescript
// ✅ CORRECT: Secure payment handling
export const initiatePayment = async (tournamentId: string, amount: number) => {
  // Validate on server
  const tournament = await validateTournamentPayment(tournamentId, amount);
  
  // Create payment with VNPay
  const paymentData = {
    amount: tournament.entryFee, // Use server value, not client
    orderInfo: `Tournament ${tournament.name} entry fee`,
    returnUrl: `${process.env.APP_URL}/payment/return`,
    ipnUrl: `${process.env.API_URL}/payment/ipn`,
  };
  
  return vnpayService.createPayment(paymentData);
};

// ❌ WRONG: Trusting client data
const badPayment = async (amount: number) => {
  return vnpayService.createPayment({ amount }); // Client can manipulate amount
};
```

---

## ⚡ Performance Guidelines

### **1. React Performance**

#### **Component Optimization**
```typescript
// ✅ CORRECT: Optimized component
import { memo, useMemo, useCallback } from 'react';

interface TournamentListProps {
  tournaments: Tournament[];
  onTournamentSelect: (id: string) => void;
  filters: TournamentFilters;
}

export const TournamentList = memo<TournamentListProps>(({ 
  tournaments, 
  onTournamentSelect, 
  filters 
}) => {
  // Memoize expensive computations
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      if (filters.status && tournament.status !== filters.status) return false;
      if (filters.search && !tournament.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [tournaments, filters]);
  
  // Memoize event handlers
  const handleSelect = useCallback((tournament: Tournament) => {
    onTournamentSelect(tournament.id);
  }, [onTournamentSelect]);
  
  return (
    <div className="space-y-4">
      {filteredTournaments.map(tournament => (
        <TournamentCard 
          key={tournament.id}
          tournament={tournament}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
});

TournamentList.displayName = 'TournamentList';

// ❌ WRONG: Unoptimized component
const BadTournamentList = ({ tournaments, onTournamentSelect, filters }) => {
  return (
    <div>
      {tournaments.filter(t => {
        // This runs on every render!
        return filters.status ? t.status === filters.status : true;
      }).map(tournament => (
        <TournamentCard 
          key={tournament.id}
          tournament={tournament}
          onSelect={() => onTournamentSelect(tournament.id)} // New function every render!
        />
      ))}
    </div>
  );
};
```

#### **State Management Optimization**
```typescript
// ✅ CORRECT: Optimized state updates
const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: [],
  filters: { status: null, search: '' },
  
  // Batch updates to prevent multiple re-renders
  updateFilters: (newFilters: Partial<TournamentFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },
  
  // Use immer for complex updates
  updateTournament: (id: string, updates: Partial<Tournament>) => {
    set(produce(state => {
      const index = state.tournaments.findIndex(t => t.id === id);
      if (index !== -1) {
        Object.assign(state.tournaments[index], updates);
      }
    }));
  },
}));

// ❌ WRONG: Multiple state updates
const badUpdateFilters = (status: string, search: string) => {
  setStatus(status);    // Render 1
  setSearch(search);    // Render 2
  setLoading(true);     // Render 3
};
```

### **2. Database Performance**

#### **Efficient Queries**
```typescript
// ✅ CORRECT: Optimized Supabase queries
export const getTournamentWithParticipants = async (id: string) => {
  const { data, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      tournament_participants!inner(
        user_id,
        joined_at,
        users(id, username, avatar)
      )
    `)
    .eq('id', id)
    .order('joined_at', { foreignTable: 'tournament_participants' })
    .single();
    
  if (error) throw error;
  return data;
};

// Use pagination for large datasets
export const getTournamentsPaginated = async (page = 0, limit = 20) => {
  const start = page * limit;
  const end = start + limit - 1;
  
  const { data, error, count } = await supabase
    .from('tournaments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);
    
  if (error) throw error;
  
  return {
    tournaments: data,
    totalCount: count,
    hasMore: count ? end < count - 1 : false,
  };
};

// ❌ WRONG: Inefficient queries
const badGetTournaments = async () => {
  // Getting all tournaments at once
  const { data } = await supabase.from('tournaments').select('*');
  
  // N+1 query problem
  const tournamentsWithParticipants = await Promise.all(
    data.map(async tournament => {
      const { data: participants } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', tournament.id);
      return { ...tournament, participants };
    })
  );
};
```

#### **Caching Strategies**
```typescript
// ✅ CORRECT: React Query with proper caching
export const useTournaments = (filters: TournamentFilters) => {
  return useQuery({
    queryKey: ['tournaments', filters],
    queryFn: () => tournamentService.getFiltered(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData, // Smooth transitions
  });
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: () => tournamentService.getById(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!id,
  });
};

// Prefetch related data
export const usePrefetchTournamentData = () => {
  const queryClient = useQueryClient();
  
  const prefetchTournament = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['tournament', id],
      queryFn: () => tournamentService.getById(id),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);
  
  return { prefetchTournament };
};

// ❌ WRONG: No caching, frequent refetches
const badUseTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  
  useEffect(() => {
    // Refetches on every component mount
    tournamentService.getAll().then(setTournaments);
  }, []); // No dependencies, but this still runs every mount
  
  return tournaments;
};
```

### **3. Bundle Size Optimization**

#### **Code Splitting & Lazy Loading**
```typescript
// ✅ CORRECT: Route-based code splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load route components
const HomePage = lazy(() => import('./pages/HomePage'));
const TournamentsPage = lazy(() => import('./pages/TournamentsPage'));
const TournamentDetailsPage = lazy(() => import('./pages/TournamentDetailsPage'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

export const AppRouter = () => {
  return (
    <Suspense fallback={<GlobalLoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailsPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
};

// Component-level lazy loading for heavy components
const HeavyChart = lazy(() => import('./components/HeavyChart'));

const Dashboard = () => {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>Load Chart</button>
      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
};

// ❌ WRONG: Everything imported eagerly
import HomePage from './pages/HomePage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailsPage from './pages/TournamentDetailsPage';
import AdminDashboard from './pages/admin/Dashboard';
import HeavyChart from './components/HeavyChart'; // Large bundle even if not used
```

#### **Tree Shaking Optimization**
```typescript
// ✅ CORRECT: Named imports for tree shaking
import { debounce, throttle } from 'lodash-es';
import { formatDistance } from 'date-fns';
import { z } from 'zod';

// Use specific imports from large libraries
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// ❌ WRONG: Default imports that include entire library
import _ from 'lodash'; // Includes entire lodash
import * as dateFns from 'date-fns'; // Includes all date-fns functions
import { * as MUI } from '@mui/material'; // Massive bundle
```

### **4. Network Performance**

#### **Image Optimization**
```typescript
// ✅ CORRECT: Optimized image handling
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  return (
    <div className="relative">
      {isLoading && <ImageSkeleton width={width} height={height} />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        className={cn(
          "transition-opacity duration-300",
          isLoading && "opacity-0",
          error && "hidden"
        )}
      />
      {error && <ImageFallback alt={alt} />}
    </div>
  );
};

// Use Supabase storage with transformations
export const getOptimizedImageUrl = (
  path: string, 
  options: { width?: number; height?: number; quality?: number } = {}
) => {
  const { width = 800, height = 600, quality = 80 } = options;
  
  return supabase.storage
    .from('tournament-images')
    .getPublicUrl(path, {
      transform: {
        width,
        height,
        resize: 'cover',
        quality,
      },
    }).data.publicUrl;
};

// ❌ WRONG: No image optimization
const BadImage = ({ src, alt }) => (
  <img src={src} alt={alt} /> // No loading states, no optimization
);
```

---

## 🚨 Security Checklist

### **Before Deploying**
- [ ] All API endpoints have proper authentication
- [ ] RLS policies are correctly configured
- [ ] Input validation is implemented on both client and server
- [ ] Sensitive data is not exposed in client responses
- [ ] Payment flows are secured and validated
- [ ] Environment variables are properly configured
- [ ] CORS settings are restrictive
- [ ] Rate limiting is implemented

### **Performance Checklist**
- [ ] Components are properly memoized
- [ ] Large lists are virtualized
- [ ] Images are optimized and lazy-loaded
- [ ] Code is split at route level
- [ ] Database queries are optimized
- [ ] Caching strategies are implemented
- [ ] Bundle size is monitored
- [ ] Core Web Vitals are within targets

---

**Remember**: Security and performance are not optional features - they are fundamental requirements! 🛡️⚡
