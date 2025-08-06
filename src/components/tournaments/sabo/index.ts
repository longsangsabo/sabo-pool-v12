// SABO Tournament System - Centralized Exports (Wrapper)
// This provides a new import path while maintaining backward compatibility
// Part of the double elimination cleanup process

// Main component
export { SABODoubleEliminationViewer } from './SABODoubleEliminationViewer';

// Core exports from original location
export { SABOLogicCore } from '@/tournaments/sabo/SABOLogicCore';

// Hooks
export { useSABOTournamentMatches } from '@/tournaments/sabo/hooks/useSABOTournamentMatches';
export { useSABOScoreSubmission } from '@/tournaments/sabo/hooks/useSABOScoreSubmission';
export { useSABOTournamentProgress } from '@/tournaments/sabo/hooks/useSABOTournamentProgress';

// Types
export type { SABOMatch, SABOOrganizedMatches } from '@/tournaments/sabo/SABOLogicCore';