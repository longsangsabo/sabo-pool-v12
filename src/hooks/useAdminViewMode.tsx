import { useState, useEffect, useCallback } from 'react';

export type AdminViewMode = 'admin' | 'player';

export const useAdminViewMode = () => {
  const [viewMode, setViewModeState] = useState<AdminViewMode>('admin');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin-view-mode');
    if (saved && (saved === 'admin' || saved === 'player')) {
      setViewModeState(saved);
    }
  }, []);

  const setViewMode = useCallback((mode: AdminViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('admin-view-mode', mode);
  }, []);

  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'admin' ? 'player' : 'admin';
    setViewMode(newMode);
  }, [viewMode, setViewMode]);

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isPlayerView: viewMode === 'player',
    isAdminView: viewMode === 'admin',
  };
};
