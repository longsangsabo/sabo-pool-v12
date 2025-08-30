import { 
  TournamentData, 
  TournamentFormData, 
  DE16TournamentData, 
  PrizeBreakdown, 
  TournamentValidationErrors,
  TournamentConfig,
  TournamentServiceResult,
  TournamentCreationResult,
  TournamentBracket,
  BracketNode
} from './tournament-types';

/**
 * SABO Pool Arena - Tournament Business Logic Service
 * Extracted from scattered contexts and consolidated into single service
 * 
 * This service handles all tournament-related business logic including:
 * - Tournament creation and validation
 * - DE16 (Double Elimination 16-player) system
 * - Prize pool distribution
 * - Tournament status management
 * - Bracket generation and progression
 */
export class TournamentBusinessLogic {
  private config: TournamentConfig = {
    max_participants_limit: 64,
    min_entry_fee: 0,
    max_entry_fee: 10000000, // 10M VND
    default_prize_distribution: {
      first: 0.5,   // 50%
      second: 0.3,  // 30%
      third: 0.2,   // 20%
    },
    registration_deadline_hours: 24,
    tournament_start_delay_hours: 48,
  };

  /**
   * Validate tournament data before creation
   * Extracted from TournamentContext.tsx validateTournament function
   */
  validateTournament(tournament: Partial<TournamentData>): TournamentValidationErrors {
    const errors: TournamentValidationErrors = {};

    // Basic field validation
    if (!tournament.name?.trim()) {
      errors.name = 'Tên giải đấu là bắt buộc';
    }

    if (!tournament.max_participants || tournament.max_participants < 4) {
      errors.max_participants = 'Số lượng tham gia tối thiểu là 4 người';
    }

    if (tournament.max_participants && tournament.max_participants > this.config.max_participants_limit) {
      errors.max_participants = `Số lượng tham gia tối đa là ${this.config.max_participants_limit} người`;
    }

    if (tournament.entry_fee !== undefined && tournament.entry_fee < this.config.min_entry_fee) {
      errors.entry_fee = 'Lệ phí tham gia không hợp lệ';
    }

    if (tournament.entry_fee !== undefined && tournament.entry_fee > this.config.max_entry_fee) {
      errors.entry_fee = `Lệ phí tham gia tối đa là ${this.config.max_entry_fee.toLocaleString()} VND`;
    }

    // Date validation
    if (!tournament.registration_start) {
      errors.registration_start = 'Thời gian bắt đầu đăng ký là bắt buộc';
    }

    if (!tournament.registration_end) {
      errors.registration_end = 'Thời gian kết thúc đăng ký là bắt buộc';
    }

    if (!tournament.tournament_start) {
      errors.tournament_start = 'Thời gian bắt đầu giải là bắt buộc';
    }

    if (!tournament.tournament_end) {
      errors.tournament_end = 'Thời gian kết thúc giải là bắt buộc';
    }

    // Date logic validation
    if (tournament.registration_start && tournament.registration_end) {
      const regStart = new Date(tournament.registration_start);
      const regEnd = new Date(tournament.registration_end);
      
      if (regEnd <= regStart) {
        errors.registration_end = 'Thời gian kết thúc đăng ký phải sau thời gian bắt đầu';
      }
    }

    if (tournament.registration_end && tournament.tournament_start) {
      const regEnd = new Date(tournament.registration_end);
      const tournStart = new Date(tournament.tournament_start);
      
      if (tournStart <= regEnd) {
        errors.tournament_start = 'Thời gian bắt đầu giải phải sau thời gian kết thúc đăng ký';
      }
    }

    if (tournament.tournament_start && tournament.tournament_end) {
      const tournStart = new Date(tournament.tournament_start);
      const tournEnd = new Date(tournament.tournament_end);
      
      if (tournEnd <= tournStart) {
        errors.tournament_end = 'Thời gian kết thúc giải phải sau thời gian bắt đầu';
      }
    }

    return errors;
  }

