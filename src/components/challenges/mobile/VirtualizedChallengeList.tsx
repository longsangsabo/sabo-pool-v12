import React, { useState } from 'react';

interface VirtualizedChallengeListProps<T> {
  challenges: T[];
  renderItem: (challenge: T, index: number) => React.ReactNode;
  maxVisible?: number;
  footer?: React.ReactNode;
}

export function VirtualizedChallengeList<T>({
  challenges,
  renderItem,
  maxVisible = 20,
  footer,
}: VirtualizedChallengeListProps<T>) {
  const [showAll, setShowAll] = useState(false);
  const displayedChallenges = showAll
    ? challenges
    : challenges.slice(0, maxVisible);

  return (
    <div className='space-y-3'>
      {displayedChallenges.map((c, i) => (
        <div key={(c as any).id || i}>{renderItem(c, i)}</div>
      ))}

      {challenges.length > maxVisible && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className='w-full py-3 text-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors'
        >
          Xem thêm {challenges.length - maxVisible} thách đấu khác
        </button>
      )}

      {showAll && challenges.length > maxVisible && (
        <button
          onClick={() => setShowAll(false)}
          className='w-full py-2 text-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm transition-colors'
        >
          Thu gọn danh sách
        </button>
      )}

      {footer}
    </div>
  );
}
