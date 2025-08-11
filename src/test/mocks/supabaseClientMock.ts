// Minimal supabase client mock for milestone smoke tests
// Provides only the chained API surface used in MilestonePage + milestoneService progress

interface QueryBuilder<T=any> {
  select: (columns?: string) => QueryBuilder<T> & PromiseLike<{ data: T[]; error: null }>;
  order: (col: string, opts?: any) => QueryBuilder<T> & PromiseLike<{ data: T[]; error: null }>;
  eq: (col: string, val: any) => QueryBuilder<T> & PromiseLike<{ data: T[]; error: null }>;
  in?: (col: string, vals: any[]) => QueryBuilder<T> & PromiseLike<{ data: T[]; error: null }>;
  upsert?: (val: any, _opts?: any) => QueryBuilder<T> & PromiseLike<{ data: any; error: null }>;
  update?: (val: any) => QueryBuilder<T> & PromiseLike<{ data: any; error: null }>;
  single?: () => Promise<{ data: any; error: null }>;  
}

const makeResolved = <T>(data: T): Promise<{ data: T; error: null }> => Promise.resolve({ data, error: null });

// Generate deterministic 31 milestone mock dataset
const mockMilestones = Array.from({ length: 31 }).map((_, i) => ({
  id: `m-${i+1}`,
  name: `Milestone ${i+1}`,
  description: 'Test milestone',
  category: i % 4 === 0 ? 'progress' : i % 4 === 1 ? 'achievement' : i % 4 === 2 ? 'social' : 'repeatable',
  milestone_type: 'generic',
  requirement_value: 10,
  spa_reward: 5,
  badge_name: null,
  badge_icon: null,
  badge_color: null,
  is_repeatable: false,
  daily_limit: null,
  sort_order: i+1,
}));

function createQuery(list: any[]): QueryBuilder<any> {
  const qb: any = {
    select: () => qb,
    order: () => qb,
    eq: () => qb,
    single: () => makeResolved(list[0] || null),
    then: (res: any, rej: any) => makeResolved(list).then(res, rej),
  };
  return qb;
}

export const supabase = {
  from: (table: string) => {
    if (table === 'milestones') return createQuery(mockMilestones);
    if (table === 'player_milestones') return createQuery([]);
    return createQuery([]);
  },
};
