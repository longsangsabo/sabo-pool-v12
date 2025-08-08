// SABO Tournament System - Centralized Exports
// Unified location for all SABO double elimination components

// Main component (actual implementation)
export { SABODoubleEliminationViewer } from './SABODoubleEliminationViewer';

// Core exports - direct from tournaments/sabo
export { SABOLogicCore } from '@/tournaments/sabo/SABOLogicCore';

// Hooks
export { useSABOTournamentMatches } from '@/tournaments/sabo/hooks/useSABOTournamentMatches';
export { useSABOScoreSubmission } from '@/tournaments/sabo/hooks/useSABOScoreSubmission';
export { useSABOTournamentProgress } from '@/tournaments/sabo/hooks/useSABOTournamentProgress';

// Types
export type {
  SABOMatch,
  SABOOrganizedMatches,
} from '@/tournaments/sabo/SABOLogicCore';
