# 👨‍💻 SABO POOL - DEVELOPER GUIDE

## 📋 Overview

Hướng dẫn phát triển cho SABO Pool, bao gồm coding standards, best practices, và quy trình phát triển.

## 🚀 Quick Start

### 1. Development Environment Setup
```bash
# Prerequisites
node --version  # >= 18.0.0
pnpm --version  # >= 8.0.0

# Clone and setup
git clone https://github.com/longsangsabo/sabo-pool-v12.git
cd sabo-pool-v12
pnpm install

# Start development
pnpm dev
```

### 2. Project Structure Understanding
```
sabo-pool-v12/
├── apps/
│   ├── sabo-admin/     # Admin Dashboard
│   └── sabo-user/      # Main User App
├── packages/
│   ├── shared-auth/    # Authentication Logic
│   ├── shared-hooks/   # Reusable Hooks
│   ├── shared-types/   # Type Definitions
│   ├── shared-ui/      # UI Components
│   └── shared-utils/   # Utilities
├── supabase/          # Backend & Database
└── docs/              # Documentation
```

## 💻 Coding Standards

### 1. TypeScript Guidelines

#### Strict Type Safety
```typescript
// ✅ Good: Explicit typing
interface TournamentData {
  id: string;
  name: string;
  status: 'registration_open' | 'ongoing' | 'completed';
  participants: Player[];
}

// ❌ Bad: Any types
const tournamentData: any = {};

// ✅ Good: Generic constraints
function updateEntity<T extends { id: string }>(
  entity: T, 
  updates: Partial<T>
): T {
  return { ...entity, ...updates };
}
```

#### Type Guards
```typescript
// ✅ Good: Type guards for runtime safety
function isTournament(obj: unknown): obj is Tournament {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'status' in obj
  );
}

// Usage
if (isTournament(data)) {
  // TypeScript knows data is Tournament here
  console.log(data.name);
}
```

#### Utility Types
```typescript
// ✅ Good: Using utility types
type CreateTournamentRequest = Omit<Tournament, 'id' | 'created_at'>;
type UpdateTournamentRequest = Partial<Pick<Tournament, 'name' | 'description'>>;

// ✅ Good: Branded types for IDs
type TournamentId = string & { __brand: 'TournamentId' };
type PlayerId = string & { __brand: 'PlayerId' };
```

### 2. React Component Guidelines

#### Component Structure
```typescript
// ✅ Good: Component with proper typing
interface TournamentCardProps {
  tournament: Tournament;
  onJoin?: (tournamentId: string) => void;
  className?: string;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onJoin,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleJoin = useCallback(async () => {
    if (!onJoin) return;
    
    setIsLoading(true);
    try {
      await onJoin(tournament.id);
    } finally {
      setIsLoading(false);
    }
  }, [onJoin, tournament.id]);

  return (
    <Card className={cn("tournament-card", className)}>
      <CardHeader>
        <CardTitle>{tournament.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <TournamentInfo tournament={tournament} />
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleJoin}
          disabled={isLoading || tournament.status !== 'registration_open'}
        >
          {isLoading ? 'Joining...' : 'Join Tournament'}
        </Button>
      </CardFooter>
    </Card>
  );
};
```

#### Hooks Pattern
```typescript
// ✅ Good: Custom hook with proper error handling
export const useTournament = (tournamentId: string) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await TournamentService.getTournament(tournamentId);
        setTournament(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  const refetch = useCallback(() => {
    fetchTournament();
  }, [tournamentId]);

  return { tournament, loading, error, refetch };
};
```

### 3. Service Layer Guidelines

#### Service Pattern
```typescript
// ✅ Good: Service with proper error handling
export class TournamentService {
  private static readonly BASE_URL = '/rest/v1/tournaments';

  static async getTournaments(filters?: TournamentFilters): Promise<Tournament[]> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, clubs(name, address)')
        .match(filters || {})
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
      throw error;
    }
  }

  static async createTournament(
    tournamentData: CreateTournamentRequest
  ): Promise<Tournament> {
    try {
      // Validate input
      const validated = tournamentSchema.parse(tournamentData);
      
      const { data, error } = await supabase
        .from('tournaments')
        .insert(validated)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Failed to create tournament:', error);
      throw error;
    }
  }
}
```

### 4. Error Handling

#### Error Boundaries
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Async Error Handling
```typescript
// ✅ Good: Consistent error handling pattern
export const useAsyncOperation = <T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await operation(...args);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Log error for debugging
      console.error('Async operation failed:', error);
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [operation]);

  return { execute, loading, error };
};
```

## 🎨 UI/UX Guidelines

### 1. Design System Usage

#### Component Composition
```typescript
// ✅ Good: Using design system components
import { Button, Card, CardContent, Input } from '@/components/ui';

export const TournamentForm = () => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tournament Name</Label>
          <Input
            id="name"
            placeholder="Enter tournament name"
            {...register('name')}
          />
        </div>
        
        <div className="flex gap-2">
          <Button type="submit" variant="default">
            Create Tournament
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### Styling Guidelines
```typescript
// ✅ Good: Using Tailwind with CSS variables
const styles = {
  container: "bg-background text-foreground",
  card: "bg-card text-card-foreground border-border",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  muted: "bg-muted text-muted-foreground"
};

