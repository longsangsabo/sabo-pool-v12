# 🔌 SABO Arena API Documentation

## 📋 API Overview

SABO Arena's backend API provides comprehensive endpoints for tournament management, user operations, and real-time features. Built with Supabase for data persistence and authentication.

---

## 🏗️ API Architecture

### Base Configuration

```typescript
// API Client Configuration
export const apiConfig = {
  baseURL: process.env.VITE_SUPABASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.VITE_SUPABASE_ANON_KEY,
  },
};

// Authenticated Client
export const createAuthenticatedClient = (token: string) => ({
  ...apiConfig,
  headers: {
    ...apiConfig.headers,
    'Authorization': `Bearer ${token}`,
  },
});
```

### Error Handling Strategy

```typescript
interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

class APIClient {
  async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: { ...this.headers, ...options?.headers },
      });
      
      if (!response.ok) {
        throw new APIError({
          code: `HTTP_${response.status}`,
          message: response.statusText,
          timestamp: new Date().toISOString(),
        });
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }
}
```

---

## 🔐 Authentication API

### Authentication Endpoints

#### POST /auth/signin
```typescript
// Login Request
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  session: Session;
  access_token: string;
  refresh_token: string;
}

// Example Usage
const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  
  if (error) throw new Error(error.message);
  
  return {
    user: data.user,
    session: data.session,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
};
```

#### POST /auth/signup
```typescript
// Registration Request
interface SignupRequest {
  email: string;
  password: string;
  metadata?: {
    full_name?: string;
    username?: string;
  };
}

interface SignupResponse {
  user: User | null;
  session: Session | null;
  confirmation_required: boolean;
}

// Example Usage
const registerUser = async (userData: SignupRequest): Promise<SignupResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: userData.metadata,
    },
  });
  
  if (error) throw new Error(error.message);
  
  return {
    user: data.user,
    session: data.session,
    confirmation_required: !data.session,
  };
};
```

#### POST /auth/signout
```typescript
// Logout Request
const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};
```

#### POST /auth/refresh
```typescript
// Token Refresh
const refreshToken = async (): Promise<Session> => {
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error) throw new Error(error.message);
  
  return data.session;
};
```

### Authentication Hooks

```typescript
// Auth State Hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return { user, loading };
};
```

---

## 🏆 Tournament API

### Tournament Data Models

```typescript
interface Tournament {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  type: 'single_elimination' | 'double_elimination' | 'round_robin';
  max_participants: number;
  current_participants: number;
  entry_fee?: number;
  prize_pool?: number;
  start_date: string;
  end_date?: string;
  rules?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  settings?: TournamentSettings;
}

interface TournamentSettings {
  allow_late_registration: boolean;
  auto_advance_winners: boolean;
  randomize_seeding: boolean;
  require_check_in: boolean;
  check_in_duration: number; // minutes
}
```

### Tournament Endpoints

#### GET /tournaments
```typescript
interface TournamentListParams {
  status?: Tournament['status'];
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: 'created_at' | 'start_date' | 'name';
  sort_order?: 'asc' | 'desc';
}

interface TournamentListResponse {
  tournaments: Tournament[];
  total_count: number;
  page: number;
  has_more: boolean;
}

// Example Usage
const fetchTournaments = async (params: TournamentListParams = {}): Promise<TournamentListResponse> => {
  let query = supabase
    .from('tournaments')
    .select('*', { count: 'exact' });
  
  if (params.status) {
    query = query.eq('status', params.status);
  }
  
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }
  
  const { data, error, count } = await query
    .order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' })
    .range(
      (params.page || 0) * (params.limit || 10),
      ((params.page || 0) + 1) * (params.limit || 10) - 1
    );
  
  if (error) throw new Error(error.message);
  
  return {
    tournaments: data || [],
    total_count: count || 0,
    page: params.page || 0,
    has_more: (count || 0) > ((params.page || 0) + 1) * (params.limit || 10),
  };
};
```

