/**
 * Context Migration Helper for SABO Pool V12
 * Assists other copilots in migrating from old context-based patterns to new service-based architecture
 */

import { TournamentService } from '../tournament/TournamentService';
import { ELORatingService } from '../ranking/ELORatingService';
import { SPAPointsService } from '../ranking/SPAPointsService';
import { VNPAYServiceOptimized } from '../payment/VNPAYServiceOptimized';
import { SupabaseClient } from '@supabase/supabase-js';

export interface MigrationPattern {
  oldPattern: string;
  newPattern: string;
  description: string;
  category: 'tournament' | 'elo' | 'points' | 'payment';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTimeMinutes: number;
}

export interface MigrationStep {
  step: number;
  title: string;
  description: string;
  codeExample: {
    before: string;
    after: string;
  };
  notes?: string[];
}

/**
 * Helper class to guide migration from old contexts to new services
 * Provides patterns, examples, and automated migration suggestions
 */
export class ContextMigrationHelper {
  private static readonly migrationPatterns: MigrationPattern[] = [
    // Tournament Context Migrations
    {
      oldPattern: 'useUnifiedTournamentContext()',
      newPattern: 'BusinessLogicServiceFactory.getTournamentService(supabase)',
      description: 'Replace UnifiedTournamentContext with TournamentService',
      category: 'tournament',
      complexity: 'simple',
      estimatedTimeMinutes: 5,
    },
    {
      oldPattern: 'useTournamentContext()',
      newPattern: 'BusinessLogicServiceFactory.getTournamentService(supabase)',
      description: 'Replace TournamentContext with TournamentService',
      category: 'tournament',
      complexity: 'simple',
      estimatedTimeMinutes: 5,
    },
    {
      oldPattern: 'useTournamentStateContext()',
      newPattern: 'TournamentService + useState for local state',
      description: 'Replace TournamentStateContext with service + local state management',
      category: 'tournament',
      complexity: 'moderate',
      estimatedTimeMinutes: 15,
    },
    {
      oldPattern: 'useSimpleTournamentContext()',
      newPattern: 'TournamentService with simplified method calls',
      description: 'Replace SimpleTournamentContext with direct service calls',
      category: 'tournament',
      complexity: 'simple',
      estimatedTimeMinutes: 5,
    },
    {
      oldPattern: 'useTournamentGlobalContext()',
      newPattern: 'TournamentService + global state management',
      description: 'Replace global tournament context with service + Zustand/Redux',
      category: 'tournament',
      complexity: 'complex',
      estimatedTimeMinutes: 30,
    },

    // ELO/Ranking Migrations
    {
      oldPattern: 'eloCalculator.ts functions',
      newPattern: 'ELORatingService methods',
      description: 'Replace direct ELO calculation functions with service methods',
      category: 'elo',
      complexity: 'simple',
      estimatedTimeMinutes: 10,
    },
    {
      oldPattern: 'rankUtils.ts functions',
      newPattern: 'RankTierService + ELORatingService',
      description: 'Replace rank utility functions with dedicated services',
      category: 'elo',
      complexity: 'moderate',
      estimatedTimeMinutes: 15,
    },

    // Payment Migrations
    {
      oldPattern: 'vnpay-payment-gateway.js',
      newPattern: 'VNPAYServiceOptimized',
      description: 'Replace JavaScript VNPAY gateway with TypeScript service',
      category: 'payment',
      complexity: 'moderate',
      estimatedTimeMinutes: 20,
    },
  ];

  /**
   * Get migration patterns by category
   */
  static getMigrationPatterns(category?: 'tournament' | 'elo' | 'points' | 'payment'): MigrationPattern[] {
    if (category) {
      return this.migrationPatterns.filter(p => p.category === category);
    }
    return this.migrationPatterns;
  }

