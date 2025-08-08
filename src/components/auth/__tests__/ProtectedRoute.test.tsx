import React from 'react';
import { describe, test, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, session: null })
}));

const AuthPageProbe = () => {
  const loc = useLocation();
  return <div data-testid="auth-probe">Auth Page {loc.search}</div>;
};

describe('ProtectedRoute', () => {
  test('redirects unauthenticated user to /auth with redirect param', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/auth" element={<AuthPageProbe />} />
          <Route path="/profile" element={<ProtectedRoute><div>Profile</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    // Should not render profile
    expect(screen.queryByText('Profile')).toBeNull();
    const authEl = screen.getByTestId('auth-probe');
  expect(authEl).not.toBeNull();
    expect(authEl.textContent).toMatch(/redirect=%2Fprofile/);
  });
});
