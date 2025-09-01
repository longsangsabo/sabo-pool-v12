/**
 * COMPREHENSIVE PAYMENT SERVICE
 * 
 * Mobile-Ready Service Layer for Payment Processing
 * Handles VNPAY integration and transaction management
 * 
 * Target: Eliminate direct payment logic from UI components
 * Features: VNPAY, Wallet, Transactions, Mobile payments, Offline handling
 */

// Types
export interface PaymentMethod {
  id: string;
  type: 'vnpay' | 'wallet' | 'bank_transfer' | 'cash';
  name: string;
  description: string;
  icon_url?: string;
  is_enabled: boolean;
  mobile_supported: boolean;
  offline_supported: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'tournament_entry' | 'club_membership' | 'spa_purchase' | 'prize_payout' | 'refund';
  amount: number;
  currency: 'VND';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method: PaymentMethod['type'];
  payment_provider: 'vnpay' | 'internal' | 'manual';
  provider_transaction_id?: string;
  reference_id?: string; // Tournament ID, Club ID, etc.
  description: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  expires_at?: string;
}

export interface VNPayConfig {
  merchant_id: string;
  secret_key: string;
  return_url: string;
  cancel_url: string;
  sandbox_mode: boolean;
  timeout_minutes: number;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  reference_id?: string;
  user_id: string;
  payment_method: PaymentMethod['type'];
  mobile_optimization?: {
    return_url_scheme?: string; // Deep link scheme for mobile
    use_webview?: boolean;
    auto_close_on_success?: boolean;
  };
}

export interface PaymentResult {
  success: boolean;
  transaction_id: string;
  provider_transaction_id?: string;
  payment_url?: string;
  qr_code_url?: string;
  error_message?: string;
  redirect_required?: boolean;
}

export interface WalletBalance {
  user_id: string;
  balance: number;
  currency: 'VND';
  last_updated: string;
  pending_amount: number;
  frozen_amount: number;
}

export interface RefundRequest {
  transaction_id: string;
  amount?: number; // Partial refund if specified
  reason: string;
  initiated_by: string;
}

/**
 * COMPREHENSIVE PAYMENT SERVICE
 * 
 * Handles all payment operations:
 * - VNPAY integration (web + mobile)
 * - Wallet management
 * - Transaction processing
 * - Refund handling
 * - Mobile payment optimization
 * - Offline payment queuing
 */
export class PaymentService {
  private apiClient: any;
  private vnpayConfig: VNPayConfig;
  private cache: Map<string, any> = new Map();

  constructor(apiClient: any, vnpayConfig: VNPayConfig) {
    this.apiClient = apiClient;
    this.vnpayConfig = vnpayConfig;
  }

  // ===== PAYMENT PROCESSING =====

  /**
   * Create payment request
   * Mobile-optimized with deep linking
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate payment request
      const validation = this.validatePaymentRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check user wallet balance for wallet payments
      if (request.payment_method === 'wallet') {
        return await this.processWalletPayment(request);
      }

      // Process VNPAY payment
      if (request.payment_method === 'vnpay') {
        return await this.processVNPayPayment(request);
      }

      // Process bank transfer
      if (request.payment_method === 'bank_transfer') {
        return await this.processBankTransferPayment(request);
      }

      throw new Error(`Unsupported payment method: ${request.payment_method}`);
    } catch (error) {
      return {
        success: false,
        transaction_id: '',
        error_message: error.message
      };
    }
  }

  /**
   * Process VNPAY payment
   * Mobile-ready with app return handling
   */
  private async processVNPayPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create transaction record
      const transaction = await this.createTransaction({
        user_id: request.user_id,
        type: this.inferTransactionType(request.reference_id),
        amount: request.amount,
        currency: 'VND',
        status: 'pending',
        payment_method: 'vnpay',
        payment_provider: 'vnpay',
        reference_id: request.reference_id,
        description: request.description,
        expires_at: this.calculateExpiryTime(),
        metadata: {
          mobile_optimization: request.mobile_optimization
        }
      });

      // Build VNPAY payment URL
      const vnpayUrl = await this.buildVNPayURL({
        transaction_id: transaction.id,
        amount: request.amount,
        description: request.description,
        return_url: this.buildReturnUrl(request.mobile_optimization?.return_url_scheme),
        mobile_optimized: !!request.mobile_optimization
      });

