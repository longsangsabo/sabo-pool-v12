/**
 * Validation Helper for Service Migration and Integration
 * Ensures code quality and correctness during migration process
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  type: 'missing_import' | 'incorrect_usage' | 'type_mismatch' | 'async_handling' | 'error_handling';
  message: string;
  line?: number;
  column?: number;
  severity: 'high' | 'medium' | 'low';
  fix_suggestion: string;
}

export interface ValidationWarning {
  type: 'performance' | 'best_practice' | 'security' | 'maintenance';
  message: string;
  improvement_suggestion: string;
}

export interface ValidationSuggestion {
  type: 'optimization' | 'enhancement' | 'alternative';
  message: string;
  code_example?: string;
}

export interface CodePattern {
  pattern: RegExp;
  type: 'good' | 'bad';
  category: string;
  message: string;
  replacement?: string;
}

/**
 * Validates service integration code for common issues and best practices
 * Helps ensure quality and consistency during migration process
 */
export class ValidationHelper {
  private static readonly codePatterns: CodePattern[] = [
    // Good patterns
    {
      pattern: /BusinessLogicServiceFactory\.(getTournamentService|getELORatingService|getSPAPointsService|getVNPAYService)/,
      type: 'good',
      category: 'service_usage',
      message: 'Correct usage of service factory pattern',
    },
    {
      pattern: /if\s*\(\s*result\.success\s*(?:&&\s*result\.data)?\s*\)/,
      type: 'good',
      category: 'error_handling',
      message: 'Proper result validation before using data',
    },
    {
      pattern: /useState\(\s*\(\)\s*=>\s*BusinessLogicServiceFactory\./,
      type: 'good',
      category: 'performance',
      message: 'Correct service initialization with useState',
    },

    // Bad patterns
    {
      pattern: /useUnifiedTournamentContext|useTournamentContext|useTournamentStateContext|useSimpleTournamentContext|useTournamentGlobalContext/,
      type: 'bad',
      category: 'migration',
      message: 'Old tournament context usage detected - should be migrated to TournamentService',
      replacement: 'BusinessLogicServiceFactory.getTournamentService(supabase)',
    },
    {
      pattern: /import.*eloCalculator|import.*rankUtils/,
      type: 'bad',
      category: 'migration',
      message: 'Old ELO utility imports detected - should use ELORatingService',
      replacement: 'BusinessLogicServiceFactory.getELORatingService()',
    },
    {
      pattern: /vnpay-payment-gateway\.js/,
      type: 'bad',
      category: 'migration',
      message: 'Old VNPAY gateway detected - should use VNPAYService',
      replacement: 'BusinessLogicServiceFactory.getVNPAYService()',
    },
    {
      pattern: /BusinessLogicServiceFactory\.\w+\(\)(?:\s*[^;])*\s*\)/,
      type: 'bad',
      category: 'performance',
      message: 'Service created in render function - should be memoized',
      replacement: 'const service = useState(() => BusinessLogicServiceFactory.getService())',
    },
    {
      pattern: /result\.data(?!\s*[?&])/,
      type: 'bad',
      category: 'error_handling',
      message: 'Using result.data without checking result.success first',
      replacement: 'if (result.success && result.data) { /* use result.data */ }',
    },
    {
      pattern: /await\s+\w+Service\.\w+\([^)]*\)(?!\s*[;}])/,
      type: 'bad',
      category: 'async_handling',
      message: 'Service call without proper error handling',
      replacement: 'try { const result = await service.method(); if (result.success) { /* handle success */ } } catch (error) { /* handle error */ }',
    },
  ];

  /**
   * Validate a code snippet for service integration issues
   */
  static validateCodeSnippet(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    const lines = code.split('\n');

    // Check each line against patterns
    lines.forEach((line, index) => {
      for (const pattern of this.codePatterns) {
        if (pattern.pattern.test(line)) {
          if (pattern.type === 'bad') {
            errors.push({
              type: this.categorizeError(pattern.category),
              message: pattern.message,
              line: index + 1,
              severity: this.getSeverity(pattern.category),
              fix_suggestion: pattern.replacement || 'See migration guide for correct usage',
            });
          }
        }
      }
    });

    // Check for missing imports
    if (this.hasServiceUsage(code) && !this.hasServiceImport(code)) {
      errors.push({
        type: 'missing_import',
        message: 'Service usage detected but missing import from @sabo-pool/shared-business',
        severity: 'high',
        fix_suggestion: "Add: import { BusinessLogicServiceFactory } from '@sabo-pool/shared-business';",
      });
    }

    // Check for async handling
    if (this.hasAsyncServiceCalls(code) && !this.hasProperErrorHandling(code)) {
      warnings.push({
        type: 'best_practice',
        message: 'Async service calls should be wrapped in try-catch blocks',
        improvement_suggestion: 'Add proper error handling around service calls',
      });
    }

    // Performance suggestions
    if (this.hasRepeatedServiceCreation(code)) {
      suggestions.push({
        type: 'optimization',
        message: 'Consider memoizing service instances to improve performance',
        code_example: 'const service = useState(() => BusinessLogicServiceFactory.getService());',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate service method usage
   */
  static validateServiceUsage(serviceName: string, methodName: string, args: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Service-specific validations
    switch (serviceName) {
      case 'TournamentService':
        this.validateTournamentService(methodName, args, errors, warnings);
        break;
      case 'ELORatingService':
        this.validateELOService(methodName, args, errors, warnings);
        break;
      case 'VNPAYService':
        this.validatePaymentService(methodName, args, errors, warnings);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Generate migration validation report
   */
  static generateMigrationReport(
    oldCode: string,
    newCode: string
  ): {
    migration_quality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    improvements: string[];
    remaining_issues: ValidationError[];
    performance_impact: 'positive' | 'neutral' | 'negative';
    recommendations: string[];
  } {
    const oldValidation = this.validateCodeSnippet(oldCode);
    const newValidation = this.validateCodeSnippet(newCode);

    const improvements: string[] = [];
    const recommendations: string[] = [];

    // Calculate improvement score
    const oldIssueCount = oldValidation.errors.length + oldValidation.warnings.length;
    const newIssueCount = newValidation.errors.length + newValidation.warnings.length;
    const improvementRatio = oldIssueCount > 0 ? (oldIssueCount - newIssueCount) / oldIssueCount : 1;

    let quality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    if (improvementRatio >= 0.8 && newValidation.errors.length === 0) {
      quality = 'excellent';
    } else if (improvementRatio >= 0.6 && newValidation.errors.length <= 1) {
      quality = 'good';
    } else if (improvementRatio >= 0.3) {
      quality = 'needs_improvement';
    } else {
      quality = 'poor';
    }

    // Identify improvements
    if (this.hasOldContextUsage(oldCode) && !this.hasOldContextUsage(newCode)) {
      improvements.push('Successfully migrated from old context patterns to services');
    }
    if (this.hasServiceFactoryUsage(newCode)) {
      improvements.push('Correctly implemented service factory pattern');
    }
    if (this.hasProperErrorHandling(newCode) && !this.hasProperErrorHandling(oldCode)) {
      improvements.push('Added proper error handling for service calls');
    }

    // Generate recommendations
    if (newValidation.errors.length > 0) {
      recommendations.push('Address remaining validation errors for production readiness');
    }
    if (newValidation.warnings.length > 0) {
      recommendations.push('Consider addressing warnings for better code quality');
    }
    if (!this.hasPerformanceOptimizations(newCode)) {
      recommendations.push('Add performance optimizations like service memoization');
    }

    return {
      migration_quality: quality,
      improvements,
      remaining_issues: newValidation.errors,
      performance_impact: this.assessPerformanceImpact(oldCode, newCode),
      recommendations,
    };
  }

  // Helper methods for pattern detection
  private static hasServiceUsage(code: string): boolean {
    return /BusinessLogicServiceFactory\./g.test(code);
  }

  private static hasServiceImport(code: string): boolean {
    return /import.*BusinessLogicServiceFactory.*from.*shared-business/g.test(code);
  }

  private static hasAsyncServiceCalls(code: string): boolean {
    return /await\s+\w*[Ss]ervice\./g.test(code);
  }

  private static hasProperErrorHandling(code: string): boolean {
    return /try\s*{[\s\S]*?catch\s*\(/g.test(code) || /if\s*\(\s*result\.success\s*\)/g.test(code);
  }

  private static hasRepeatedServiceCreation(code: string): boolean {
    const serviceCreations = code.match(/BusinessLogicServiceFactory\.\w+\(/g);
    return serviceCreations ? serviceCreations.length > 1 : false;
  }

  private static hasOldContextUsage(code: string): boolean {
    return /use\w*TournamentContext|eloCalculator|rankUtils|vnpay-payment-gateway/g.test(code);
  }

  private static hasServiceFactoryUsage(code: string): boolean {
    return /BusinessLogicServiceFactory\./g.test(code);
  }

  private static hasPerformanceOptimizations(code: string): boolean {
    return /useState\(\s*\(\)\s*=>/g.test(code) || /useMemo\(/g.test(code);
  }

  private static categorizeError(category: string): ValidationError['type'] {
    const mapping: { [key: string]: ValidationError['type'] } = {
      migration: 'incorrect_usage',
      performance: 'incorrect_usage',
      error_handling: 'error_handling',
      async_handling: 'async_handling',
      service_usage: 'incorrect_usage',
    };
    return mapping[category] || 'incorrect_usage';
  }

  private static getSeverity(category: string): 'high' | 'medium' | 'low' {
    const severityMapping: { [key: string]: 'high' | 'medium' | 'low' } = {
      migration: 'high',
      error_handling: 'high',
      async_handling: 'medium',
      performance: 'medium',
      service_usage: 'medium',
    };
    return severityMapping[category] || 'low';
  }

  private static validateTournamentService(
    methodName: string,
    args: any[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (methodName === 'createTournament' && args.length < 2) {
      errors.push({
        type: 'incorrect_usage',
        message: 'createTournament requires both tournament data and userId',
        severity: 'high',
        fix_suggestion: 'Add userId as second parameter',
      });
    }
    
    if (methodName === 'registerForTournament' && args.length < 2) {
      errors.push({
        type: 'incorrect_usage',
        message: 'registerForTournament requires tournamentId and userId',
        severity: 'high',
        fix_suggestion: 'Ensure both parameters are provided',
      });
    }
  }

  private static validateELOService(
    methodName: string,
    args: any[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (methodName === 'calculateELOChange') {
      if (args.length < 2) {
        errors.push({
          type: 'incorrect_usage',
          message: 'calculateELOChange requires at least winner and loser ELO ratings',
          severity: 'high',
          fix_suggestion: 'Provide both ELO ratings as parameters',
        });
      }
      
      if (args[0] < 0 || args[1] < 0) {
        warnings.push({
          type: 'best_practice',
          message: 'ELO ratings should be positive numbers',
          improvement_suggestion: 'Validate ELO ratings before calculation',
        });
      }
    }
  }

  private static validatePaymentService(
    methodName: string,
    args: any[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (methodName === 'createPaymentUrl' && args.length < 3) {
      errors.push({
        type: 'incorrect_usage',
        message: 'createPaymentUrl requires orderId, amount, and orderInfo',
        severity: 'high',
        fix_suggestion: 'Provide all required payment parameters',
      });
    }
    
    if (methodName.includes('WithRetry')) {
      warnings.push({
        type: 'best_practice',
        message: 'Using retry methods - ensure proper circuit breaker handling',
        improvement_suggestion: 'Monitor circuit breaker state and provide user feedback',
      });
    }
  }

  private static assessPerformanceImpact(oldCode: string, newCode: string): 'positive' | 'neutral' | 'negative' {
    const oldHasCaching = /cache|memoiz/i.test(oldCode);
    const newHasCaching = /cache|memoiz/i.test(newCode);
    const newHasServiceFactory = this.hasServiceFactoryUsage(newCode);
    
    if (newHasCaching && newHasServiceFactory) {
      return 'positive';
    } else if (newHasServiceFactory) {
      return 'neutral';
    } else {
      return 'negative';
    }
  }
}

export default ValidationHelper;
