# 🤖 AI Assistant Code Standards & Best Practices

> **CODING STANDARDS** for AI assistants working on SABO Arena

## 🎯 TypeScript Standards

### **Type Safety Rules**
```typescript
// ✅ CORRECT: Proper typing
interface TournamentProps {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'upcoming';
  participants: Player[];
}

const Tournament: React.FC<TournamentProps> = ({ id, name, status, participants }) => {
  // Implementation
}

// ❌ WRONG: Any types or missing interfaces
const Tournament = (props: any) => {
  // Don't use any types
}
```

### **Import Organization**
```typescript
// ✅ CORRECT: Organized imports
// 1. React and external libraries
import React from 'react';
import { useState, useEffect } from 'react';
import { z } from 'zod';

// 2. Internal packages (shared)
import { Button } from '@/packages/shared-ui';
import { useAuth } from '@/packages/shared-auth';
import { Tournament } from '@/packages/shared-types';

// 3. Relative imports
import { TournamentCard } from './TournamentCard';
import { useTournamentData } from '../hooks/useTournamentData';

// ❌ WRONG: Mixed import order
import { TournamentCard } from './TournamentCard';
import React from 'react';
import { Button } from '@/packages/shared-ui';
```

---

## 🎨 React Component Standards

### **Component Structure**
```typescript
// ✅ CORRECT: Proper component structure
interface ComponentProps {
  title: string;
  onAction?: () => void;
  variant?: 'primary' | 'secondary';
}

export const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  onAction, 
  variant = 'primary' 
}) => {
  // Hooks at the top
  const [state, setState] = useState('');
  const { user } = useAuth();
  
  // Event handlers
  const handleClick = useCallback(() => {
    onAction?.();
  }, [onAction]);
  
  // Early returns for loading/error states
  if (!user) {
    return <div>Loading...</div>;
  }
  
  // Main render
  return (
    <div className="component-wrapper">
      <h2>{title}</h2>
      <Button variant={variant} onClick={handleClick}>
        Action
      </Button>
    </div>
  );
};

// Named export for better tree-shaking
export default MyComponent;
```

### **Hook Standards**
```typescript
// ✅ CORRECT: Custom hook pattern
export const useTournamentData = (tournamentId: string) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const data = await tournamentService.getById(tournamentId);
        setTournament(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournament();
  }, [tournamentId]);
  
  return { tournament, loading, error };
};
```

---

## 🎭 State Management Standards

### **Zustand Store Pattern**
```typescript
// ✅ CORRECT: Zustand store structure
interface TournamentStore {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTournaments: () => Promise<void>;
  selectTournament: (id: string) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  clearError: () => void;
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: [],
  selectedTournament: null,
  loading: false,
  error: null,
  
  fetchTournaments: async () => {
    set({ loading: true, error: null });
    try {
      const tournaments = await tournamentService.getAll();
      set({ tournaments, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tournaments',
        loading: false 
      });
    }
  },
  
  selectTournament: (id: string) => {
    const tournaments = get().tournaments;
    const tournament = tournaments.find(t => t.id === id) || null;
    set({ selectedTournament: tournament });
  },
  
  updateTournament: (id: string, updates: Partial<Tournament>) => {
    set(state => ({
      tournaments: state.tournaments.map(t => 
        t.id === id ? { ...t, ...updates } : t
      )
    }));
  },
  
  clearError: () => set({ error: null })
}));
```

---

## 🔄 API Integration Standards

### **Service Layer Pattern**
```typescript
// ✅ CORRECT: Service layer with error handling
class TournamentService {
  private supabase = createClient();
  
  async getAll(): Promise<Tournament[]> {
    const { data, error } = await this.supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Failed to fetch tournaments: ${error.message}`);
    }
    
    return data.map(this.mapToTournament);
  }
  
  async getById(id: string): Promise<Tournament> {
    const { data, error } = await this.supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      throw new Error(`Failed to fetch tournament: ${error.message}`);
    }
    
    return this.mapToTournament(data);
  }
  
  private mapToTournament(data: any): Tournament {
    return {
      id: data.id,
      name: data.name,
      status: data.status as TournamentStatus,
      createdAt: new Date(data.created_at),
      // ... other mappings
    };
  }
}

export const tournamentService = new TournamentService();
```

### **React Query Integration**
```typescript
// ✅ CORRECT: React Query hooks
export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: () => tournamentService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: () => tournamentService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tournament: CreateTournamentRequest) => 
      tournamentService.create(tournament),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};
```

---

## 🎨 Styling Standards

### **Tailwind CSS Patterns**
```typescript
// ✅ CORRECT: Organized Tailwind classes
const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  return (
    <div className={cn(
      // Layout
      "flex flex-col p-6 rounded-lg",
      // Background & borders
      "bg-white border border-gray-200 shadow-sm",
      // Spacing & sizing
      "w-full max-w-sm min-h-[200px]",
      // Interactions
      "hover:shadow-md transition-shadow duration-200",
      // Responsive
      "md:max-w-md lg:max-w-lg"
    )}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {tournament.name}
      </h3>
      <StatusBadge status={tournament.status} />
    </div>
  );
};

