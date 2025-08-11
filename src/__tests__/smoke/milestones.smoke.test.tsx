import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import MilestonePage from '@/pages/MilestonePage';
// NOTE: Supabase client fully mocked via moduleNameMapper for smoke tests.

// Mock milestoneService progress fetch to return empty progress map quickly
jest.mock('@/services/milestoneService', () => ({
  milestoneService: {
    getPlayerMilestoneProgress: async () => [],
  },
}));

// Mock user hook
jest.mock('@/hooks/useUser', () => ({
  useUser: () => ({ user: { id: 'test-user' } }),
}));

const renderPage = () => {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <MilestonePage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MilestonePage Smoke Test', () => {
  test('loads and displays milestone tabs and cards', async () => {
    renderPage();

    // Tabs present
    expect(await screen.findByRole('button', { name: /Progress/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Achievement/i })).toBeInTheDocument();

    // Wait for milestone cards
    await waitFor(() => {
      const cards = screen.getAllByText(/Test milestone|Milestone /i);
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  test('iterates tabs and accumulates 31 unique milestones (mock data)', async () => {
    renderPage();

    const user = userEvent.setup();

    // Wait initial load (progress tab)
    await screen.findByRole('button', { name: /Progress/i });

    const tabLabels = ['Progress','Achievement','Social','Repeatable'];
    const seen = new Set<string>();

    for (const label of tabLabels) {
      const btn = screen.getByRole('button', { name: new RegExp(label, 'i') });
      await user.click(btn);
      // Allow render cycle
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', { level: 3 });
        expect(headings.length).toBeGreaterThan(0);
        headings.forEach(h => {
          const txt = (h.textContent || '').trim();
            // Only count actual milestone item headings (pattern: Milestone N)
          if (/^Milestone \d+$/.test(txt)) {
            seen.add(txt);
          }
        });
      });
    }

    expect(seen.size).toBe(31);

    // Also validate category badge total (8+8+8+7). We extract numbers from badge elements.
    const badgeButtons = tabLabels.map(l => screen.getByRole('button', { name: new RegExp(l, 'i') }));
    // Each button contains a span with count; grab last number in its text.
    const counts = badgeButtons.map(b => {
      const txt = b.textContent || '';
      const match = txt.match(/(\d+)/g); // all numbers
      return match ? parseInt(match[match.length - 1], 10) : 0;
    });
    const total = counts.reduce((a,b)=>a+b,0);
    expect(total).toBe(31);
  });
});