#### GET /tournaments/:id
```typescript
interface TournamentDetailsResponse extends Tournament {
  participants: TournamentParticipant[];
  matches: Match[];
  brackets?: BracketStructure;
}

const fetchTournamentDetails = async (tournamentId: string): Promise<TournamentDetailsResponse> => {
  const { data, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      tournament_participants:tournament_participants(*),
      matches:matches(*)
    `)
    .eq('id', tournamentId)
    .single();
  
  if (error) throw new Error(error.message);
  
  return data;
};
```

#### POST /tournaments
```typescript
interface CreateTournamentRequest {
  name: string;
  description?: string;
  type: Tournament['type'];
  max_participants: number;
  entry_fee?: number;
  prize_pool?: number;
  start_date: string;
  rules?: string;
  settings?: TournamentSettings;
}

const createTournament = async (tournamentData: CreateTournamentRequest): Promise<Tournament> => {
  const { data, error } = await supabase
    .from('tournaments')
    .insert({
      ...tournamentData,
      status: 'draft',
      current_participants: 0,
    })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  return data;
};
```

#### PUT /tournaments/:id
```typescript
interface UpdateTournamentRequest {
  name?: string;
  description?: string;
  status?: Tournament['status'];
  max_participants?: number;
  entry_fee?: number;
  prize_pool?: number;
  start_date?: string;
  end_date?: string;
  rules?: string;
  settings?: TournamentSettings;
}

const updateTournament = async (
  tournamentId: string,
  updates: UpdateTournamentRequest
): Promise<Tournament> => {
  const { data, error } = await supabase
    .from('tournaments')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tournamentId)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  return data;
};
```

#### DELETE /tournaments/:id
```typescript
const deleteTournament = async (tournamentId: string): Promise<void> => {
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', tournamentId);
  
  if (error) throw new Error(error.message);
};
```

### Tournament Registration

#### POST /tournaments/:id/register
```typescript
interface RegistrationRequest {
  user_id?: string; // Optional for authenticated users
  team_name?: string; // For team tournaments
  additional_info?: Record<string, any>;
}

interface RegistrationResponse {
  participant: TournamentParticipant;
  tournament: Tournament;
  payment_required: boolean;
  payment_url?: string;
}

const registerForTournament = async (
  tournamentId: string,
  registrationData: RegistrationRequest = {}
): Promise<RegistrationResponse> => {
  const { data, error } = await supabase.rpc('register_for_tournament', {
    tournament_id: tournamentId,
    registration_data: registrationData,
  });
  
  if (error) throw new Error(error.message);
  
  return data;
};
```

#### DELETE /tournaments/:id/register
```typescript
const unregisterFromTournament = async (tournamentId: string): Promise<void> => {
  const { error } = await supabase
    .from('tournament_participants')
    .delete()
    .eq('tournament_id', tournamentId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
  
  if (error) throw new Error(error.message);
};
```

---

## 🎮 Match API

### Match Data Models

```typescript
interface Match {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  participant1_id?: string;
  participant2_id?: string;
  winner_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  score?: MatchScore;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

interface MatchScore {
  participant1_score: number;
  participant2_score: number;
  sets?: SetScore[];
  additional_data?: Record<string, any>;
}

interface SetScore {
  set_number: number;
  participant1_score: number;
  participant2_score: number;
}
```

### Match Endpoints

#### GET /tournaments/:id/matches
```typescript
interface MatchListParams {
  round?: number;
  status?: Match['status'];
  participant_id?: string;
}

const fetchTournamentMatches = async (
  tournamentId: string,
  params: MatchListParams = {}
): Promise<Match[]> => {
  let query = supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId);
  
  if (params.round) {
    query = query.eq('round', params.round);
  }
  
  if (params.status) {
    query = query.eq('status', params.status);
  }
  
  if (params.participant_id) {
    query = query.or(`participant1_id.eq.${params.participant_id},participant2_id.eq.${params.participant_id}`);
  }
  
  const { data, error } = await query.order('round').order('match_number');
  
  if (error) throw new Error(error.message);
  
  return data || [];
};
```

#### PUT /matches/:id/score
```typescript
interface UpdateMatchScoreRequest {
  score: MatchScore;
  winner_id?: string;
  status?: 'in_progress' | 'completed';
}

const updateMatchScore = async (
  matchId: string,
  scoreData: UpdateMatchScoreRequest
): Promise<Match> => {
  const { data, error } = await supabase
    .from('matches')
    .update({
      score: scoreData.score,
      winner_id: scoreData.winner_id,
      status: scoreData.status,
      end_time: scoreData.status === 'completed' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  return data;
};
```

---

## 👤 User API

### User Data Models

```typescript
interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'banned';
  preferences?: UserPreferences;
  stats?: UserStats;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
}

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    tournament_updates: boolean;
    match_reminders: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    show_stats: boolean;
    show_tournaments: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

interface UserStats {
  tournaments_played: number;
  tournaments_won: number;
  matches_played: number;
  matches_won: number;
  win_rate: number;
  current_streak: number;
  best_streak: number;
  total_prize_money: number;
}
```

### User Endpoints

#### GET /users/profile
```typescript
const fetchUserProfile = async (): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();
  
  if (error) throw new Error(error.message);
  
  return data;
};
```

#### PUT /users/profile
```typescript
interface UpdateProfileRequest {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  preferences?: UserPreferences;
}

const updateUserProfile = async (updates: UpdateProfileRequest): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  return data;
};
```

#### GET /users/stats
```typescript
const fetchUserStats = async (userId?: string): Promise<UserStats> => {
  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
  
  const { data, error } = await supabase.rpc('get_user_stats', {
    user_id: targetUserId,
  });
  
  if (error) throw new Error(error.message);
  
  return data;
};
```

#### GET /users/tournaments
```typescript
interface UserTournamentsParams {
  status?: Tournament['status'];
  role?: 'participant' | 'organizer';
  page?: number;
  limit?: number;
}

