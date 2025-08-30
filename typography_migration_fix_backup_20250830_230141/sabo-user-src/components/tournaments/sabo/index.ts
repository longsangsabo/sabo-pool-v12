// SABO Tournament System - Centralized Exports
// Unified location for all SABO double elimination components

// Main component (actual implementation)
export { SABODoubleEliminationViewer } from './SABODoubleEliminationViewer';

// Core exports - From tournaments directory at root level
// Note: Since we don't have the tournaments directory in user app, 
// we'll comment these out for now to avoid build errors
// export { SABOLogicCore } from '@/tournaments/sabo/SABOLogicCore';

// Hooks - commenting out until we have the full structure
// export { useSABOTournamentMatches } from '@/tournaments/sabo/hooks/useSABOTournamentMatches';
// export { useSABOScoreSubmission } from '@/tournaments/sabo/hooks/useSABOScoreSubmission';
// export { useSABOTournamentProgress } from '@/tournaments/sabo/hooks/useSABOTournamentProgress';

// Types - commenting out until we have the core
// export type {
//   SABOMatch,
//   SABOOrganizedMatches,
// } from '@/tournaments/sabo/SABOLogicCore';
