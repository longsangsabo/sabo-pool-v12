/**
 * SPA Points Balance & Transaction Management - Business Logic
 * Phase 2 Expansion Component
 * 
 * Extracted from:
 * - apps/sabo-user/src/services/spaService.ts (basic operations)
 * - RewardsService SPA balance calculations
 * - PaymentBusinessLogic SPA purchase functionality
 * 
 * Handles:
 * - Balance queries and management
 * - Point addition/deduction operations
 * - Transaction history and logging
 * - Ranking requirement validation
 * - Purchase order creation for SPA
 */

import { SPAPointsTransaction, SPATransactionResult } from './spa-system';

// SPA Balance Management Types
export interface SPABalanceInfo {
  user_id: string;
  current_balance: number;
  total_earned: number;
  total_spent: number;
  recent_activity: number;
  last_transaction_at?: Date;
  ranking_registered: boolean;
}

export interface SPATransactionRecord {
  id: string;
  user_id: string;
  amount: number;
  source_type: string;
  transaction_type: 'credit' | 'debit';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  reference_id?: string;
  created_at: Date;
  completed_at?: Date;
}

export interface SPAPurchaseOrder {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  spa_cost: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  created_at: Date;
  completed_at?: Date;
  metadata?: Record<string, any>;
}

/**
 * SPA Balance Service
 * Manages SPA points balance and transaction operations
 */
export class SPABalanceService {
  
  /**
   * Get current SPA balance for user
   */
  async getCurrentBalance(userId: string): Promise<SPABalanceInfo> {
    // Implementation would fetch from player_rankings table
    // This is the business logic structure
    return {
      user_id: userId,
      current_balance: 0,
      total_earned: 0,
      total_spent: 0,
      recent_activity: 0,
      ranking_registered: false,
    };
  }

  /**
   * Add SPA points to user balance
   */
  async addPoints(
    userId: string,
    amount: number,
    sourceType: string,
    description?: string,
    referenceId?: string
  ): Promise<SPATransactionResult> {
    // Validate input
    if (amount <= 0) {
      return {
        success: false,
        balance: 0,
        requiresRanking: false,
        error: 'Invalid amount: must be positive',
      };
    }

    // Check if user has ranking record
    const balanceInfo = await this.getCurrentBalance(userId);
    if (!balanceInfo.ranking_registered) {
      return {
        success: false,
        balance: 0,
        requiresRanking: true,
        error: 'User must register ranking first',
      };
    }

    // Business logic for adding points
    const newBalance = balanceInfo.current_balance + amount;
    
    // Create transaction record
    const transaction: SPATransactionRecord = {
      id: this.generateTransactionId(),
      user_id: userId,
      amount: amount,
      source_type: sourceType,
      transaction_type: 'credit',
      description: description || `${sourceType} reward`,
      status: 'completed',
      reference_id: referenceId,
      created_at: new Date(),
      completed_at: new Date(),
    };

    // Update balance and log transaction
    // Implementation would update database
    
    return {
      success: true,
      balance: newBalance,
      requiresRanking: false,
      transaction: this.convertToPointsTransaction(transaction),
    };
  }

  /**
   * Deduct SPA points from user balance
   */
  async deductPoints(
    userId: string,
    amount: number,
    sourceType: string,
    description?: string,
    referenceId?: string
  ): Promise<SPATransactionResult> {
    // Validate input
    if (amount <= 0) {
      return {
        success: false,
        balance: 0,
        requiresRanking: false,
        error: 'Invalid amount: must be positive',
      };
    }

    // Check if user has ranking record
    const balanceInfo = await this.getCurrentBalance(userId);
    if (!balanceInfo.ranking_registered) {
      return {
        success: false,
        balance: 0,
        requiresRanking: true,
        error: 'User must register ranking first',
      };
    }

    // Check sufficient balance
    if (balanceInfo.current_balance < amount) {
      return {
        success: false,
        balance: balanceInfo.current_balance,
        requiresRanking: false,
        error: 'Insufficient SPA balance',
      };
    }

    // Business logic for deducting points
    const newBalance = balanceInfo.current_balance - amount;
    
    // Create transaction record
    const transaction: SPATransactionRecord = {
      id: this.generateTransactionId(),
      user_id: userId,
      amount: -amount,
      source_type: sourceType,
      transaction_type: 'debit',
      description: description || `${sourceType} purchase`,
      status: 'completed',
      reference_id: referenceId,
      created_at: new Date(),
      completed_at: new Date(),
    };

    // Update balance and log transaction
    // Implementation would update database
    
    return {
      success: true,
      balance: newBalance,
      requiresRanking: false,
      transaction: this.convertToPointsTransaction(transaction),
    };
  }