// ❌ WRONG: Inline styles or long class strings
const BadCard = () => (
  <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
    <div className="flex flex-col p-6 rounded-lg bg-white border border-gray-200 shadow-sm w-full max-w-sm min-h-[200px] hover:shadow-md transition-shadow duration-200 md:max-w-md lg:max-w-lg">
  </div>
);
```

### **Design Token Usage**
```typescript
// ✅ CORRECT: Use design tokens
import { colors, spacing, typography } from '@/packages/design-tokens';

const StyledButton = styled.button`
  background-color: ${colors.primary.main};
  padding: ${spacing.md} ${spacing.lg};
  font-size: ${typography.body.fontSize};
  border-radius: ${spacing.sm};
  
  &:hover {
    background-color: ${colors.primary.dark};
  }
`;

// ❌ WRONG: Hardcoded values
const BadButton = styled.button`
  background-color: #3498db;
  padding: 12px 16px;
  font-size: 14px;
`;
```

---

## 🔒 Security Standards

### **Authentication Patterns**
```typescript
// ✅ CORRECT: Secure authentication check
export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);
  
  return { user, loading };
};

// Component usage
const ProtectedComponent = () => {
  const { user, loading } = useRequireAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return null; // Will redirect
  
  return <div>Protected content</div>;
};
```

### **Input Validation**
```typescript
// ✅ CORRECT: Zod validation
import { z } from 'zod';

const CreateTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  maxParticipants: z.number().min(4).max(64),
  entryFee: z.number().min(0),
});

type CreateTournamentRequest = z.infer<typeof CreateTournamentSchema>;

const CreateTournamentForm = () => {
  const [formData, setFormData] = useState<CreateTournamentRequest>({
    name: '',
    maxParticipants: 16,
    entryFee: 0,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validData = CreateTournamentSchema.parse(formData);
      // Proceed with valid data
      createTournament(validData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        setErrors(error.errors);
      }
    }
  };
};
```

---

## 🧪 Testing Standards

### **Component Testing**
```typescript
// ✅ CORRECT: Component test structure
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TournamentCard } from './TournamentCard';

const mockTournament: Tournament = {
  id: '1',
  name: 'Test Tournament',
  status: 'active',
  participants: [],
  createdAt: new Date(),
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('TournamentCard', () => {
  it('renders tournament information correctly', () => {
    renderWithProviders(<TournamentCard tournament={mockTournament} />);
    
    expect(screen.getByText('Test Tournament')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
  
  it('handles click events', async () => {
    const onClickMock = jest.fn();
    
    renderWithProviders(
      <TournamentCard tournament={mockTournament} onClick={onClickMock} />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(onClickMock).toHaveBeenCalledWith(mockTournament.id);
    });
  });
});
```

### **Hook Testing**
```typescript
// ✅ CORRECT: Hook testing with renderHook
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTournaments } from './useTournaments';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTournaments', () => {
  it('fetches tournaments successfully', async () => {
    const { result } = renderHook(() => useTournaments(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
```

---

## ⚡ Performance Standards

### **Code Splitting**
```typescript
// ✅ CORRECT: Lazy loading for large components
import { lazy, Suspense } from 'react';

const TournamentDetails = lazy(() => import('./TournamentDetails'));
const PlayerManagement = lazy(() => import('./PlayerManagement'));

const TournamentPage = () => {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <TournamentDetails />
      </Suspense>
      
      <Suspense fallback={<div>Loading players...</div>}>
        <PlayerManagement />
      </Suspense>
    </div>
  );
};
```

### **Memoization Patterns**
```typescript
// ✅ CORRECT: Proper memoization
const TournamentList = ({ tournaments }: { tournaments: Tournament[] }) => {
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => t.status === 'active');
  }, [tournaments]);
  
  const handleTournamentClick = useCallback((id: string) => {
    navigate(`/tournaments/${id}`);
  }, [navigate]);
  
  return (
    <div>
      {filteredTournaments.map(tournament => (
        <TournamentCard
          key={tournament.id}
          tournament={tournament}
          onClick={handleTournamentClick}
        />
      ))}
    </div>
  );
};
```

---

## 📝 Documentation Standards

### **JSDoc Comments**
```typescript
/**
 * Creates a new tournament with validation and error handling
 * 
 * @param tournamentData - The tournament creation data
 * @param tournamentData.name - Tournament name (3-100 characters)
 * @param tournamentData.maxParticipants - Maximum number of participants (4-64)
 * @param tournamentData.entryFee - Entry fee in VND (minimum 0)
 * 
 * @returns Promise that resolves to the created tournament
 * 
 * @throws {ValidationError} When input data is invalid
 * @throws {DatabaseError} When database operation fails
 * 
 * @example
 * ```typescript
 * const tournament = await createTournament({
 *   name: "Summer Championship",
 *   maxParticipants: 32,
 *   entryFee: 50000
 * });
 * ```
 */
export async function createTournament(
  tournamentData: CreateTournamentRequest
): Promise<Tournament> {
  // Implementation
}
```

---

**Remember**: These standards ensure code quality, maintainability, and team consistency. Follow them religiously! 🎯✨
