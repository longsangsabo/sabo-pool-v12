/**
 * Tournament Utilities
 * Helper functions for tournament formatting and display
 */

/**
 * Get tournament type display text
 */
export const getTournamentTypeText = (type: string): string => {
  switch (type) {
    case 'single_elimination':
      return '1 Mạng';
    case 'double_elimination':
      return '2 Mạng';
    case 'round_robin':
      return 'Vòng tròn';
    case 'swiss':
      return 'Swiss';
    default:
      return type;
  }
};

/**
 * Get tier display text
 */
export const getTierText = (tier: string | number): string => {
  switch (tier) {
    case 'K':
    case 1:
      return 'Hạng K (Mới bắt đầu)';
    case 'I':
    case 2:
      return 'Hạng I (Cơ bản)';
    case 'H':
    case 3:
      return 'Hạng H (Trung cấp)';
    case 'G':
    case 4:
      return 'Hạng G (Cao cấp)';
    case 'F':
    case 5:
      return 'Hạng F (Chuyên nghiệp)';
    case 'E':
    case 6:
      return 'Hạng E (Chuyên nghiệp cao cấp)';
    default:
      return `Hạng ${tier}`;
  }
};

/**
 * Get rank requirement text
 */
export const getRankRequirementText = (
  minRank?: string,
  maxRank?: string,
  rankRequirement?: string
): string => {
  if (rankRequirement && rankRequirement !== 'all') {
    return `Chỉ hạng ${rankRequirement}`;
  }

  if (minRank && maxRank) {
    return `Hạng ${minRank} - ${maxRank}`;
  }

  if (minRank) {
    return `Tối thiểu hạng ${minRank}`;
  }

  if (maxRank) {
    return `Tối đa hạng ${maxRank}`;
  }

  return 'Tất cả hạng';
};

/**
 * Format tournament date and time
 */
export const formatTournamentDateTime = (dateString: string | undefined): string => {
  if (!dateString) return 'Chưa xác định';

  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return 'Chưa xác định';
  }
};

/**
 * Format tournament date range
 */
export const formatTournamentDateRange = (
  startDate: string | undefined,
  endDate: string | undefined
): string => {
  if (!startDate && !endDate) return 'Chưa xác định';

  if (startDate && endDate) {
    const start = formatTournamentDateTime(startDate);
    const end = formatTournamentDateTime(endDate);

    if (start === 'Chưa xác định' || end === 'Chưa xác định') {
      return 'Chưa xác định';
    }

    // If same date, just show time range
    const startDateOnly = startDate.split('T')[0];
    const endDateOnly = endDate.split('T')[0];

    if (startDateOnly === endDateOnly) {
      const startTime = new Date(startDate).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const endTime = new Date(endDate).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const dateStr = new Date(startDate).toLocaleDateString('vi-VN');
      return `${dateStr} (${startTime} - ${endTime})`;
    }

    return `${start} - ${end}`;
  }

  if (startDate) return `Từ ${formatTournamentDateTime(startDate)}`;
  if (endDate) return `Đến ${formatTournamentDateTime(endDate)}`;

  return 'Chưa xác định';
};

/**
 * Format prize amount with proper units
 */
export const formatPrizeAmount = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount) || numAmount === 0) return '0 VND';

  if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(1)}M VND`;
  } else if (numAmount >= 1000) {
    return `${Math.round(numAmount / 1000)}K VND`;
  } else {
    return `${Math.round(numAmount)} VND`;
  }
};

/**
 * Get tournament status display text
 */
export const getTournamentStatusText = (status: string): string => {
  switch (status) {
    case 'upcoming':
      return 'Sắp diễn ra';
    case 'registration':
      return 'Đang đăng ký';
    case 'ongoing':
      return 'Đang diễn ra';
    case 'completed':
      return 'Đã kết thúc';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

/**
 * Get tournament status color
 */
export const getTournamentStatusColor = (status: string): string => {
  switch (status) {
    case 'upcoming':
      return 'blue';
    case 'registration':
      return 'green';
    case 'ongoing':
      return 'orange';
    case 'completed':
      return 'gray';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

/**
 * Check if tournament is joinable
 */
export const isTournamentJoinable = (
  status: string,
  registrationDeadline?: string
): boolean => {
  if (status !== 'registration') return false;
  
  if (registrationDeadline) {
    const deadline = new Date(registrationDeadline);
    const now = new Date();
    return now < deadline;
  }
  
  return true;
};

/**
 * Calculate tournament progress percentage
 */
export const calculateTournamentProgress = (
  startDate: string,
  endDate: string
): number => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  return Math.round((elapsed / total) * 100);
};

// Tournament rewards calculation (stub for build compatibility)
export const calculateRewards = (tournament: any, playerRank: any = 'K') => {
  // Stub implementation for build compatibility
  return {
    totalPrize: tournament?.prize_pool || 0,
    distribution: {},
    eloPoints: {},
    spaPoints: {},
  };
};