  /**
   * Get transaction history for user
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SPATransactionRecord[]> {
    // Implementation would fetch from spa_transactions table
    // This is the business logic structure
    return [];
  }

  /**
   * Create SPA purchase order
   */
  async createPurchaseOrder(
    userId: string,
    itemId: string,
    itemName: string,
    spaCost: number,
    metadata?: Record<string, any>
  ): Promise<SPAPurchaseOrder> {
    const order: SPAPurchaseOrder = {
      id: this.generateOrderId(),
      user_id: userId,
      item_id: itemId,
      item_name: itemName,
      spa_cost: spaCost,
      status: 'pending',
      created_at: new Date(),
      metadata: metadata || {},
    };

    // Implementation would save to database
    return order;
  }

  /**
   * Process SPA purchase order
   */
  async processPurchaseOrder(orderId: string): Promise<SPATransactionResult> {
    // Get order details
    const order = await this.getPurchaseOrder(orderId);
    if (!order) {
      return {
        success: false,
        balance: 0,
        requiresRanking: false,
        error: 'Order not found',
      };
    }

    if (order.status !== 'pending') {
      return {
        success: false,
        balance: 0,
        requiresRanking: false,
        error: 'Order already processed',
      };
    }

    // Process the purchase (deduct points)
    const result = await this.deductPoints(
      order.user_id,
      order.spa_cost,
      'purchase',
      `Purchase: ${order.item_name}`,
      order.id
    );

    if (result.success) {
      // Update order status
      order.status = 'completed';
      order.completed_at = new Date();
      // Implementation would update database
    } else {
      // Mark order as failed
      order.status = 'failed';
      // Implementation would update database
    }

    return result;
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrder(orderId: string): Promise<SPAPurchaseOrder | null> {
    // Implementation would fetch from database
    return null;
  }

  /**
   * Get user's purchase history
   */
  async getPurchaseHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SPAPurchaseOrder[]> {
    // Implementation would fetch from database
    return [];
  }

  /**
   * Refund SPA purchase
   */
  async refundPurchase(orderId: string, reason?: string): Promise<SPATransactionResult> {
    const order = await this.getPurchaseOrder(orderId);
    if (!order) {
      return {
        success: false,
        balance: 0,
        requiresRanking: false,
        error: 'Order not found',
      };
    }

    if (order.status !== 'completed') {
      return {
        success: false,
        balance: 0,
        requiresRanking: false,
        error: 'Order cannot be refunded',
      };
    }

    // Add points back to user account
    const result = await this.addPoints(
      order.user_id,
      order.spa_cost,
      'refund',
      `Refund: ${order.item_name}${reason ? ` - ${reason}` : ''}`,
      order.id
    );

    if (result.success) {
      // Update order status
      order.status = 'refunded';
      // Implementation would update database
    }

    return result;
  }

  /**
   * Check if user has sufficient balance for purchase
   */
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const balanceInfo = await this.getCurrentBalance(userId);
    return balanceInfo.ranking_registered && balanceInfo.current_balance >= amount;
  }

  /**
   * Get pending purchase orders for user
   */
  async getPendingOrders(userId: string): Promise<SPAPurchaseOrder[]> {
    // Implementation would fetch from database
    return [];
  }

  /**
   * Cancel pending purchase order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    const order = await this.getPurchaseOrder(orderId);
    if (!order || order.status !== 'pending') {
      return false;
    }

    order.status = 'failed';
    // Implementation would update database
    return true;
  }

  // Private helper methods

  private generateTransactionId(): string {
    return `spa_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOrderId(): string {
    return `spa_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private convertToPointsTransaction(transaction: SPATransactionRecord): SPAPointsTransaction {
    return {
      player_id: transaction.user_id,
      activity_type: transaction.source_type,
      base_points: Math.abs(transaction.amount),
      bonus_points: 0,
      total_points: Math.abs(transaction.amount),
      bonuses: [],
      timestamp: transaction.created_at,
    };
  }
}

/**
 * Centralized SPA Balance Service Instance
 */
export const spaBalanceService = new SPABalanceService();