const fetchUserTournaments = async (params: UserTournamentsParams = {}) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  let query = supabase
    .from('tournament_participants')
    .select(`
      *,
      tournament:tournaments(*)
    `)
    .eq('user_id', userId);
  
  if (params.status) {
    query = query.eq('tournament.status', params.status);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(
      (params.page || 0) * (params.limit || 10),
      ((params.page || 0) + 1) * (params.limit || 10) - 1
    );
  
  if (error) throw new Error(error.message);
  
  return data?.map(item => item.tournament) || [];
};
```

---

## 🔔 Notification API

### Notification Data Models

```typescript
interface Notification {
  id: string;
  user_id: string;
  type: 'tournament_update' | 'match_reminder' | 'registration_confirmed' | 'prize_awarded';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  expires_at?: string;
}
```

### Notification Endpoints

#### GET /notifications
```typescript
interface NotificationListParams {
  read?: boolean;
  type?: Notification['type'];
  page?: number;
  limit?: number;
}

const fetchNotifications = async (params: NotificationListParams = {}) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
  
  if (params.read !== undefined) {
    query = query.eq('read', params.read);
  }
  
  if (params.type) {
    query = query.eq('type', params.type);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(
      (params.page || 0) * (params.limit || 20),
      ((params.page || 0) + 1) * (params.limit || 20) - 1
    );
  
  if (error) throw new Error(error.message);
  
  return data || [];
};
```

#### PUT /notifications/:id/read
```typescript
const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
  
  if (error) throw new Error(error.message);
};
```

#### PUT /notifications/mark-all-read
```typescript
const markAllNotificationsAsRead = async (): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .eq('read', false);
  
  if (error) throw new Error(error.message);
};
```

---

## 📊 Analytics API

### Analytics Data Models

```typescript
interface EventTrackingData {
  event_name: string;
  user_id?: string;
  session_id: string;
  timestamp: string;
  properties: Record<string, any>;
  page_url?: string;
  user_agent?: string;
}

