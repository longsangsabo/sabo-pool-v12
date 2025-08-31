/**
 * SABO Pool Arena - Business Validation Service
 * Phase 4: Priority 3 - Business Validation Logic Consolidation
 * 
 * Consolidated validation logic extracted from:
 * - Tournament business rules validation
 * - Form data validation and sanitization
 * - Registration eligibility checking
 * - Prize pool and fee validation
 * - Date and scheduling validation
 * 
 * This service handles all business validation operations:
 * - Tournament creation and update validation
 * - Player registration eligibility checks
 * - Business rule enforcement and consistency
 * - Data integrity and format validation
 * - Prize structure and fee validation
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'critical';
  details?: any;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  severity: 'warning' | 'info';
  details?: any;
}

export interface TournamentValidationData {
  name?: string;
  description?: string;
  venue_address?: string;
  max_participants?: number;
  entry_fee?: number;
  prize_pool?: number;
  registration_start?: string;
  registration_end?: string;
  tournament_start?: string;
  tournament_end?: string;
  tournament_type?: TournamentType;
  allow_all_ranks?: boolean;
  eligible_ranks?: string[];
  min_rank_requirement?: string;
  max_rank_requirement?: string;
  contact_info?: string;
  special_rules?: string;
  is_featured?: boolean;
}

export interface RegistrationEligibilityData {
  user_id: string;
  tournament_id: string;
  user_rank: string;
  user_rating: number;
  verified_rank?: string;
  registration_date?: Date;
  payment_status?: 'pending' | 'completed' | 'failed';
}

export interface BusinessRuleData {
  entity_type: 'tournament' | 'match' | 'registration' | 'payment';
  operation: 'create' | 'update' | 'delete' | 'complete';
  data: Record<string, any>;
  context?: Record<string, any>;
}

export interface FormValidationRules {
  required_fields: string[];
  field_types: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'email'>;
  field_constraints: Record<string, FieldConstraint>;
  custom_validators?: Record<string, (value: any) => ValidationResult>;
}

export interface FieldConstraint {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: RegExp;
  allowed_values?: any[];
  custom_validator?: (value: any) => boolean;
}

export enum TournamentType {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
  SWISS = 'swiss',
  SABO_16 = 'sabo_16',
  SABO_32 = 'sabo_32',
}

export type RankCode = 'K' | 'K+' | 'I' | 'I+' | 'H' | 'H+' | 'G' | 'G+' | 'F' | 'F+' | 'E' | 'E+';

/**
 * Business Validation Service
 * Handles all business logic validation and rule enforcement
 */
export class BusinessValidationService {
  /**
   * Available rank codes in SABO Pool Arena
   */
  public static readonly AVAILABLE_RANKS: RankCode[] = [
    'K', 'K+', 'I', 'I+', 'H', 'H+', 'G', 'G+', 'F', 'F+', 'E', 'E+'
  ];

  /**
   * Valid participant slot counts for tournaments
   */
  public static readonly PARTICIPANT_SLOTS = [4, 6, 8, 12, 16, 24, 32, 64];

  /**
   * Maximum values for various tournament settings
   */
  public static readonly LIMITS = {
    MAX_TOURNAMENT_NAME_LENGTH: 100,
    MIN_TOURNAMENT_NAME_LENGTH: 3,
    MAX_DESCRIPTION_LENGTH: 1000,
    MIN_VENUE_ADDRESS_LENGTH: 5,
    MAX_VENUE_ADDRESS_LENGTH: 200,
    MAX_ENTRY_FEE: 10000000, // 10M VND
    MIN_ENTRY_FEE: 0,
    MAX_PRIZE_POOL: 100000000, // 100M VND
    MAX_PARTICIPANTS: 64,
    MIN_PARTICIPANTS: 4,
    MAX_REGISTRATION_PERIOD_DAYS: 30,
    MIN_PREPARATION_TIME_HOURS: 2,
    MAX_CONTACT_INFO_LENGTH: 500,
    MIN_CONTACT_INFO_LENGTH: 5,
  };

