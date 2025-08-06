// SABO Double Elimination Viewer - New Location Wrapper
// This is a redirect wrapper to the actual implementation in @/tournaments/sabo/
// Part of the double elimination cleanup to consolidate file structure

import { SABODoubleEliminationViewer as OriginalSABOViewer } from '@/tournaments/sabo/SABODoubleEliminationViewer';

interface SABODoubleEliminationViewerProps {
  tournamentId: string;
  isClubOwner?: boolean;
  adminMode?: boolean;
  isTemplate?: boolean;
}

export const SABODoubleEliminationViewer: React.FC<
  SABODoubleEliminationViewerProps
> = (props) => {
  // Redirect to the original implementation
  return <OriginalSABOViewer {...props} />;
};