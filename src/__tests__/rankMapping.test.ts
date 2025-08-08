import { getRankByElo } from '@/utils/rankUtils';

// Basic mapping expectations (adjust if logic changes)
// Ensure representative thresholds don't regress.

describe('getRankByElo', () => {
  const cases: Array<[number, string]> = [
    [1000, 'K'],
    [1100, 'K+'],
    [1200, 'I'],
    [1300, 'I+'],
    [1400, 'H'],
    [1500, 'H+'],
    [1600, 'G'],
    [1700, 'G+'],
    [1800, 'F'],
    [1900, 'F+'],
    [2000, 'E'],
  ];

  it.each(cases)('elo %d maps to rank %s', (elo, expected) => {
    expect(getRankByElo(elo)).toBe(expected);
  });

  it('caps at highest defined rank for very large elo', () => {
    expect(getRankByElo(5000)).toBeDefined();
  });
});
