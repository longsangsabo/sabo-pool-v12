# SABO POOL ARENA - SERVICE ARCHITECTURE DOCUMENTATION

## 🏗️ SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Components/  │  Hooks/      │  Pages/     │  Contexts/     │
│  - Tournament │  - useAuth   │  - Home     │  - Profile     │
│  - Club       │  - useClub   │  - Club     │  - Tournament  │
│  - Challenge  │  - useMatch  │  - Match    │  - Auth        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Authentication │  Tournament    │  Club         │  Match   │
│  - userService  │  - tournament  │  - clubService│  - match │
│  - authService  │    Service     │  - verification│   Service│
│                 │  - challenge   │    Service    │          │
│                 │    Service     │               │          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
├─────────────────────────────────────────────────────────────┤
│             Supabase Client (Centralized)                   │
│  - Database Operations                                      │
│  - Real-time Subscriptions                                 │
│  - Authentication                                           │
│  - File Storage                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 DATA FLOW EXAMPLE: TOURNAMENT CREATION

```
USER INPUT
    │
    ▼
[TournamentForm.tsx]
    │ (calls)
    ▼
[tournamentService.createTournament()]
    │ (validates & processes)
    ▼
[supabase.from('tournaments').insert()]
    │ (database operation)
    ▼
[Real-time notification]
    │ (triggers)
    ▼
[useRealtimeTournaments hook]
    │ (updates)
    ▼
[UI Components refresh]
```
