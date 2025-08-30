# SABO Tournament Engine v2.0 - Official Functions Documentation

## 🎯 **OVERVIEW**
SABOTournamentEngine is the new official tournament management system that integrates 10 working SABO functions and replaces all legacy tournament functions.

## 📋 **FUNCTION MAPPING**

### ✅ **ACTIVE FUNCTIONS (Use These)**

| **Method** | **Purpose** | **Replaces** |
|------------|-------------|--------------|
| `SABOTournamentEngine.submitScoreAndProcessAdvancement()` | Submit score + auto advance | `submit_sabo_match_score()` + `advance_sabo_tournament()` |
| `SABOTournamentEngine.processAutomaticAdvancement()` | Process tournament advancement | `advance_sabo_tournament()` + `assign_participant_to_next_match()` |
| `SABOTournamentEngine.getTournamentStatusAndActions()` | Get status + recommendations | Manual status checking |

### 🔧 **INTERNAL SABO FUNCTIONS (Auto-called)**

| **Function** | **Round** | **Purpose** | **Status** |
|--------------|-----------|-------------|------------|
| `process_winners_round2_completion` | Winners R2 | Process Winners Round 2 | ✅ Working |
| `process_winners_round3_completion` | Winners R3 | Process Winners Round 3 | ✅ Working |
| `process_losers_r101_completion` | Losers R101 | Process Losers Round 101 | ✅ Working |
| `process_losers_r102_completion` | Losers R102 | Process Losers Round 102 | ✅ Working |
| `process_losers_r103_completion` | Losers R103 | Process Losers Round 103 | ✅ Working |
| `process_losers_r201_completion` | Losers R201 | Process Losers Round 201 | ✅ Working |
| `process_losers_r202_completion` | Losers R202 | Process Losers Round 202 | ✅ Working |
| `process_semifinals_completion` | Semifinals | Process Semifinals | ✅ Working |
| `process_grand_final_completion` | Grand Final | Process Grand Final | ✅ Working |
| `setup_semifinals_pairings` | Setup | Setup tournament pairings | ✅ Working |

### ❌ **DEPRECATED FUNCTIONS (Do NOT Use)**

| **Function** | **Status** | **Replacement** |
|--------------|------------|-----------------|
| `advance_sabo_tournament()` | DEPRECATED | `SABOTournamentEngine.processAutomaticAdvancement()` |
| `assign_participant_to_next_match()` | DEPRECATED | `SABOTournamentEngine.processAutomaticAdvancement()` |
| Direct `submit_sabo_match_score()` calls | DISCOURAGED | `SABOTournamentEngine.submitScoreAndProcessAdvancement()` |

## 💻 **USAGE EXAMPLES**

### **Score Submission (Recommended)**
```typescript
import { SABOTournamentEngine } from '@/services/tournament/SABOTournamentManager';

// Submit score and auto-advance tournament
const result = await SABOTournamentEngine.submitScoreAndProcessAdvancement(tournamentId, {
  match_id: matchId,
  winner_id: winnerId,
  loser_id: loserId,
  winner_score: 3,
  loser_score: 1,
  match_number: matchNumber,
  round_number: roundNumber,
  bracket_type: bracketType
});

if (result.success) {
  console.log('Score submitted and tournament advanced!');
}
```

### **Manual Advancement**
```typescript
// Process advancement after a match completes
const advanceResult = await SABOTournamentEngine.processAutomaticAdvancement(tournamentId, {
  match_number: 15,
  round_number: 102,
  bracket_type: 'losers'
});
```

### **Tournament Status**
```typescript
// Get comprehensive tournament status
const status = await SABOTournamentEngine.getTournamentStatusAndActions(tournamentId);
console.log(`Ready matches: ${status.readyMatches}`);
console.log(`Next actions:`, status.nextActions);
```

## 🔗 **INTEGRATION POINTS**

### **React Hooks**
- `useSABOScoreSubmission` - Uses SABOTournamentEngine
- `useSABOBracket` - Uses SABOTournamentEngine

### **Components**
- `TournamentManagementHub` - Uses SABOTournamentEngine
- `DoubleEliminationMatchCard` - ⚠️ Needs update to use hook
- `EnhancedMatchCard` - ⚠️ Needs update to use hook

## 🚀 **MIGRATION GUIDE**

### **From Legacy Functions:**
```typescript
// ❌ OLD WAY
const { data } = await supabase.rpc('advance_sabo_tournament', { tournament_id });
const { data } = await supabase.rpc('submit_sabo_match_score', { ... });

// ✅ NEW WAY  
const result = await SABOTournamentEngine.submitScoreAndProcessAdvancement(tournamentId, matchData);
```

### **From Direct RPC Calls:**
```typescript
// ❌ OLD WAY
await supabase.rpc('submit_sabo_match_score', {
  p_match_id: matchId,
  p_player1_score: score1,
  p_player2_score: score2,
  p_submitted_by: userId
});

// ✅ NEW WAY
const { submitScore } = useSABOScoreSubmission(tournamentId);
await submitScore(matchId, { player1: score1, player2: score2 });
```

## 🎯 **BENEFITS**

1. **Automatic Advancement** - No need to manually call advancement functions
2. **Error Handling** - Comprehensive error handling and fallbacks  
3. **Function Mapping** - Automatically calls correct SABO function based on round
4. **Status Tracking** - Built-in tournament status and action recommendations
5. **Type Safety** - Full TypeScript support with proper types
6. **Consistent API** - Single interface for all tournament operations

## 📊 **TESTING**

Run the test suite:
```bash
node test-sabo-manager.mjs
```

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**
1. **"Function not found"** - Check if using deprecated function names
2. **"Tournament not advancing"** - Verify match data includes round_number and bracket_type
3. **"Score submission failed"** - Ensure winner/loser IDs are correct

### **Debug Commands:**
```typescript
// Check tournament status
const status = await SABOTournamentEngine.getTournamentStatusAndActions(tournamentId);
console.log('Tournament Status:', status);
```

## 📝 **VERSION HISTORY**

- **v2.0** - SABOTournamentEngine with 10 working functions
- **v1.x** - Legacy functions (deprecated)

---

**✅ PRODUCTION READY** - All functions tested and verified working