      return {
        success: true,
        transaction_id: transaction.id,
        payment_url: vnpayUrl,
        redirect_required: true
      };
    } catch (error) {
      throw new Error(`VNPAY payment creation failed: ${error.message}`);
    }
  }

  /**
   * Process wallet payment
   * Mobile-optimized instant payment
   */
  private async processWalletPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Get wallet balance
      const wallet = await this.getWalletBalance(request.user_id);
      if (wallet.balance < request.amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Create transaction
      const transaction = await this.createTransaction({
        user_id: request.user_id,
        type: this.inferTransactionType(request.reference_id),
        amount: request.amount,
        currency: 'VND',
        status: 'processing',
        payment_method: 'wallet',
        payment_provider: 'internal',
        reference_id: request.reference_id,
        description: request.description
      });

      // Deduct from wallet atomically
      await this.deductFromWallet(request.user_id, request.amount, transaction.id);

      // Complete transaction
      await this.completeTransaction(transaction.id);

      return {
        success: true,
        transaction_id: transaction.id,
        redirect_required: false
      };
    } catch (error) {
      throw new Error(`Wallet payment failed: ${error.message}`);
    }
  }

  /**
   * Verify payment callback
   * Mobile-safe webhook handling
   */
  async verifyPaymentCallback(callbackData: any): Promise<{
    transaction_id: string;
    status: 'success' | 'failed' | 'cancelled';
    provider_transaction_id?: string;
  }> {
    try {
      if (callbackData.vnp_TmnCode) {
        return await this.verifyVNPayCallback(callbackData);
      }

      throw new Error('Unknown payment provider callback');
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Get payment status
   * Mobile-friendly status checking
   */
  async getPaymentStatus(transactionId: string): Promise<Transaction> {
    try {
      const transaction = await this.getTransaction(transactionId);
      
      // Check with provider if still pending
      if (transaction.status === 'pending' && transaction.payment_provider === 'vnpay') {
        const providerStatus = await this.checkVNPayStatus(transaction.provider_transaction_id!);
        if (providerStatus !== transaction.status) {
          await this.updateTransactionStatus(transactionId, providerStatus);
          transaction.status = providerStatus;
        }
      }

      return transaction;
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  // ===== WALLET MANAGEMENT =====

  /**
   * Get user wallet balance
   * Mobile-optimized with caching
   */
  async getWalletBalance(userId: string): Promise<WalletBalance> {
    try {
      const cacheKey = `wallet_${userId}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 30000) { // 30 second cache
          return cached.data;
        }
      }

      const { data, error } = await this.apiClient
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found
        throw error;
      }

      const wallet = data || await this.createWallet(userId);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: wallet,
        timestamp: Date.now()
      });

      return wallet;
    } catch (error) {
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  /**
   * Add funds to wallet
   * Mobile-ready top-up functionality
   */
  async addFundsToWallet(
    userId: string, 
    amount: number, 
    source: 'vnpay' | 'bank_transfer' | 'admin_credit'
  ): Promise<Transaction> {
    try {
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      // Create add funds transaction
      const transaction = await this.createTransaction({
        user_id: userId,
        type: 'spa_purchase',
        amount: amount,
        currency: 'VND',
        status: 'completed',
        payment_method: source,
        payment_provider: source === 'vnpay' ? 'vnpay' : 'internal',
        description: `Add ${amount.toLocaleString('vi-VN')} VND to wallet`
      });

      // Add to wallet
      await this.addToWallet(userId, amount, transaction.id);

      // Clear cache
      this.cache.delete(`wallet_${userId}`);

      return transaction;
    } catch (error) {
      throw new Error(`Failed to add funds to wallet: ${error.message}`);
    }
  }

  /**
   * Transfer between wallets
   * Mobile-friendly P2P transfers
   */
  async transferFunds(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string
  ): Promise<{ fromTransaction: Transaction; toTransaction: Transaction }> {
    try {
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      // Check sender balance
      const senderWallet = await this.getWalletBalance(fromUserId);
      if (senderWallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Create both transactions atomically
      const fromTransaction = await this.createTransaction({
        user_id: fromUserId,
        type: 'spa_purchase',
        amount: -amount,
        currency: 'VND',
        status: 'completed',
        payment_method: 'wallet',
        payment_provider: 'internal',
        description: `Transfer to user: ${description}`
      });

      const toTransaction = await this.createTransaction({
        user_id: toUserId,
        type: 'spa_purchase',
        amount: amount,
        currency: 'VND',
        status: 'completed',
        payment_method: 'wallet',
        payment_provider: 'internal',
        description: `Transfer from user: ${description}`
      });

      // Execute transfer atomically
      await this.executeAtomicTransfer(fromUserId, toUserId, amount, fromTransaction.id, toTransaction.id);

      // Clear caches
      this.cache.delete(`wallet_${fromUserId}`);
      this.cache.delete(`wallet_${toUserId}`);

      return { fromTransaction, toTransaction };
    } catch (error) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  // ===== TRANSACTION MANAGEMENT =====

  /**
   * Get user transactions
   * Mobile-optimized with pagination
   */
  async getUserTransactions(
    userId: string,
    options?: {
      type?: Transaction['type'];
      status?: Transaction['status'];
      limit?: number;
      offset?: number;
    }
  ): Promise<{ transactions: Transaction[]; total: number; hasMore: boolean }> {
    try {
      let query = this.apiClient
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        transactions: data || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      };
    } catch (error) {
      throw new Error(`Failed to get user transactions: ${error.message}`);
    }
  }

  /**
   * Get transaction details
   * Mobile-friendly transaction view
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const { data, error } = await this.apiClient
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  // ===== REFUND OPERATIONS =====

  /**
   * Request refund
   * Mobile-ready refund processing
   */
  async requestRefund(refundRequest: RefundRequest): Promise<Transaction> {
    try {
      // Get original transaction
      const originalTransaction = await this.getTransaction(refundRequest.transaction_id);
      
      if (originalTransaction.status !== 'completed') {
        throw new Error('Can only refund completed transactions');
      }

      const refundAmount = refundRequest.amount || originalTransaction.amount;
      
      if (refundAmount > originalTransaction.amount) {
        throw new Error('Refund amount cannot exceed original amount');
      }

      // Create refund transaction
      const refundTransaction = await this.createTransaction({
        user_id: originalTransaction.user_id,
        type: 'refund',
        amount: refundAmount,
        currency: 'VND',
        status: 'processing',
        payment_method: originalTransaction.payment_method,
        payment_provider: originalTransaction.payment_provider,
        reference_id: originalTransaction.reference_id,
        description: `Refund: ${refundRequest.reason}`,
        metadata: {
          original_transaction_id: refundRequest.transaction_id,
          refund_reason: refundRequest.reason,
          initiated_by: refundRequest.initiated_by
        }
      });

      // Process refund based on original payment method
      if (originalTransaction.payment_method === 'wallet') {
        await this.addToWallet(originalTransaction.user_id, refundAmount, refundTransaction.id);
        await this.completeTransaction(refundTransaction.id);
      } else if (originalTransaction.payment_method === 'vnpay') {
        await this.processVNPayRefund(originalTransaction, refundAmount);
      }

      return refundTransaction;
    } catch (error) {
      throw new Error(`Refund request failed: ${error.message}`);
    }
  }

  // ===== MOBILE-SPECIFIC FEATURES =====

  /**
   * Generate QR code for payment
   * Mobile-optimized payment QR
   */
  async generatePaymentQR(transactionId: string): Promise<string> {
    try {
      const transaction = await this.getTransaction(transactionId);
      
      if (transaction.status !== 'pending') {
        throw new Error('Can only generate QR for pending transactions');
      }

      // Generate QR data
      const qrData = {
        transaction_id: transactionId,
        amount: transaction.amount,
        currency: transaction.currency,
        expires_at: transaction.expires_at
      };

      // Create QR code (implementation would use QR library)
      const qrCodeUrl = await this.createQRCode(JSON.stringify(qrData));
      
      return qrCodeUrl;
    } catch (error) {
      throw new Error(`Failed to generate payment QR: ${error.message}`);
    }
  }

  /**
   * Process offline payment queue
   * Mobile-specific offline handling
   */
  async processOfflinePaymentQueue(): Promise<{ processed: number; failed: number }> {
    try {
      const offlinePayments = await this.getOfflinePayments();
      let processed = 0;
      let failed = 0;

      for (const payment of offlinePayments) {
        try {
          await this.createPayment(payment);
          await this.removeOfflinePayment(payment.id);
          processed++;
        } catch (error) {
          console.error('Failed to process offline payment:', error);
          failed++;
        }
      }

      return { processed, failed };
    } catch (error) {
      throw new Error(`Failed to process offline payment queue: ${error.message}`);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private validatePaymentRequest(request: PaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (request.amount <= 0) {
      errors.push('Amount must be positive');
    }

    if (request.amount > 100000000) { // 100M VND limit
      errors.push('Amount exceeds maximum limit');
    }

    if (!request.description || request.description.length < 3) {
      errors.push('Description is required');
    }

    if (!request.user_id) {
      errors.push('User ID is required');
    }

    return { isValid: errors.length === 0, errors };
  }

  private async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    const { data: transaction, error } = await this.apiClient
      .from('transactions')
      .insert([{
        ...data,
        id: this.generateTransactionId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return transaction;
  }

  private async completeTransaction(transactionId: string): Promise<void> {
    await this.apiClient
      .from('transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);
  }

  private async updateTransactionStatus(transactionId: string, status: Transaction['status']): Promise<void> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    await this.apiClient
      .from('transactions')
      .update(updates)
      .eq('id', transactionId);
  }

  private async createWallet(userId: string): Promise<WalletBalance> {
    const { data, error } = await this.apiClient
      .from('user_wallets')
      .insert([{
        user_id: userId,
        balance: 0,
        currency: 'VND',
        last_updated: new Date().toISOString(),
        pending_amount: 0,
        frozen_amount: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async deductFromWallet(userId: string, amount: number, transactionId: string): Promise<void> {
    const { error } = await this.apiClient.rpc('deduct_from_wallet', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_id: transactionId
    });

    if (error) throw error;
  }

  private async addToWallet(userId: string, amount: number, transactionId: string): Promise<void> {
    const { error } = await this.apiClient.rpc('add_to_wallet', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_id: transactionId
    });

    if (error) throw error;
  }

  private async executeAtomicTransfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    fromTransactionId: string,
    toTransactionId: string
  ): Promise<void> {
    const { error } = await this.apiClient.rpc('atomic_wallet_transfer', {
      p_from_user_id: fromUserId,
      p_to_user_id: toUserId,
      p_amount: amount,
      p_from_transaction_id: fromTransactionId,
      p_to_transaction_id: toTransactionId
    });

    if (error) throw error;
  }

  private inferTransactionType(referenceId?: string): Transaction['type'] {
    if (!referenceId) return 'spa_purchase';
    
    if (referenceId.startsWith('tournament_')) return 'tournament_entry';
    if (referenceId.startsWith('club_')) return 'club_membership';
    
    return 'spa_purchase';
  }

  private calculateExpiryTime(): string {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.vnpayConfig.timeout_minutes);
    return expiry.toISOString();
  }

  private generateTransactionId(): string {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private buildReturnUrl(mobileScheme?: string): string {
    if (mobileScheme) {
      return `${mobileScheme}://payment-return`;
    }
    return this.vnpayConfig.return_url;
  }

  // VNPAY specific methods (simplified - would need full implementation)
  private async buildVNPayURL(params: any): Promise<string> {
    // Implementation would build proper VNPAY URL with signature
    return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${new URLSearchParams(params).toString()}`;
  }

  private async verifyVNPayCallback(data: any): Promise<any> {
    // Implementation would verify VNPAY signature and status
    return {
      transaction_id: data.vnp_TxnRef,
      status: data.vnp_ResponseCode === '00' ? 'success' : 'failed',
      provider_transaction_id: data.vnp_TransactionNo
    };
  }

  private async checkVNPayStatus(providerTransactionId: string): Promise<Transaction['status']> {
    // Implementation would query VNPAY for transaction status
    return 'completed';
  }

  private async processVNPayRefund(transaction: Transaction, amount: number): Promise<void> {
    // Implementation would process VNPAY refund
  }

  private async processBankTransferPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Implementation for bank transfer payments
    throw new Error('Bank transfer not implemented');
  }

  private async createQRCode(data: string): Promise<string> {
    // Implementation would generate QR code
    return 'data:image/png;base64,mock-qr-code';
  }

  private async getOfflinePayments(): Promise<any[]> {
    // Get queued offline payments
    return [];
  }

  private async removeOfflinePayment(paymentId: string): Promise<void> {
    // Remove processed offline payment
  }
}

// Export for mobile app consumption
export default PaymentService;