  /**
   * Create DE16 Tournament with specialized business logic
   * Extracted from UnifiedTournamentContext.tsx and TournamentContext.tsx
   */
  createDE16Tournament(data: TournamentFormData, userId: string): TournamentData {
    // Validate input
    const validationErrors = this.validateTournament({
      ...data,
      max_participants: 16,
      tournament_type: 'double_elimination',
    });

    if (Object.keys(validationErrors).length > 0) {
      throw new Error(`Validation failed: ${Object.values(validationErrors).join(', ')}`);
    }

    // Build DE16 tournament data with business rules
    const de16Tournament: TournamentData = {
      name: data.name,
      description: data.description || '',
      tournament_type: 'double_elimination',
      game_format: '9_ball', // Default for SABO
      max_participants: 16, // Fixed for DE16
      current_participants: 0,
      entry_fee: data.entry_fee,
      prize_pool: this.calculatePrizePool(data.entry_fee, 16),
      tournament_start: data.tournament_start,
      tournament_end: data.tournament_end,
      registration_start: data.registration_start,
      registration_end: data.registration_end,
      venue_address: data.venue_address || '',
      rules: this.getDefaultDE16Rules(),
      contact_info: '',
      tier_level: 1, // Default tier
      status: 'upcoming',
      created_by: userId,
      has_third_place_match: true, // Standard for DE16
      requires_approval: false,
      is_public: true,
      allow_all_ranks: true,
      eligible_ranks: [],
      min_rank_requirement: undefined,
      max_rank_requirement: undefined,
    };

    return de16Tournament;
  }

  /**
   * Calculate prize pool distribution
   * Extracted from TournamentContext.tsx prize calculation logic
   */
  calculatePrizeDistribution(totalPrize: number, participants: number): PrizeBreakdown {
    if (totalPrize <= 0 || participants < 3) {
      return {
        first_prize: 0,
        second_prize: 0,
        third_prize: 0,
        prize_distribution: [],
      };
    }

    // SABO Pool Arena prize distribution rules
    const firstPrize = Math.floor(totalPrize * this.config.default_prize_distribution.first);
    const secondPrize = Math.floor(totalPrize * this.config.default_prize_distribution.second);
    const thirdPrize = Math.floor(totalPrize * this.config.default_prize_distribution.third);

    return {
      first_prize: firstPrize,
      second_prize: secondPrize,
      third_prize: thirdPrize,
      prize_distribution: [
        { position: 1, percentage: this.config.default_prize_distribution.first, amount: firstPrize },
        { position: 2, percentage: this.config.default_prize_distribution.second, amount: secondPrize },
        { position: 3, percentage: this.config.default_prize_distribution.third, amount: thirdPrize },
      ],
    };
  }

  /**
   * Calculate total prize pool from entry fees
   */
  calculatePrizePool(entryFee: number, participants: number): number {
    return entryFee * participants;
  }

  /**
   * Generate DE16 bracket structure
   * Business logic for SABO's Double Elimination 16-player system
   */
  generateDE16Bracket(tournamentId: string, playerIds: string[]): TournamentBracket {
    if (playerIds.length !== 16) {
      throw new Error('DE16 bracket requires exactly 16 players');
    }

    const bracket: TournamentBracket = {
      tournament_id: tournamentId,
      bracket_type: 'DE16',
      winners_bracket: [],
      losers_bracket: [],
      finals_bracket: [],
      total_rounds: 7, // DE16 specific: WB(4) + LB(5) + Finals(1) + Grand Finals(1)
      current_round: 1,
    };

    // Generate Winners Bracket (Round 1-4)
    bracket.winners_bracket = this.generateWinnersBracket(playerIds);
    
    // Generate Losers Bracket structure (Round 1-5)
    bracket.losers_bracket = this.generateLosersBracket();
    
    // Generate Finals structure
    bracket.finals_bracket = this.generateFinalsBracket();

    return bracket;
  }

  /**
   * Tournament status progression business logic
   * Extracted from various tournament contexts
   */
  getNextTournamentStatus(
    currentStatus: string,
    registrationEnd: string,
    tournamentStart: string,
    tournamentEnd: string
  ): string {
    const now = new Date();
    const regEnd = new Date(registrationEnd);
    const tournStart = new Date(tournamentStart);
    const tournEnd = new Date(tournamentEnd);

    if (now < regEnd) {
      return 'registration_open';
    } else if (now < tournStart) {
      return 'registration_closed';
    } else if (now < tournEnd) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }

  /**
   * Tournament registration validation
   */
  validateRegistration(
    tournament: TournamentData,
    userId: string,
    existingRegistrations: string[]
  ): TournamentServiceResult<boolean> {
    // Check if registration is open
    if (tournament.status !== 'registration_open') {
      return {
        success: false,
        error: 'Đăng ký đã đóng cho giải đấu này',
      };
    }

    // Check if user already registered
    if (existingRegistrations.includes(userId)) {
      return {
        success: false,
        error: 'Bạn đã đăng ký giải đấu này rồi',
      };
    }

    // Check if tournament is full
    if (tournament.current_participants && tournament.current_participants >= tournament.max_participants) {
      return {
        success: false,
        error: 'Giải đấu đã đủ số lượng tham gia',
      };
    }

    // Check registration deadline
    const now = new Date();
    const regEnd = new Date(tournament.registration_end);
    if (now > regEnd) {
      return {
        success: false,
        error: 'Đã hết hạn đăng ký',
      };
    }

    return {
      success: true,
      data: true,
      message: 'Có thể đăng ký',
    };
  }

