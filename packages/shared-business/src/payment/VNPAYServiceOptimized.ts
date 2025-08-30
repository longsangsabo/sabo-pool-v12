/**
 * Enhanced VNPAY Service with Retry Logic and Performance Optimizations
 * Built on top of the existing VNPAYService for production-ready payment processing
 */

import { VNPAYService } from './VNPAYService';
import { ServiceCacheManager, CacheInvalidationManager } from '../performance/ServiceCache';
import {
  VNPAYConfig,
  VNPAYPaymentParams,
  VNPAYResponse,
  VNPAYReturnParams,
  PaymentServiceResult,
  VNPAYResponseCode,
  PaymentError,
} from './payment-types';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

interface PaymentAttempt {
  attempt: number;
  timestamp: number;
  error?: string;
  success: boolean;
}

interface PaymentMetrics {
  totalAttempts: number;
  successfulPayments: number;
  failedPayments: number;
  averageResponseTime: number;
  retryRate: number;
}

/**
 * Production-ready VNPAY Service with advanced features:
 * - Automatic retry logic with exponential backoff
 * - Payment attempt tracking and metrics
 * - Intelligent caching for payment validation
 * - Circuit breaker pattern for service reliability
 * - Performance monitoring and optimization
 */
export class VNPAYServiceOptimized extends VNPAYService {
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'TEMPORARY_FAILURE', '24', '51', '65'],
  };

  private paymentAttempts = new Map<string, PaymentAttempt[]>();
  private circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly circuitBreakerThreshold = 5;
  private readonly circuitBreakerTimeout = 60000; // 1 minute

  /**
   * Enhanced payment URL creation with retry logic and caching
   */
  async createPaymentUrlWithRetry(
    orderId: string,
    amount: number,
    orderInfo: string,
    orderType: string = 'billpayment',
    ipAddress: string = '127.0.0.1',
    config?: any
  ): Promise<PaymentServiceResult<VNPAYResponse>> {
    const startTime = Date.now();
    const attemptKey = orderId;

    // Check circuit breaker
    if (this.isCircuitBreakerOpen()) {
      return {
        success: false,
        error: {
          code: 'CIRCUIT_BREAKER_OPEN',
          message: 'Payment service temporarily unavailable. Please try again later.',
          details: 'Circuit breaker is open due to multiple failures'
        },
      };
    }

    // Check cache for recent duplicate requests
    const cacheKey = ServiceCacheManager.generateKey(
      'payment:url',
      orderId,
      String(amount)
    );

    const cachedResult = ServiceCacheManager.paymentCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult as PaymentServiceResult<VNPAYResponse>;
    }

    let lastError: any;
    let attempt = 1;

    while (attempt <= this.retryConfig.maxRetries + 1) {
      try {
        this.recordPaymentAttempt(attemptKey, attempt, false);

        // Call parent method with correct signature
        const result = this.createPaymentUrl(
          orderId,
          amount,
          orderInfo,
          orderType,
          ipAddress,
          config
        );

        if (result.success) {
          this.recordPaymentAttempt(attemptKey, attempt, true);
          this.onPaymentSuccess();
          
          // Cache successful result for short duration
          ServiceCacheManager.paymentCache.set(cacheKey, result, 30 * 1000); // 30 seconds
          
          return result;
        } else {
          // Check if error is retryable
          const errorCode = result.error?.code || 'UNKNOWN_ERROR';
          if (this.isRetryableError(errorCode) && attempt <= this.retryConfig.maxRetries) {
            await this.waitWithExponentialBackoff(attempt);
            attempt++;
            lastError = result.error;
            continue;
          } else {
            this.onPaymentFailure();
            return result;
          }
        }
      } catch (error: any) {
        lastError = error;
        
        if (this.isRetryableError(error.code) && attempt <= this.retryConfig.maxRetries) {
          await this.waitWithExponentialBackoff(attempt);
          attempt++;
          continue;
        } else {
          this.onPaymentFailure();
          break;
        }
      }
    }

    return {
      success: false,
      error: {
        code: 'MAX_RETRIES_EXCEEDED',
        message: `Payment failed after ${this.retryConfig.maxRetries} retries`,
        details: lastError?.message || String(lastError)
      },
    };
  }

  /**
   * Enhanced payment verification with caching and retry logic
   */
  async verifyPaymentWithRetry(
    returnParams: VNPAYReturnParams,
    orderId?: string
  ): Promise<PaymentServiceResult<any>> {
    const cacheKey = ServiceCacheManager.generateKey(
      'payment:verify',
      returnParams.vnp_TxnRef,
      returnParams.vnp_TransactionNo || 'unknown'
    );

    // Check cache first
    const cachedResult = ServiceCacheManager.paymentCache.get(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult as PaymentServiceResult<any>;
    }

    let attempt = 1;
    let lastError: any;

    while (attempt <= this.retryConfig.maxRetries + 1) {
      try {
        const result = this.processReturnUrl(returnParams);
        
        if (result.success) {
          // Cache successful verification
          ServiceCacheManager.paymentCache.set(cacheKey, result, 60 * 1000); // 1 minute
          
          // Invalidate related payment caches
          if (orderId) {
            CacheInvalidationManager.invalidatePaymentData(
              returnParams.vnp_TxnRef.split('_')[0] || '', // Extract user ID
              orderId
            );
          }
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        if (this.isRetryableError(error.code) && attempt <= this.retryConfig.maxRetries) {
          await this.waitWithExponentialBackoff(attempt);
          attempt++;
          continue;
        } else {
          break;
        }
      }
    }

    return {
      success: false,
      error: {
        code: 'VERIFICATION_FAILED',
        message: `Payment verification failed after retries`,
        details: lastError?.message || String(lastError)
      },
    };
  }

  /**
   * Get payment metrics and statistics
   */
  getPaymentMetrics(): PaymentMetrics {
    let totalAttempts = 0;
    let successfulPayments = 0;
    let failedPayments = 0;
    let totalRetries = 0;

    for (const attempts of this.paymentAttempts.values()) {
      totalAttempts += attempts.length;
      const successful = attempts.some(a => a.success);
      
      if (successful) {
        successfulPayments++;
      } else {
        failedPayments++;
      }
      
      if (attempts.length > 1) {
        totalRetries += attempts.length - 1;
      }
    }

    return {
      totalAttempts,
      successfulPayments,
      failedPayments,
      averageResponseTime: 0, // Could be implemented with timing
      retryRate: totalAttempts > 0 ? totalRetries / totalAttempts : 0,
    };
  }

  /**
   * Clear payment attempt history (for memory management)
   */
  clearPaymentHistory(olderThanMinutes: number = 60): void {
    const cutoffTime = Date.now() - (olderThanMinutes * 60 * 1000);
    
    for (const [key, attempts] of this.paymentAttempts.entries()) {
      const filteredAttempts = attempts.filter(a => a.timestamp > cutoffTime);
      
      if (filteredAttempts.length === 0) {
        this.paymentAttempts.delete(key);
      } else {
        this.paymentAttempts.set(key, filteredAttempts);
      }
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(errorCode?: string): boolean {
    if (!errorCode) return false;
    return this.retryConfig.retryableErrors.includes(errorCode);
  }

  /**
   * Wait with exponential backoff
   */
  private async waitWithExponentialBackoff(attempt: number): Promise<void> {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
      this.retryConfig.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    
    await new Promise(resolve => setTimeout(resolve, delay + jitter));
  }

  /**
   * Record payment attempt for metrics
   */
  private recordPaymentAttempt(key: string, attempt: number, success: boolean, error?: string): void {
    if (!this.paymentAttempts.has(key)) {
      this.paymentAttempts.set(key, []);
    }
    
    this.paymentAttempts.get(key)!.push({
      attempt,
      timestamp: Date.now(),
      success,
      error,
    });
  }

  /**
   * Circuit breaker pattern implementation
   */
  private isCircuitBreakerOpen(): boolean {
    if (this.circuitBreakerState === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.circuitBreakerTimeout) {
        this.circuitBreakerState = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  private onPaymentSuccess(): void {
    if (this.circuitBreakerState === 'HALF_OPEN') {
      this.circuitBreakerState = 'CLOSED';
      this.failureCount = 0;
    }
  }

  private onPaymentFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitBreakerState = 'OPEN';
    }
  }

  /**
   * Health check for payment service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    circuitBreaker: string;
    metrics: PaymentMetrics;
    lastError?: string;
  }> {
    const metrics = this.getPaymentMetrics();
    const recentFailureRate = metrics.failedPayments / (metrics.successfulPayments + metrics.failedPayments || 1);

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (this.circuitBreakerState === 'OPEN') {
      status = 'unhealthy';
    } else if (recentFailureRate > 0.1) { // More than 10% failure rate
      status = 'degraded';
    }

    return {
      status,
      circuitBreaker: this.circuitBreakerState,
      metrics,
    };
  }
}

export default VNPAYServiceOptimized;
