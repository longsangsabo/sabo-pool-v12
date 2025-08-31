# 🎯 VÍ DỤ THỰC TẾ: TOURNAMENT CREATION FLOW

## 📋 FLOW HOÀN CHỈNH TỪ UI ĐẾN DATABASE

### 1. USER INTERACTION (Frontend)
```tsx
// File: /components/tournament/EnhancedTournamentForm.tsx
const TournamentForm = () => {
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    description: '',
    max_participants: 16,
    entry_fee: 50000,
    tournament_start: '',
    venue_address: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Call service layer - NO DIRECT SUPABASE!
    const result = await tournamentService.createTournament(
      formData, 
      user.id, 
      { clubId: selectedClub?.id }
    );

    if (result.success) {
      toast.success('Tournament created successfully!');
      router.push(`/tournaments/${result.data.tournament.id}`);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form inputs */}
    </form>
  );
};
```

### 2. SERVICE LAYER (Business Logic)
```typescript
// File: /packages/shared-business/src/tournament/TournamentService.ts
export class TournamentService {
  async createTournament(
    data: TournamentFormData, 
    userId: string,
    options?: { clubId?: string }
  ): Promise<TournamentServiceResult<TournamentCreationResult>> {
    try {
      // 🔍 STEP 1: Business validation
      const validationErrors = this.businessLogic.validateTournament(data);
      if (Object.keys(validationErrors).length > 0) {
        return {
          success: false,
          error: `Validation failed: ${Object.values(validationErrors).join(', ')}`
        };
      }

      // 🧮 STEP 2: Calculate business rules
      const tournamentData: TournamentData = {
        name: data.name,
        description: data.description || '',
        tournament_type: 'single_elimination',
        max_participants: data.max_participants,
        entry_fee: data.entry_fee,
        prize_pool: this.businessLogic.calculatePrizePool(
          data.entry_fee, 
          data.max_participants
        ),
        tournament_start: data.tournament_start,
        venue_address: data.venue_address || '',
        status: 'upcoming',
        created_by: userId,
        club_id: options?.clubId
      };

      // 💾 STEP 3: Save to database via API service
      const createResult = await this.apiService.createTournament(tournamentData);
      if (!createResult.success) {
        return createResult;
      }

      // 🏆 STEP 4: Generate and save prizes
      const prizeBreakdown = this.businessLogic.calculatePrizeDistribution(
        tournamentData.prize_pool,
        tournamentData.max_participants
      );

      const prizes = [
        {
          position: 1,
          cashPrize: prizeBreakdown.first_prize,
          eloPoints: 100,
          spaPoints: 1000,
          items: ['Cúp vô địch', 'Huy chương vàng']
        },
        {
          position: 2,
          cashPrize: prizeBreakdown.second_prize,
          eloPoints: 70,
          spaPoints: 700,
          items: ['Huy chương bạc']
        }
      ];

      await this.apiService.saveTournamentPrizes(
        createResult.data.tournament.id!, 
        prizes
      );

      // 🚀 STEP 5: Cache invalidation
      CacheInvalidationManager.invalidateTournamentData(
        createResult.data.tournament.id!,
        userId
      );

      return {
        success: true,
        data: {
          tournament: createResult.data.tournament,
          bracket_initialized: false
        },
        message: 'Tournament created successfully'
      };

    } catch (error: any) {
      console.error('❌ Error in createTournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to create tournament'
      };
    }
  }
}
```

### 3. API SERVICE LAYER (Database Operations)
```typescript
// File: /packages/shared-business/src/tournament/TournamentAPIService.ts
export class TournamentAPIService {
  async createTournament(data: TournamentData): Promise<ServiceResult<Tournament>> {
    try {
      // ONLY HERE we interact with Supabase
      const { data: tournament, error } = await this.supabaseClient
        .from('tournaments')
        .insert([data])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        data: tournament,
        message: 'Tournament created in database'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async saveTournamentPrizes(tournamentId: string, prizes: PrizeData[]): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await this.supabaseClient
        .from('tournament_prizes')
        .insert(
          prizes.map(prize => ({
            ...prize,
            tournament_id: tournamentId
          }))
        );

      if (error) throw error;

      return { success: true, data: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

### 4. REAL-TIME UPDATES (Automatic)
```typescript
// File: /hooks/useRealtimeTournaments.tsx
export const useRealtimeTournaments = (clubId?: string) => {
  useEffect(() => {
    if (!clubId) return;

    // Subscribe to tournament changes
    const channel = supabase
      .channel('tournament-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournaments',
        filter: `club_id=eq.${clubId}`
      }, payload => {
        console.log('Tournament updated:', payload);
        // Trigger UI refresh
        queryClient.invalidateQueries(['tournaments', clubId]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId]);
};
```

## 🔄 COMPLETE DATA FLOW DIAGRAM

```
[User Form Input]
        │
        ▼
[Form Validation (Client)]
        │
        ▼
[Tournament Service] 
        │ (Business Logic)
        ├─ Validate tournament data
        ├─ Calculate prize pool
        ├─ Apply business rules
        └─ Format data
        │
        ▼
[Tournament API Service]
        │ (Database Operations)
        ├─ Insert tournament
        ├─ Insert prizes
        └─ Return results
        │
        ▼
[Supabase Database]
        │ (Triggers real-time)
        ▼
[Real-time Listeners]
        │ (Update caches)
        ▼
[UI Components Refresh]
        │
        ▼
[User sees new tournament]
```
