/**
 * Service Integration Guide for SABO Pool V12
 * Provides patterns and best practices for integrating shared business services
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface IntegrationPattern {
  name: string;
  description: string;
  use_case: string;
  code_example: string;
  performance_notes: string[];
  error_handling: string[];
}

export interface ServiceCombination {
  services: string[];
  description: string;
  common_use_cases: string[];
  integration_example: string;
  performance_considerations: string[];
}

/**
 * Comprehensive guide for integrating shared business services
 * Provides patterns, examples, and best practices for service usage
 */
export class ServiceIntegrationGuide {
  /**
   * Integration patterns for individual services
   */
  static getServicePatterns(): IntegrationPattern[] {
    return [
      {
        name: 'Tournament Service Basic Integration',
        description: 'Basic pattern for using TournamentService in React components',
        use_case: 'Component needs to create, read, or update tournaments',
        code_example: `
import { BusinessLogicServiceFactory } from '@sabo-pool/shared-business';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';

function TournamentComponent() {
  const supabase = useSupabaseClient();
  const [tournamentService] = useState(() => 
    BusinessLogicServiceFactory.getTournamentService(supabase)
  );
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTournaments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tournamentService.getTournaments();
      if (result.success && result.data) {
        setTournaments(result.data);
      } else {
        setError(result.error?.message || 'Failed to load tournaments');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {tournaments.map(tournament => (
        <div key={tournament.id}>{tournament.name}</div>
      ))}
    </div>
  );
}`,
        performance_notes: [
          'Initialize service once with useState to avoid recreating',
          'Services are cached automatically for repeated calls',
          'Use loading states for better UX',
        ],
        error_handling: [
          'Always check result.success before using data',
          'Display user-friendly error messages',
          'Implement retry mechanisms for network errors',
        ],
      },

      {
        name: 'ELO Rating Service Integration',
        description: 'Pattern for integrating ELO calculations and ranking services',
        use_case: 'Components need to calculate ELO changes or display player rankings',
        code_example: `
import { BusinessLogicServiceFactory } from '@sabo-pool/shared-business';
import { useState, useMemo } from 'react';

function MatchResultComponent({ match, winner }) {
  const eloService = useMemo(() => 
    BusinessLogicServiceFactory.getELORatingService(), []
  );
  const rankService = useMemo(() => 
    BusinessLogicServiceFactory.getRankTierService(), []
  );

  const eloChanges = useMemo(() => {
    if (!match.player1_rating || !match.player2_rating) return null;
    
    return eloService.calculateELOChange(
      winner === 1 ? match.player1_rating : match.player2_rating,
      winner === 1 ? match.player2_rating : match.player1_rating
    );
  }, [match, winner, eloService]);

  const newRankings = useMemo(() => {
    if (!eloChanges) return null;
    
    return {
      player1: rankService.getRankByRating(
        match.player1_rating + (winner === 1 ? eloChanges.winnerChange : eloChanges.loserChange)
      ),
      player2: rankService.getRankByRating(
        match.player2_rating + (winner === 2 ? eloChanges.winnerChange : eloChanges.loserChange)
      ),
    };
  }, [eloChanges, match, winner, rankService]);

  return (
    <div>
      <h3>Match Result</h3>
      {eloChanges && (
        <div>
          <p>ELO Changes:</p>
          <p>Winner: +{eloChanges.winnerChange}</p>
          <p>Loser: {eloChanges.loserChange}</p>
        </div>
      )}
      {newRankings && (
        <div>
          <p>New Rankings:</p>
          <p>Player 1: {newRankings.player1.rank}</p>
          <p>Player 2: {newRankings.player2.rank}</p>
        </div>
      )}
    </div>
  );
}`,
        performance_notes: [
          'Use useMemo for expensive calculations',
          'Services are lightweight and can be created multiple times',
          'Cache rating calculations when possible',
        ],
        error_handling: [
          'Validate input ratings before calculations',
          'Handle edge cases for rating bounds',
          'Provide fallback displays for missing data',
        ],
      },

      {
        name: 'Payment Service Integration',
        description: 'Pattern for integrating VNPAY payment processing with retry logic',
        use_case: 'Components need to handle payment processing with robust error handling',
        code_example: `
import { BusinessLogicServiceFactory } from '@sabo-pool/shared-business';
import { useState, useCallback } from 'react';

function PaymentComponent({ tournamentId, amount, userInfo }) {
  const [paymentService] = useState(() => 
    BusinessLogicServiceFactory.getVNPAYService()
  );
  const [paymentState, setPaymentState] = useState({
    loading: false,
    error: null,
    paymentUrl: null,
    circuitBreakerOpen: false,
  });

  const processPayment = useCallback(async () => {
    setPaymentState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const orderId = \`tournament_\${tournamentId}_\${Date.now()}\`;
      const orderInfo = \`Tournament entry fee: \${tournamentId}\`;
      
      const result = await paymentService.createPaymentUrlWithRetry(
        orderId,
        amount,
        orderInfo,
        'billpayment',
        userInfo.ipAddress
      );
      
      if (result.success && result.data) {
        setPaymentState(prev => ({ 
          ...prev, 
          paymentUrl: result.data.paymentUrl,
          loading: false 
        }));
        
        // Redirect to payment URL
        window.location.href = result.data.paymentUrl;
      } else {
        const errorCode = result.error?.code;
        const isCircuitBreakerOpen = errorCode === 'CIRCUIT_BREAKER_OPEN';
        
        setPaymentState(prev => ({ 
          ...prev, 
          error: result.error?.message || 'Payment failed',
          circuitBreakerOpen: isCircuitBreakerOpen,
          loading: false 
        }));
      }
    } catch (error) {
      setPaymentState(prev => ({ 
        ...prev, 
        error: 'Network error occurred',
        loading: false 
      }));
    }
  }, [paymentService, tournamentId, amount, userInfo]);

  const checkServiceHealth = useCallback(async () => {
    const health = await paymentService.healthCheck();
    
    if (health.status === 'unhealthy') {
      setPaymentState(prev => ({ 
        ...prev, 
        circuitBreakerOpen: true,
        error: 'Payment service is temporarily unavailable' 
      }));
    }
  }, [paymentService]);

  return (
    <div>
      <h3>Tournament Payment</h3>
      <p>Amount: {amount.toLocaleString('vi-VN')} VND</p>
      
      {paymentState.circuitBreakerOpen && (
        <div className="warning">
          Payment service is temporarily unavailable. Please try again later.
        </div>
      )}
      
      {paymentState.error && !paymentState.circuitBreakerOpen && (
        <div className="error">
          {paymentState.error}
          <button onClick={processPayment}>Retry Payment</button>
        </div>
      )}
      
      <button 
        onClick={processPayment}
        disabled={paymentState.loading || paymentState.circuitBreakerOpen}
      >
        {paymentState.loading ? 'Processing...' : 'Pay Now'}
      </button>
      
      <button onClick={checkServiceHealth}>
        Check Service Status
      </button>
    </div>
  );
}`,
        performance_notes: [
          'Payment service includes automatic retry logic',
          'Circuit breaker prevents cascading failures',
          'Use health checks for proactive error handling',
        ],
        error_handling: [
          'Handle circuit breaker states gracefully',
          'Provide retry options for transient failures',
          'Show appropriate messages for different error types',
        ],
      },
    ];
  }