// ✅ Good: Responsive design
const responsiveGrid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
```

### 2. Accessibility

#### ARIA Labels and Roles
```typescript
// ✅ Good: Accessible component
export const TournamentCard = ({ tournament, onJoin }: TournamentCardProps) => {
  return (
    <article 
      role="article"
      aria-labelledby={`tournament-${tournament.id}-title`}
      className="tournament-card"
    >
      <header>
        <h3 id={`tournament-${tournament.id}-title`}>
          {tournament.name}
        </h3>
      </header>
      
      <div className="tournament-info">
        <p aria-label={`${tournament.current_participants} out of ${tournament.max_participants} participants`}>
          Participants: {tournament.current_participants}/{tournament.max_participants}
        </p>
      </div>
      
      <footer>
        <Button
          onClick={() => onJoin?.(tournament.id)}
          aria-describedby={`tournament-${tournament.id}-description`}
          disabled={tournament.current_participants >= tournament.max_participants}
        >
          Join Tournament
        </Button>
      </footer>
    </article>
  );
};
```

## 🧪 Testing Guidelines

### 1. Unit Testing

#### Component Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TournamentCard } from './TournamentCard';

const mockTournament: Tournament = {
  id: 'test-tournament-id',
  name: 'Test Tournament',
  status: 'registration_open',
  current_participants: 5,
  max_participants: 10
};

describe('TournamentCard', () => {
  it('renders tournament information correctly', () => {
    render(<TournamentCard tournament={mockTournament} />);
    
    expect(screen.getByText('Test Tournament')).toBeInTheDocument();
    expect(screen.getByText('Participants: 5/10')).toBeInTheDocument();
  });

  it('calls onJoin when join button is clicked', async () => {
    const mockOnJoin = jest.fn();
    
    render(
      <TournamentCard tournament={mockTournament} onJoin={mockOnJoin} />
    );
    
    fireEvent.click(screen.getByText('Join Tournament'));
    
    await waitFor(() => {
      expect(mockOnJoin).toHaveBeenCalledWith('test-tournament-id');
    });
  });

  it('disables join button when tournament is full', () => {
    const fullTournament = {
      ...mockTournament,
      current_participants: 10
    };
    
    render(<TournamentCard tournament={fullTournament} />);
    
    expect(screen.getByText('Join Tournament')).toBeDisabled();
  });
});
```

#### Hook Testing
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTournament } from './useTournament';

// Mock the service
jest.mock('@/services/TournamentService');

describe('useTournament', () => {
  it('fetches tournament data on mount', async () => {
    const mockTournament = { id: 'test-id', name: 'Test Tournament' };
    
    (TournamentService.getTournament as jest.Mock).mockResolvedValue(mockTournament);
    
    const { result } = renderHook(() => useTournament('test-id'));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tournament).toEqual(mockTournament);
    });
  });

  it('handles errors gracefully', async () => {
    const error = new Error('Failed to fetch');
    
    (TournamentService.getTournament as jest.Mock).mockRejectedValue(error);
    
    const { result } = renderHook(() => useTournament('test-id'));
    
    await waitFor(() => {
      expect(result.current.error).toEqual(error);
      expect(result.current.loading).toBe(false);
    });
  });
});
```

### 2. Integration Testing

#### API Integration
```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { TournamentService } from '@/services/TournamentService';

const server = setupServer(
  rest.get('/rest/v1/tournaments', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', name: 'Tournament 1' },
        { id: '2', name: 'Tournament 2' }
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TournamentService Integration', () => {
  it('fetches tournaments successfully', async () => {
    const tournaments = await TournamentService.getTournaments();
    
    expect(tournaments).toHaveLength(2);
    expect(tournaments[0].name).toBe('Tournament 1');
  });
});
```

## 🚀 Performance Guidelines

### 1. React Performance

#### Memoization
```typescript
// ✅ Good: Memoizing expensive calculations
export const TournamentBracket = ({ matches }: TournamentBracketProps) => {
  const bracketStructure = useMemo(() => {
    return organizeMatchesIntoBracket(matches);
  }, [matches]);

  const handleMatchUpdate = useCallback((matchId: string, result: MatchResult) => {
    // Handle match update
  }, []);

  return (
    <div className="tournament-bracket">
      {bracketStructure.rounds.map((round) => (
        <BracketRound
          key={round.number}
          round={round}
          onMatchUpdate={handleMatchUpdate}
        />
      ))}
    </div>
  );
};

// ✅ Good: Memoizing components that receive complex props
export const BracketRound = React.memo<BracketRoundProps>(({ round, onMatchUpdate }) => {
  return (
    <div className="bracket-round">
      {round.matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onUpdate={onMatchUpdate}
        />
      ))}
    </div>
  );
});
```

#### Code Splitting
```typescript
// ✅ Good: Route-based code splitting
import { lazy, Suspense } from 'react';