  /**
   * Generate migration steps for tournament contexts
   */
  static getTournamentMigrationSteps(): MigrationStep[] {
    return [
      {
        step: 1,
        title: 'Import Tournament Service',
        description: 'Replace context imports with service imports',
        codeExample: {
          before: `import { useUnifiedTournamentContext } from '../contexts/UnifiedTournamentContext';`,
          after: `import { BusinessLogicServiceFactory } from '@sabo-pool/shared-business';
import { useSupabaseClient } from '@supabase/auth-helpers-react';`
        },
        notes: ['Remove all tournament context imports', 'Add service factory import'],
      },
      {
        step: 2,
        title: 'Initialize Tournament Service',
        description: 'Create service instance in component',
        codeExample: {
          before: `const { createTournament, fetchTournaments } = useUnifiedTournamentContext();`,
          after: `const supabase = useSupabaseClient();
const tournamentService = BusinessLogicServiceFactory.getTournamentService(supabase);`
        },
        notes: ['Initialize once per component', 'Reuse service instance'],
      },
      {
        step: 3,
        title: 'Convert Method Calls',
        description: 'Replace context methods with service methods',
        codeExample: {
          before: `const result = await createTournament(tournamentData);`,
          after: `const result = await tournamentService.createTournament(tournamentData, userId);`
        },
        notes: ['Methods are now async and return structured results', 'Check result.success before using result.data'],
      },
      {
        step: 4,
        title: 'Handle Service Results',
        description: 'Update result handling for new service structure',
        codeExample: {
          before: `if (result) {
  setTournaments(result);
}`,
          after: `if (result.success && result.data) {
  setTournaments(result.data);
} else {
  console.error('Tournament operation failed:', result.error);
}`
        },
        notes: ['Always check result.success', 'Handle errors appropriately'],
      },
    ];
  }

  /**
   * Generate migration steps for ELO/ranking systems
   */
  static getELOMigrationSteps(): MigrationStep[] {
    return [
      {
        step: 1,
        title: 'Import ELO Services',
        description: 'Replace utility imports with service imports',
        codeExample: {
          before: `import { calculateELO } from '../utils/eloCalculator';
import { getRank } from '../utils/rankUtils';`,
          after: `import { BusinessLogicServiceFactory } from '@sabo-pool/shared-business';`
        },
      },
      {
        step: 2,
        title: 'Initialize ELO Services',
        description: 'Create service instances',
        codeExample: {
          before: `// Direct function calls`,
          after: `const eloService = BusinessLogicServiceFactory.getELORatingService();
const rankService = BusinessLogicServiceFactory.getRankTierService();`
        },
      },
      {
        step: 3,
        title: 'Convert ELO Calculations',
        description: 'Replace direct function calls with service methods',
        codeExample: {
          before: `const change = calculateELO(winnerELO, loserELO, kFactor);`,
          after: `const change = eloService.calculateELOChange(winnerELO, loserELO, kFactor);`
        },
      },
      {
        step: 4,
        title: 'Convert Rank Operations',
        description: 'Replace rank utilities with service methods',
        codeExample: {
          before: `const rank = getRank(playerRating);`,
          after: `const rank = rankService.getRankByRating(playerRating);`
        },
      },
    ];
  }

  /**
   * Generate migration steps for payment systems
   */
  static getPaymentMigrationSteps(): MigrationStep[] {
    return [
      {
        step: 1,
        title: 'Import Payment Service',
        description: 'Replace VNPAY gateway import with service import',
        codeExample: {
          before: `import vnpayGateway from '../integrations/vnpay/vnpay-payment-gateway.js';`,
          after: `import { BusinessLogicServiceFactory } from '@sabo-pool/shared-business';`
        },
      },
      {
        step: 2,
        title: 'Initialize Payment Service',
        description: 'Create optimized VNPAY service instance',
        codeExample: {
          before: `// Direct gateway usage`,
          after: `const paymentService = BusinessLogicServiceFactory.getVNPAYService();`
        },
      },
      {
        step: 3,
        title: 'Convert Payment URL Creation',
        description: 'Replace gateway methods with service methods',
        codeExample: {
          before: `const paymentUrl = vnpayGateway.createPaymentUrl(amount, orderId, orderInfo);`,
          after: `const result = await paymentService.createPaymentUrlWithRetry(orderId, amount, orderInfo);
if (result.success && result.data) {
  const paymentUrl = result.data.paymentUrl;
}`
        },
      },
      {
        step: 4,
        title: 'Update Error Handling',
        description: 'Handle structured error responses from service',
        codeExample: {
          before: `try {
  const url = createPaymentUrl(data);
} catch (error) {
  console.error(error);
}`,
          after: `const result = await paymentService.createPaymentUrlWithRetry(orderId, amount, orderInfo);
if (!result.success) {
  console.error('Payment failed:', result.error?.message);
  // Handle specific error codes
  if (result.error?.code === 'CIRCUIT_BREAKER_OPEN') {
    // Show maintenance message
  }
}`
        },
      },
    ];
  }