  /**
   * Service combination patterns for complex workflows
   */
  static getServiceCombinations(): ServiceCombination[] {
    return [
      {
        services: ['TournamentService', 'PaymentService'],
        description: 'Tournament registration with payment processing',
        common_use_cases: [
          'Tournament entry fee payment',
          'Registration with payment validation',
          'Payment failure handling',
        ],
        integration_example: `
// Combined tournament registration and payment workflow
const registerWithPayment = async (tournamentId, userId, paymentAmount) => {
  const tournamentService = BusinessLogicServiceFactory.getTournamentService(supabase);
  const paymentService = BusinessLogicServiceFactory.getVNPAYService();
  
  try {
    // 1. Validate tournament registration
    const tournamentResult = await tournamentService.getTournamentById(tournamentId);
    if (!tournamentResult.success) {
      throw new Error('Tournament not found');
    }
    
    // 2. Check registration eligibility  
    const canRegister = await tournamentService.validateRegistration(
      tournamentResult.data, userId
    );
    if (!canRegister.success) {
      throw new Error(canRegister.error);
    }
    
    // 3. Create payment order
    const orderId = \`tournament_\${tournamentId}_\${userId}_\${Date.now()}\`;
    const paymentResult = await paymentService.createPaymentUrlWithRetry(
      orderId,
      paymentAmount,
      \`Tournament entry: \${tournamentResult.data.name}\`
    );
    
    if (!paymentResult.success) {
      throw new Error('Payment creation failed');
    }
    
    // 4. Store pending registration (to be completed after payment)
    // This would typically be done in your component state or database
    
    return {
      success: true,
      paymentUrl: paymentResult.data.paymentUrl,
      orderId,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};`,
        performance_considerations: [
          'Validate tournament data before payment processing',
          'Use transaction-like patterns for consistency',
          'Cache tournament data to avoid repeated fetches',
          'Implement payment status polling for completion',
        ],
      },

      {
        services: ['ELORatingService', 'SPAPointsService', 'TournamentService'],
        description: 'Tournament completion with ELO and points calculation',
        common_use_cases: [
          'Match result processing',
          'Tournament completion rewards',
          'Ranking updates after tournaments',
        ],
        integration_example: `
// Complete tournament with ELO and SPA points calculation
const completeTournamentMatch = async (matchData, winnerId, loserId) => {
  const eloService = BusinessLogicServiceFactory.getELORatingService();
  const pointsService = BusinessLogicServiceFactory.getSPAPointsService();
  const tournamentService = BusinessLogicServiceFactory.getTournamentService(supabase);
  
  try {
    // 1. Calculate ELO changes
    const eloChanges = eloService.calculateELOChange(
      matchData.winnerCurrentELO,
      matchData.loserCurrentELO
    );
    
    // 2. Calculate SPA points for match
    const spaPoints = pointsService.calculateMatchPoints({
      isWinner: true,
      matchType: 'tournament',
      tournamentTier: matchData.tournamentTier,
      eloChange: eloChanges.winnerChange,
    });
    
    // 3. Update tournament results
    const tournamentUpdate = await tournamentService.updateMatchResult({
      matchId: matchData.id,
      winnerId,
      loserId,
      eloChanges,
      spaPoints,
    });
    
    if (!tournamentUpdate.success) {
      throw new Error('Failed to update tournament');
    }
    
    return {
      success: true,
      data: {
        eloChanges,
        spaPoints,
        tournamentResult: tournamentUpdate.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};`,
        performance_considerations: [
          'Batch ELO and points calculations when possible',
          'Use service caching for repeated calculations',
          'Consider background processing for large tournaments',
          'Implement rollback mechanisms for failed updates',
        ],
      },
    ];
  }