const TournamentPage = lazy(() => import('@/pages/TournamentPage'));
const ClubManagementPage = lazy(() => import('@/pages/ClubManagementPage'));

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/tournaments" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <TournamentPage />
            </Suspense>
          } 
        />
        <Route 
          path="/club-management" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ClubManagementPage />
            </Suspense>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};
```

### 2. Bundle Optimization

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'data-layer': ['@supabase/supabase-js'],
          'chart-vendor': ['recharts']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js']
  }
});
```

## 🔒 Security Guidelines

### 1. Input Validation

#### Zod Schemas
```typescript
import { z } from 'zod';

// ✅ Good: Comprehensive validation schema
export const tournamentSchema = z.object({
  name: z.string()
    .min(3, 'Tournament name must be at least 3 characters')
    .max(100, 'Tournament name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Tournament name contains invalid characters'),
  
  tournament_type: z.enum(['single_elimination', 'double_elimination']),
  
  max_participants: z.number()
    .int('Must be a whole number')
    .min(4, 'Minimum 4 participants')
    .max(64, 'Maximum 64 participants'),
  
  entry_fee: z.number()
    .min(0, 'Entry fee cannot be negative')
    .max(10000000, 'Entry fee is too high'),
  
  registration_end: z.date()
    .refine(date => date > new Date(), 'Registration end must be in the future')
});

// Usage in service
export class TournamentService {
  static async createTournament(data: unknown): Promise<Tournament> {
    // Validate and transform input
    const validated = tournamentSchema.parse(data);
    
    // Proceed with database operation
    const result = await supabase.from('tournaments').insert(validated);
    return result.data;
  }
}
```

### 2. Authentication & Authorization

#### Route Protection
```typescript
// ✅ Good: Protected route component
export const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { userRole } = useUserRole(user?.id);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Usage
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## 📱 Mobile Development

### 1. Responsive Design

#### Mobile-First Approach
```typescript
// ✅ Good: Mobile-first responsive component
export const TournamentGrid = ({ tournaments }: TournamentGridProps) => {
  return (
    <div className="
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4 
      gap-4 
      p-4
    ">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
};
```

#### Touch Interactions
```typescript
// ✅ Good: Touch-friendly interactions
export const SwipeableCard = ({ children, onSwipeLeft, onSwipeRight }) => {
  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div 
      {...handlers}
      className="touch-pan-y select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
};
```

## 🔄 State Management

### 1. Context + Hooks Pattern

#### Global State Context
```typescript
interface AppState {
  user: User | null;
  tournaments: Tournament[];
  loading: boolean;
  error: Error | null;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
};

// ✅ Good: Custom hooks for specific state slices
export const useAuth = () => {
  const { state } = useAppState();
  return {
    user: state.user,
    isAuthenticated: !!state.user,
    loading: state.loading
  };
};

export const useTournaments = () => {
  const { state, dispatch } = useAppState();
  
  const addTournament = useCallback((tournament: Tournament) => {
    dispatch({ type: 'ADD_TOURNAMENT', payload: tournament });
  }, [dispatch]);
  
  return {
    tournaments: state.tournaments,
    addTournament
  };
};
```

## 📚 Documentation

### 1. Component Documentation

#### JSDoc Comments
```typescript
/**
 * Tournament card component for displaying tournament information
 * 
 * @example
 * ```tsx
 * <TournamentCard 
 *   tournament={tournament}
 *   onJoin={(id) => handleJoin(id)}
 *   className="custom-card"
 * />
 * ```
 */
export interface TournamentCardProps {
  /** Tournament data to display */
  tournament: Tournament;
  /** Callback fired when user clicks join button */
  onJoin?: (tournamentId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays tournament information in a card format with join functionality
 */
export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onJoin,
  className
}) => {
  // Component implementation
};
```

### 2. API Documentation

#### OpenAPI/Swagger Comments
```typescript
/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Get list of tournaments
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [registration_open, ongoing, completed]
 *         description: Filter by tournament status
 *     responses:
 *       200:
 *         description: List of tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 */
```

## 🔍 Debugging

### 1. Debug Configuration

#### VS Code Launch Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vite/bin/vite.js",
      "args": ["dev"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "sourceMaps": true
    }
  ]
}
```

#### React Developer Tools
```typescript
// ✅ Good: Development helpers
if (process.env.NODE_ENV === 'development') {
  // Enable React DevTools profiler
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot = (id, root) => {
    console.log('React render:', { id, root });
  };
}
```

### 2. Logging Strategy

#### Structured Logging
```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private static level = process.env.NODE_ENV === 'production' 
    ? LogLevel.ERROR 
    : LogLevel.DEBUG;

  static debug(message: string, data?: any) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  static info(message: string, data?: any) {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  static warn(message: string, data?: any) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  static error(message: string, error?: Error | any) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error);
      
      // Send to error reporting in production
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error || new Error(message));
      }
    }
  }
}

// Usage
Logger.info('Tournament created', { tournamentId: 'abc123' });
Logger.error('Failed to submit score', error);
```

---

**Last Updated**: August 30, 2025  
**Version**: 1.0.0  
**Guide Status**: Comprehensive  

> "Complete developer guide for building scalable React applications with TypeScript"