  /**
   * Estimate migration effort for a component
   */
  static estimateMigrationEffort(
    componentPath: string,
    patterns: string[]
  ): {
    totalTimeMinutes: number;
    complexity: 'simple' | 'moderate' | 'complex';
    breakdown: { pattern: string; timeMinutes: number }[];
  } {
    let totalTime = 0;
    const breakdown: { pattern: string; timeMinutes: number }[] = [];
    let maxComplexity: 'simple' | 'moderate' | 'complex' = 'simple';

    for (const pattern of patterns) {
      const migrationPattern = this.migrationPatterns.find(p => 
        pattern.includes(p.oldPattern.split('(')[0]) // Match function/hook name
      );

      if (migrationPattern) {
        totalTime += migrationPattern.estimatedTimeMinutes;
        breakdown.push({
          pattern: migrationPattern.oldPattern,
          timeMinutes: migrationPattern.estimatedTimeMinutes,
        });

        // Update max complexity
        if (migrationPattern.complexity === 'complex') {
          maxComplexity = 'complex';
        } else if (migrationPattern.complexity === 'moderate' && maxComplexity === 'simple') {
          maxComplexity = 'moderate';
        }
      }
    }

    return {
      totalTimeMinutes: totalTime,
      complexity: maxComplexity,
      breakdown,
    };
  }

  /**
   * Generate complete migration guide for a specific context type
   */
  static generateMigrationGuide(contextType: 'tournament' | 'elo' | 'payment'): {
    title: string;
    overview: string;
    steps: MigrationStep[];
    tips: string[];
    commonPitfalls: string[];
  } {
    const guides = {
      tournament: {
        title: 'Tournament Context Migration Guide',
        overview: 'Migrate from scattered tournament contexts to unified TournamentService',
        steps: this.getTournamentMigrationSteps(),
        tips: [
          'Batch similar components together for efficiency',
          'Test each component after migration',
          'Use service caching for performance',
          'Consider component-level error boundaries',
        ],
        commonPitfalls: [
          'Forgetting to check result.success before using data',
          'Not handling async nature of service methods',
          'Missing userId parameter in service methods',
          'Not properly cleaning up service instances',
        ],
      },
      elo: {
        title: 'ELO/Ranking System Migration Guide',
        overview: 'Migrate from utility functions to consolidated ranking services',
        steps: this.getELOMigrationSteps(),
        tips: [
          'Services are stateless and can be reused',
          'Cache rating calculations for performance',
          'Use service methods for consistency',
        ],
        commonPitfalls: [
          'Direct rating calculations instead of service methods',
          'Not using rank tier services for display',
          'Missing error handling for rating calculations',
        ],
      },
      payment: {
        title: 'Payment System Migration Guide',
        overview: 'Migrate from JavaScript VNPAY gateway to TypeScript service with retry logic',
        steps: this.getPaymentMigrationSteps(),
        tips: [
          'Use optimized service for automatic retries',
          'Implement proper error handling for payments',
          'Monitor circuit breaker status',
          'Cache payment verifications',
        ],
        commonPitfalls: [
          'Not handling retry logic properly',
          'Ignoring circuit breaker states',
          'Missing payment verification steps',
          'Not invalidating payment caches',
        ],
      },
    };

    return guides[contextType];
  }
}

export default ContextMigrationHelper;