  /**
   * Best practices for service integration
   */
  static getBestPractices(): {
    category: string;
    practices: string[];
  }[] {
    return [
      {
        category: 'Service Initialization',
        practices: [
          'Initialize services once per component using useState or useMemo',
          'Use service factory for consistent configuration',
          'Avoid creating services in render functions',
          'Consider service instance reuse across components',
        ],
      },
      {
        category: 'Error Handling',
        practices: [
          'Always check result.success before using data',
          'Implement user-friendly error messages',
          'Use error boundaries for service failures',
          'Provide retry mechanisms for transient errors',
          'Handle circuit breaker states appropriately',
        ],
      },
      {
        category: 'Performance',
        practices: [
          'Leverage built-in service caching',
          'Use React.memo for components with service data',
          'Implement loading states for better UX',
          'Batch service calls when possible',
          'Monitor cache hit rates and service performance',
        ],
      },
      {
        category: 'Testing',
        practices: [
          'Mock services using dependency injection',
          'Test error scenarios and edge cases',
          'Use service health checks in integration tests',
          'Test cache invalidation scenarios',
          'Validate service result structures',
        ],
      },
      {
        category: 'Security',
        practices: [
          'Validate user permissions before service calls',
          'Sanitize inputs to service methods',
          'Use secure payment processing patterns',
          'Implement rate limiting for service calls',
          'Monitor for suspicious service usage patterns',
        ],
      },
    ];
  }

  /**
   * Common anti-patterns to avoid
   */
  static getAntiPatterns(): {
    pattern: string;
    why_bad: string;
    better_approach: string;
  }[] {
    return [
      {
        pattern: 'Creating service instances in render functions',
        why_bad: 'Causes unnecessary re-initialization and performance issues',
        better_approach: 'Use useState or useMemo to create services once',
      },
      {
        pattern: 'Not checking result.success before using data',
        why_bad: 'Can cause runtime errors and poor user experience',
        better_approach: 'Always validate service results before proceeding',
      },
      {
        pattern: 'Ignoring service errors silently',
        why_bad: 'Makes debugging difficult and provides poor UX',
        better_approach: 'Implement proper error handling and user feedback',
      },
      {
        pattern: 'Making the same service call repeatedly',
        why_bad: 'Wastes resources and slows down the application',
        better_approach: 'Leverage service caching and optimize call patterns',
      },
      {
        pattern: 'Not handling async service methods properly',
        why_bad: 'Can cause race conditions and inconsistent state',
        better_approach: 'Use proper async/await patterns and loading states',
      },
    ];
  }

  /**
   * Generate integration checklist for a component
   */
  static generateIntegrationChecklist(services: string[]): {
    title: string;
    items: { task: string; completed: boolean }[];
  } {
    const baseChecklist = [
      'Import required services from shared-business package',
      'Initialize services using factory pattern',
      'Implement proper error handling for all service calls',
      'Add loading states for async operations',
      'Validate service results before using data',
      'Handle network errors and retries appropriately',
      'Implement user-friendly error messages',
      'Add proper TypeScript types for service data',
      'Test service integration with mock data',
      'Monitor service performance and cache effectiveness',
    ];

    const serviceSpecificItems: { [key: string]: string[] } = {
      'TournamentService': [
        'Handle tournament validation errors',
        'Implement tournament registration flow',
        'Add tournament state management',
        'Handle tournament permission checks',
      ],
      'ELORatingService': [
        'Validate rating inputs before calculations',
        'Handle rating boundary conditions',
        'Implement rank display components',
        'Add ELO change animations/feedback',
      ],
      'VNPAYService': [
        'Handle payment circuit breaker states',
        'Implement payment retry logic',
        'Add payment status monitoring',
        'Handle payment security validations',
      ],
      'SPAPointsService': [
        'Validate points calculation inputs',
        'Handle points redemption logic',
        'Implement points history tracking',
        'Add points balance monitoring',
      ],
    };

    const allItems = [
      ...baseChecklist,
      ...services.flatMap(service => serviceSpecificItems[service] || []),
    ];

    return {
      title: `Service Integration Checklist for ${services.join(', ')}`,
      items: allItems.map(task => ({ task, completed: false })),
    };
  }
}

export default ServiceIntegrationGuide;