  // Private helper methods

  private getDefaultDE16Rules(): string {
    return `
LUẬT CHƠI GIẢI ĐẤU DE16 (Double Elimination 16 Players)

1. Thể thức: Loại trực tiếp kép 16 người
2. Vòng đấu: Winners Bracket (4 vòng) + Losers Bracket (5 vòng) + Chung kết
3. Thời gian thi đấu: Mỗi trận tối đa 30 phút
4. Luật bi-a: 9-ball chuẩn quốc tế
5. Thắng 8 ván trước (Race to 8)
6. Tái đấu: Có thể yêu cầu tái đấu nếu có sự cố kỹ thuật
7. Kỷ luật: Chấp hành nghiêm chỉnh luật thi đấu

Cơ cấu giải thưởng:
- Hạng 1: 50% tổng giải thưởng
- Hạng 2: 30% tổng giải thưởng  
- Hạng 3: 20% tổng giải thưởng
    `.trim();
  }

  private generateWinnersBracket(playerIds: string[]): BracketNode[] {
    const winnersBracket: BracketNode[] = [];
    
    // Round 1: 16 players -> 8 matches
    for (let i = 0; i < 8; i++) {
      winnersBracket.push({
        id: `wb_r1_m${i + 1}`,
        player1_id: playerIds[i * 2],
        player2_id: playerIds[i * 2 + 1],
        round: 1,
        position: i + 1,
        bracket_type: 'winners',
        next_match_id: `wb_r2_m${Math.floor(i / 2) + 1}`,
        loser_next_match_id: `lb_r1_m${i + 1}`,
      });
    }

    // Round 2: 8 players -> 4 matches
    for (let i = 0; i < 4; i++) {
      winnersBracket.push({
        id: `wb_r2_m${i + 1}`,
        round: 2,
        position: i + 1,
        bracket_type: 'winners',
        next_match_id: `wb_r3_m${Math.floor(i / 2) + 1}`,
        loser_next_match_id: `lb_r3_m${i + 1}`,
      });
    }

    // Round 3: 4 players -> 2 matches (semifinals)
    for (let i = 0; i < 2; i++) {
      winnersBracket.push({
        id: `wb_r3_m${i + 1}`,
        round: 3,
        position: i + 1,
        bracket_type: 'winners',
        next_match_id: `wb_r4_m1`,
        loser_next_match_id: `lb_r4_m${i + 1}`,
      });
    }

    // Round 4: 2 players -> 1 match (Winners Final)
    winnersBracket.push({
      id: 'wb_r4_m1',
      round: 4,
      position: 1,
      bracket_type: 'winners',
      next_match_id: 'grand_final',
      loser_next_match_id: 'lb_r5_m1',
    });

    return winnersBracket;
  }

  private generateLosersBracket(): BracketNode[] {
    const losersBracket: BracketNode[] = [];
    
    // Losers Bracket Round 1: 8 players from WB R1
    for (let i = 0; i < 4; i++) {
      losersBracket.push({
        id: `lb_r1_m${i + 1}`,
        round: 1,
        position: i + 1,
        bracket_type: 'losers',
        next_match_id: `lb_r2_m${i + 1}`,
      });
    }

    // Losers Bracket Round 2: 4 winners from LB R1 + bye
    for (let i = 0; i < 4; i++) {
      losersBracket.push({
        id: `lb_r2_m${i + 1}`,
        round: 2,
        position: i + 1,
        bracket_type: 'losers',
        next_match_id: `lb_r3_m${Math.floor(i / 2) + 1}`,
      });
    }

    // Continue pattern for rounds 3-5...
    // Implementation continues based on DE16 bracket structure

    return losersBracket;
  }

  private generateFinalsBracket(): BracketNode[] {
    return [
      {
        id: 'grand_final',
        round: 6,
        position: 1,
        bracket_type: 'winners',
      },
      {
        id: 'grand_final_reset',
        round: 7,
        position: 1,
        bracket_type: 'winners',
      }
    ];
  }
}
