import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DesktopProfilePage from '@/components/profile/DesktopProfilePage';
import OptimizedMobileProfile from '@/pages/OptimizedMobileProfile';

// Mock hooks & external modules minimal to avoid real network
jest.mock('@/hooks/useUnifiedProfile', () => ({
  useUnifiedProfile: () => ({ data: { display_name: 'Test User', full_name: 'Test User', avatar_url: null, recent_activities: [] }, isLoading: false, error: null, refetch: jest.fn() })
}));

jest.mock('@/hooks/useTheme', () => ({ useTheme: () => ({ theme: 'light' }) }));
jest.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
jest.mock('@/hooks/useOptimizedResponsive', () => ({ useOptimizedResponsive: () => ({ isMobile: false }) }));
jest.mock('@/contexts/AvatarContext', () => ({ useAvatar: () => ({ avatarUrl: null, updateAvatar: jest.fn(), refreshAvatar: jest.fn() }) }));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Supabase client mocks (if referenced indirectly)
jest.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

describe('Profile smoke rendering', () => {
  it('renders DesktopProfilePage without crashing', () => {
    const { getByText } = render(
      <MemoryRouter>
        <DesktopProfilePage />
      </MemoryRouter>
    );
    expect(getByText(/Test User/i)).toBeInTheDocument();
  });

  it('renders OptimizedMobileProfile without crashing', () => {
    // Force mobile behavior
    jest.doMock('@/hooks/useOptimizedResponsive', () => ({ useOptimizedResponsive: () => ({ isMobile: true }) }));
    const { getByText } = render(
      <MemoryRouter>
        <OptimizedMobileProfile />
      </MemoryRouter>
    );
    expect(getByText(/Test User/i)).toBeInTheDocument();
  });
});
