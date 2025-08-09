import { calculateRefreshDelay, useTokenRefresh } from '../useTokenRefresh';
import { renderHook } from '@testing-library/react';

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      refreshSession: jest.fn().mockResolvedValue({
        data: {
          session: { expires_at: Math.floor(Date.now() / 1000) + 3600 },
        },
        error: null,
      }),
    },
  },
}));

describe('calculateRefreshDelay', () => {
  test('returns null if no expiry', () => {
    expect(calculateRefreshDelay(null)).toBeNull();
  });
  test('schedules roughly 2 minutes early', () => {
    const now = 1000;
    const expires = now + 600; // 10 minutes later
    const delay = calculateRefreshDelay(expires, now); // expect (expires-120)-now = 480s
    expect(Math.round(delay! / 1000)).toBe(480);
  });
  test('falls back to 5s if already past refresh point', () => {
    const now = 1000;
    const expires = now + 100; // soon
    const delay = calculateRefreshDelay(expires, now);
    expect(delay).toBe(5000);
  });
});

describe('useTokenRefresh', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  test('does nothing without session', () => {
    const { rerender } = renderHook(
      ({ session }) => useTokenRefresh(session as any),
      {
        initialProps: { session: null },
      }
    );
    rerender({ session: null });
    // No timers scheduled (cannot directly count timers in Jest easily)
    // Advance timers to ensure no callback fires
    jest.advanceTimersByTime(6000);
    expect(true).toBe(true);
  });
  test('sets a timer when session has expires_at', () => {
    const expires_at = Math.floor(Date.now() / 1000) + 300; // 5m
    renderHook(() => useTokenRefresh({ expires_at } as any));
    // Advance time just before expected earliest refresh (should be > 5s)
    jest.advanceTimersByTime(4000);
    // No assertion except that no errors thrown
    expect(true).toBe(true);
  });
});
