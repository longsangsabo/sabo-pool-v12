/**
 * Admin Bracket Viewer Component
 * Placeholder for admin bracket management
 */
import React from 'react';

interface AdminBracketViewerProps {
  tournamentId?: string;
  editable?: boolean;
}

export const AdminBracketViewer: React.FC<AdminBracketViewerProps> = ({
  tournamentId,
  editable = false
}) => {
  return (
    <div className="admin-bracket-viewer">
      <h3>Admin Bracket Viewer</h3>
      <p>Tournament ID: {tournamentId}</p>
      <p>Editable: {editable ? 'Yes' : 'No'}</p>
      {/* TODO: Implement admin bracket viewing functionality */}
    </div>
  );
};

export default AdminBracketViewer;