interface PerformanceMetrics {
  page_load_time: number;
  first_contentful_paint: number;
  time_to_interactive: number;
  bundle_size: number;
  api_response_time: number;
}
```

### Analytics Endpoints

#### POST /analytics/events
```typescript
const trackEvent = async (eventData: Omit<EventTrackingData, 'timestamp' | 'session_id'>) => {
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      ...eventData,
      timestamp: new Date().toISOString(),
      session_id: generateSessionId(),
    });
  
  if (error) console.error('Analytics tracking error:', error);
};
```

#### POST /analytics/performance
```typescript
const trackPerformance = async (metrics: PerformanceMetrics) => {
  const { error } = await supabase
    .from('performance_metrics')
    .insert({
      ...metrics,
      timestamp: new Date().toISOString(),
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });
  
  if (error) console.error('Performance tracking error:', error);
};
```

---

## 🔄 Real-time API

### Real-time Subscriptions

```typescript
// Tournament Updates Subscription
export const useTournamentUpdates = (tournamentId: string) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  
  useEffect(() => {
    const subscription = supabase
      .channel(`tournament_${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTournament(payload.new as Tournament);
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [tournamentId]);
  
  return tournament;
};

// Match Updates Subscription
export const useMatchUpdates = (tournamentId: string) => {
  const [matches, setMatches] = useState<Match[]>([]);
  
  useEffect(() => {
    const subscription = supabase
      .channel(`tournament_matches_${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setMatches(prev => 
              prev.map(match => 
                match.id === payload.new.id ? payload.new as Match : match
              )
            );
          } else if (payload.eventType === 'INSERT') {
            setMatches(prev => [...prev, payload.new as Match]);
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [tournamentId]);
  
  return matches;
};
```

---

## 🛠️ API Utilities

### Request Interceptors

```typescript
// Auth Token Interceptor
export const createAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const session = await supabase.auth.getSession();
  
  if (!session.data.session) {
    throw new Error('Authentication required');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session.data.session.access_token}`,
    },
  });
};

// Retry Logic
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw new Error('Max retries exceeded');
};
```

### Response Transformers

```typescript
// Date String to Date Object
export const transformDates = <T extends Record<string, any>>(obj: T): T => {
  const dateFields = ['created_at', 'updated_at', 'start_date', 'end_date', 'start_time', 'end_time'];
  
  const transformed = { ...obj };
  
  dateFields.forEach(field => {
    if (transformed[field] && typeof transformed[field] === 'string') {
      transformed[field] = new Date(transformed[field] as string);
    }
  });
  
  return transformed;
};

// Camel Case Converter
export const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  });
  
  return result;
};
```

---

## 📈 Rate Limiting & Quotas

### Rate Limit Configuration

| Endpoint Category | Requests per Minute | Burst Limit |
|------------------|-------------------|--------------|
| Authentication | 10 | 15 |
| Tournament Read | 100 | 150 |
| Tournament Write | 20 | 30 |
| Match Updates | 50 | 75 |
| User Profile | 30 | 45 |
| Analytics | 500 | 1000 |

### Rate Limit Headers

```typescript
interface RateLimitHeaders {
  'X-RateLimit-Limit': string;      // Requests per window
  'X-RateLimit-Remaining': string;  // Remaining requests
  'X-RateLimit-Reset': string;      // Reset time (Unix timestamp)
}

// Rate Limit Handler
export const handleRateLimit = (response: Response) => {
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const waitTime = resetTime ? parseInt(resetTime) * 1000 - Date.now() : 60000;
    
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
  }
};
```

---

## 🔍 API Testing

### Test Utilities

```typescript
// Mock API Response
export const mockApiResponse = <T>(data: T, delay: number = 100): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// API Test Helper
export const testApiEndpoint = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
) => {
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return {
    status: response.status,
    data: await response.json(),
    headers: Object.fromEntries(response.headers.entries()),
  };
};
```

### Example Tests

```typescript
describe('Tournament API', () => {
  test('should fetch tournaments successfully', async () => {
    const response = await testApiEndpoint('/api/tournaments');
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('tournaments');
    expect(Array.isArray(response.data.tournaments)).toBe(true);
  });
  
  test('should create tournament with valid data', async () => {
    const tournamentData = {
      name: 'Test Tournament',
      type: 'single_elimination',
      max_participants: 16,
    };
    
    const response = await testApiEndpoint('/api/tournaments', 'POST', tournamentData);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe(tournamentData.name);
  });
});
```

---

## 📚 API Best Practices

### Request Optimization

1. **Batch Requests**: Group related API calls
2. **Caching**: Implement response caching where appropriate
3. **Pagination**: Use pagination for large datasets
4. **Field Selection**: Request only needed fields

### Error Handling

1. **Consistent Format**: Standardized error response structure
2. **Descriptive Messages**: Clear, actionable error messages
3. **Status Codes**: Proper HTTP status code usage
4. **Retry Logic**: Implement exponential backoff for retries

### Security Considerations

1. **Input Validation**: Validate all inputs server-side
2. **Authentication**: Secure all protected endpoints
3. **Authorization**: Implement proper access controls
4. **Rate Limiting**: Prevent abuse with rate limiting

---

*Last Updated: August 28, 2025 - SABO Arena API Documentation v1.0.0*