  /**
   * Validate complete tournament data
   * 
   * @param data - Tournament data to validate
   * @returns Comprehensive validation result
   */
  static validateTournament(data: TournamentValidationData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic field validation
    this.validateBasicFields(data, errors);
    
    // Business logic validation
    this.validateBusinessLogic(data, errors, warnings);
    
    // Date and scheduling validation
    this.validateScheduling(data, errors, warnings);
    
    // Registration settings validation
    this.validateRegistrationSettings(data, errors);
    
    // Rank eligibility validation
    this.validateRankEligibility(data, errors);
    
    // Prize structure validation
    this.validatePrizeStructure(data, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        total_checks: 6,
        fields_validated: Object.keys(data).length,
      },
    };
  }

  /**
   * Validate player registration eligibility
   * 
   * @param data - Registration eligibility data
   * @returns Eligibility validation result
   */
  static validateRegistrationEligibility(
    data: RegistrationEligibilityData
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check required fields
    if (!data.user_id) {
      errors.push({
        field: 'user_id',
        code: 'REQUIRED_FIELD',
        message: 'User ID is required',
        severity: 'error',
      });
    }

    if (!data.tournament_id) {
      errors.push({
        field: 'tournament_id',
        code: 'REQUIRED_FIELD',
        message: 'Tournament ID is required',
        severity: 'error',
      });
    }

    // Validate rank
    if (data.user_rank && !this.AVAILABLE_RANKS.includes(data.user_rank as RankCode)) {
      errors.push({
        field: 'user_rank',
        code: 'INVALID_RANK',
        message: 'Invalid user rank',
        severity: 'error',
        details: { provided_rank: data.user_rank },
      });
    }

    // Validate rating
    if (data.user_rating !== undefined) {
      if (data.user_rating < 800 || data.user_rating > 3000) {
        warnings.push({
          field: 'user_rating',
          code: 'UNUSUAL_RATING',
          message: 'User rating is outside normal range (800-3000)',
          severity: 'warning',
          details: { rating: data.user_rating },
        });
      }
    }

    // Check registration timing
    if (data.registration_date) {
      const now = new Date();
      if (data.registration_date > now) {
        errors.push({
          field: 'registration_date',
          code: 'FUTURE_REGISTRATION',
          message: 'Registration date cannot be in the future',
          severity: 'error',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate business rules for various operations
   * 
   * @param data - Business rule data
   * @returns Business rule validation result
   */
  static validateBusinessRules(data: BusinessRuleData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    switch (data.entity_type) {
      case 'tournament':
        this.validateTournamentBusinessRules(data, errors, warnings);
        break;
      case 'match':
        this.validateMatchBusinessRules(data, errors, warnings);
        break;
      case 'registration':
        this.validateRegistrationBusinessRules(data, errors, warnings);
        break;
      case 'payment':
        this.validatePaymentBusinessRules(data, errors, warnings);
        break;
      default:
        errors.push({
          field: 'entity_type',
          code: 'UNSUPPORTED_ENTITY',
          message: 'Unsupported entity type for business rule validation',
          severity: 'error',
        });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate form data against specified rules
   * 
   * @param formData - Form data to validate
   * @param rules - Validation rules to apply
   * @returns Form validation result
   */
  static validateFormData(
    formData: Record<string, any>,
    rules: FormValidationRules
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check required fields
    for (const field of rules.required_fields) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        errors.push({
          field,
          code: 'REQUIRED_FIELD',
          message: `${field} is required`,
          severity: 'error',
        });
      }
    }

    // Validate field types and constraints
    for (const [field, value] of Object.entries(formData)) {
      if (value === null || value === undefined) continue;

      // Type validation
      if (rules.field_types[field]) {
        const expectedType = rules.field_types[field];
        if (!this.validateFieldType(value, expectedType)) {
          errors.push({
            field,
            code: 'INVALID_TYPE',
            message: `${field} must be of type ${expectedType}`,
            severity: 'error',
            details: { expected: expectedType, actual: typeof value },
          });
        }
      }

      // Constraint validation
      if (rules.field_constraints[field]) {
        const constraint = rules.field_constraints[field];
        const constraintResult = this.validateFieldConstraint(value, constraint);
        if (!constraintResult.valid) {
          errors.push({
            field,
            code: 'CONSTRAINT_VIOLATION',
            message: constraintResult.message || `${field} violates constraint`,
            severity: 'error',
            details: constraintResult.details,
          });
        }
      }

      // Custom validation
      if (rules.custom_validators && rules.custom_validators[field]) {
        const customResult = rules.custom_validators[field](value);
        if (!customResult.valid) {
          errors.push(...customResult.errors);
          warnings.push(...customResult.warnings);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate email format
   * 
   * @param email - Email address to validate
   * @returns True if valid email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Vietnamese phone number format
   * 
   * @param phone - Phone number to validate
   * @returns True if valid Vietnamese phone format
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Sanitize string for safe storage and display
   * 
   * @param input - Input string to sanitize
   * @param maxLength - Maximum allowed length
   * @returns Sanitized string
   */
  static sanitizeString(input: string, maxLength: number = 255): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters and trim
    const sanitized = input
      .replace(/[<>\"'&]/g, '') // Remove HTML/script chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return sanitized.length > maxLength 
      ? sanitized.substring(0, maxLength).trim() + '...'
      : sanitized;
  }

  /**
   * Private Methods - Field Validation
   */

  private static validateBasicFields(
    data: TournamentValidationData,
    errors: ValidationError[]
  ): void {
    // Tournament name validation
    if (!data.name?.trim()) {
      errors.push({
        field: 'name',
        code: 'REQUIRED_FIELD',
        message: 'Tournament name is required',
        severity: 'error',
      });
    } else if (data.name.trim().length < this.LIMITS.MIN_TOURNAMENT_NAME_LENGTH) {
      errors.push({
        field: 'name',
        code: 'MIN_LENGTH',
        message: `Tournament name must be at least ${this.LIMITS.MIN_TOURNAMENT_NAME_LENGTH} characters`,
        severity: 'error',
      });
    } else if (data.name.trim().length > this.LIMITS.MAX_TOURNAMENT_NAME_LENGTH) {
      errors.push({
        field: 'name',
        code: 'MAX_LENGTH',
        message: `Tournament name cannot exceed ${this.LIMITS.MAX_TOURNAMENT_NAME_LENGTH} characters`,
        severity: 'error',
      });
    }

    // Venue address validation
    if (!data.venue_address?.trim()) {
      errors.push({
        field: 'venue_address',
        code: 'REQUIRED_FIELD',
        message: 'Venue address is required',
        severity: 'error',
      });
    } else if (data.venue_address.trim().length < this.LIMITS.MIN_VENUE_ADDRESS_LENGTH) {
      errors.push({
        field: 'venue_address',
        code: 'MIN_LENGTH',
        message: `Venue address must be at least ${this.LIMITS.MIN_VENUE_ADDRESS_LENGTH} characters`,
        severity: 'error',
      });
    }

    // Max participants validation
    if (data.max_participants !== undefined) {
      if (data.max_participants < this.LIMITS.MIN_PARTICIPANTS) {
        errors.push({
          field: 'max_participants',
          code: 'MIN_VALUE',
          message: `Minimum ${this.LIMITS.MIN_PARTICIPANTS} participants required`,
          severity: 'error',
        });
      } else if (data.max_participants > this.LIMITS.MAX_PARTICIPANTS) {
        errors.push({
          field: 'max_participants',
          code: 'MAX_VALUE',
          message: `Maximum ${this.LIMITS.MAX_PARTICIPANTS} participants allowed`,
          severity: 'error',
        });
      } else if (!this.PARTICIPANT_SLOTS.includes(data.max_participants)) {
        errors.push({
          field: 'max_participants',
          code: 'INVALID_VALUE',
          message: `Participant count must be one of: ${this.PARTICIPANT_SLOTS.join(', ')}`,
          severity: 'error',
        });
      }
    }

    // Entry fee validation
    if (data.entry_fee !== undefined) {
      if (data.entry_fee < this.LIMITS.MIN_ENTRY_FEE) {
        errors.push({
          field: 'entry_fee',
          code: 'MIN_VALUE',
          message: 'Entry fee cannot be negative',
          severity: 'error',
        });
      } else if (data.entry_fee > this.LIMITS.MAX_ENTRY_FEE) {
        errors.push({
          field: 'entry_fee',
          code: 'MAX_VALUE',
          message: `Entry fee cannot exceed ${this.LIMITS.MAX_ENTRY_FEE.toLocaleString()} VND`,
          severity: 'error',
        });
      }
    }
  }

  private static validateBusinessLogic(
    data: TournamentValidationData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Prize pool vs entry fee validation
    if (data.entry_fee !== undefined && data.max_participants !== undefined && data.prize_pool !== undefined) {
      const totalRevenue = data.entry_fee * data.max_participants;
      
      if (data.prize_pool > totalRevenue) {
        warnings.push({
          field: 'prize_pool',
          code: 'PRIZE_EXCEEDS_REVENUE',
          message: 'Prize pool exceeds total revenue from entry fees',
          severity: 'warning',
          details: {
            prize_pool: data.prize_pool,
            total_revenue: totalRevenue,
            deficit: data.prize_pool - totalRevenue,
          },
        });
      }
    }

    // Tournament type vs participant count validation
    if (data.tournament_type === TournamentType.ROUND_ROBIN && data.max_participants && data.max_participants > 8) {
      warnings.push({
        field: 'tournament_type',
        code: 'LARGE_ROUND_ROBIN',
        message: 'Round robin tournaments with many participants will take a very long time',
        severity: 'warning',
        details: {
          participants: data.max_participants,
          estimated_matches: (data.max_participants * (data.max_participants - 1)) / 2,
        },
      });
    }
  }

  private static validateScheduling(
    data: TournamentValidationData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const now = new Date();

    // Tournament start validation
    if (data.tournament_start) {
      const startDate = new Date(data.tournament_start);
      if (startDate <= now) {
        errors.push({
          field: 'tournament_start',
          code: 'PAST_DATE',
          message: 'Tournament start time must be in the future',
          severity: 'error',
        });
      }
    }

    // Tournament end validation
    if (data.tournament_end && data.tournament_start) {
      const startDate = new Date(data.tournament_start);
      const endDate = new Date(data.tournament_end);
      
      if (endDate <= startDate) {
        errors.push({
          field: 'tournament_end',
          code: 'INVALID_DATE_RANGE',
          message: 'Tournament end time must be after start time',
          severity: 'error',
        });
      }
    }

    // Registration period validation
    if (data.registration_start && data.registration_end) {
      const regStart = new Date(data.registration_start);
      const regEnd = new Date(data.registration_end);
      
      if (regEnd <= regStart) {
        errors.push({
          field: 'registration_end',
          code: 'INVALID_DATE_RANGE',
          message: 'Registration end time must be after start time',
          severity: 'error',
        });
      }

      // Check registration period length
      const periodDays = (regEnd.getTime() - regStart.getTime()) / (1000 * 60 * 60 * 24);
      if (periodDays > this.LIMITS.MAX_REGISTRATION_PERIOD_DAYS) {
        warnings.push({
          field: 'registration_period',
          code: 'LONG_REGISTRATION_PERIOD',
          message: `Registration period of ${Math.round(periodDays)} days is very long`,
          severity: 'warning',
        });
      }
    }

    // Registration vs tournament timing
    if (data.registration_end && data.tournament_start) {
      const regEnd = new Date(data.registration_end);
      const tournamentStart = new Date(data.tournament_start);
      
      if (regEnd > tournamentStart) {
        errors.push({
          field: 'registration_end',
          code: 'INVALID_DATE_SEQUENCE',
          message: 'Registration must close before tournament starts',
          severity: 'error',
        });
      }

      // Check preparation time
      const preparationHours = (tournamentStart.getTime() - regEnd.getTime()) / (1000 * 60 * 60);
      if (preparationHours < this.LIMITS.MIN_PREPARATION_TIME_HOURS) {
        warnings.push({
          field: 'preparation_time',
          code: 'SHORT_PREPARATION_TIME',
          message: `Only ${Math.round(preparationHours)} hours between registration close and tournament start`,
          severity: 'warning',
        });
      }
    }
  }

  private static validateRegistrationSettings(
    data: TournamentValidationData,
    errors: ValidationError[]
  ): void {
    // Contact info validation
    if (data.contact_info) {
      if (data.contact_info.trim().length < this.LIMITS.MIN_CONTACT_INFO_LENGTH) {
        errors.push({
          field: 'contact_info',
          code: 'MIN_LENGTH',
          message: `Contact info must be at least ${this.LIMITS.MIN_CONTACT_INFO_LENGTH} characters`,
          severity: 'error',
        });
      } else if (data.contact_info.trim().length > this.LIMITS.MAX_CONTACT_INFO_LENGTH) {
        errors.push({
          field: 'contact_info',
          code: 'MAX_LENGTH',
          message: `Contact info cannot exceed ${this.LIMITS.MAX_CONTACT_INFO_LENGTH} characters`,
          severity: 'error',
        });
      }
    }
  }

  private static validateRankEligibility(
    data: TournamentValidationData,
    errors: ValidationError[]
  ): void {
    if (!data.allow_all_ranks) {
      if (!data.eligible_ranks || data.eligible_ranks.length === 0) {
        errors.push({
          field: 'eligible_ranks',
          code: 'REQUIRED_FIELD',
          message: 'Please select at least one rank or allow all ranks',
          severity: 'error',
        });
      } else {
        // Validate rank codes
        const invalidRanks = data.eligible_ranks.filter(
          rank => !this.AVAILABLE_RANKS.includes(rank as RankCode)
        );
        if (invalidRanks.length > 0) {
          errors.push({
            field: 'eligible_ranks',
            code: 'INVALID_RANKS',
            message: `Invalid rank codes: ${invalidRanks.join(', ')}`,
            severity: 'error',
            details: { invalid_ranks: invalidRanks },
          });
        }
      }
    }

    // Validate min/max rank requirements
    if (data.min_rank_requirement && !this.AVAILABLE_RANKS.includes(data.min_rank_requirement as RankCode)) {
      errors.push({
        field: 'min_rank_requirement',
        code: 'INVALID_RANK',
        message: 'Invalid minimum rank requirement',
        severity: 'error',
      });
    }

    if (data.max_rank_requirement && !this.AVAILABLE_RANKS.includes(data.max_rank_requirement as RankCode)) {
      errors.push({
        field: 'max_rank_requirement',
        code: 'INVALID_RANK',
        message: 'Invalid maximum rank requirement',
        severity: 'error',
      });
    }
  }

  private static validatePrizeStructure(
    data: TournamentValidationData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (data.prize_pool !== undefined) {
      if (data.prize_pool < 0) {
        errors.push({
          field: 'prize_pool',
          code: 'MIN_VALUE',
          message: 'Prize pool cannot be negative',
          severity: 'error',
        });
      } else if (data.prize_pool > this.LIMITS.MAX_PRIZE_POOL) {
        warnings.push({
          field: 'prize_pool',
          code: 'LARGE_PRIZE_POOL',
          message: `Prize pool of ${data.prize_pool.toLocaleString()} VND is very large`,
          severity: 'warning',
        });
      }
    }
  }

  private static validateTournamentBusinessRules(
    data: BusinessRuleData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Tournament-specific business rules
    if (data.operation === 'create' && !data.data.organizer_id) {
      errors.push({
        field: 'organizer_id',
        code: 'REQUIRED_FIELD',
        message: 'Tournament must have an organizer',
        severity: 'error',
      });
    }
  }

  private static validateMatchBusinessRules(
    data: BusinessRuleData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Match-specific business rules
    if (data.operation === 'complete') {
      if (!data.data.winner_id) {
        errors.push({
          field: 'winner_id',
          code: 'REQUIRED_FIELD',
          message: 'Match completion requires a winner',
          severity: 'error',
        });
      }
    }
  }

  private static validateRegistrationBusinessRules(
    data: BusinessRuleData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Registration-specific business rules
    if (data.operation === 'create') {
      if (!data.data.user_id || !data.data.tournament_id) {
        errors.push({
          field: 'registration_data',
          code: 'REQUIRED_FIELDS',
          message: 'Registration requires user ID and tournament ID',
          severity: 'error',
        });
      }
    }
  }

  private static validatePaymentBusinessRules(
    data: BusinessRuleData,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Payment-specific business rules
    if (data.operation === 'create') {
      if (!data.data.amount || data.data.amount <= 0) {
        errors.push({
          field: 'amount',
          code: 'INVALID_AMOUNT',
          message: 'Payment amount must be greater than zero',
          severity: 'error',
        });
      }
    }
  }

  private static validateFieldType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      case 'email':
        return typeof value === 'string' && this.validateEmail(value);
      default:
        return true;
    }
  }

  private static validateFieldConstraint(value: any, constraint: FieldConstraint): {
    valid: boolean;
    message?: string;
    details?: any;
  } {
    // Length constraints for strings
    if (typeof value === 'string') {
      if (constraint.min_length !== undefined && value.length < constraint.min_length) {
        return {
          valid: false,
          message: `Minimum length is ${constraint.min_length}`,
          details: { min_length: constraint.min_length, actual_length: value.length },
        };
      }
      if (constraint.max_length !== undefined && value.length > constraint.max_length) {
        return {
          valid: false,
          message: `Maximum length is ${constraint.max_length}`,
          details: { max_length: constraint.max_length, actual_length: value.length },
        };
      }
    }

    // Value constraints for numbers
    if (typeof value === 'number') {
      if (constraint.min_value !== undefined && value < constraint.min_value) {
        return {
          valid: false,
          message: `Minimum value is ${constraint.min_value}`,
          details: { min_value: constraint.min_value, actual_value: value },
        };
      }
      if (constraint.max_value !== undefined && value > constraint.max_value) {
        return {
          valid: false,
          message: `Maximum value is ${constraint.max_value}`,
          details: { max_value: constraint.max_value, actual_value: value },
        };
      }
    }

    // Pattern constraint
    if (constraint.pattern && typeof value === 'string') {
      if (!constraint.pattern.test(value)) {
        return {
          valid: false,
          message: 'Value does not match required pattern',
          details: { pattern: constraint.pattern.source },
        };
      }
    }

    // Allowed values constraint
    if (constraint.allowed_values && !constraint.allowed_values.includes(value)) {
      return {
        valid: false,
        message: `Value must be one of: ${constraint.allowed_values.join(', ')}`,
        details: { allowed_values: constraint.allowed_values },
      };
    }

    // Custom validator
    if (constraint.custom_validator && !constraint.custom_validator(value)) {
      return {
        valid: false,
        message: 'Value fails custom validation',
      };
    }

    return { valid: true };
  }
}

// Export service instance and types
export const businessValidationService = new BusinessValidationService();

// Export constants for convenience
export const AVAILABLE_RANKS = BusinessValidationService.AVAILABLE_RANKS;
export const PARTICIPANT_SLOTS = BusinessValidationService.PARTICIPANT_SLOTS;
export const VALIDATION_LIMITS = BusinessValidationService.LIMITS;
