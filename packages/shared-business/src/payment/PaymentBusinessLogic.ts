import {
  PaymentOrder,
  PaymentOrderItem,
  PaymentTransaction,
  PaymentValidationResult,
  PaymentValidationError,
  PaymentValidationWarning,
  TournamentPaymentInfo,
  TournamentPaymentOrder,
  SPAPointsPackage,
  SPAPointsPurchaseOrder,
  PaymentServiceResult,
  PaymentMethod,
  RefundRequest,
  RefundResponse,
  PaymentAnalytics,
  PaymentMethodStats,
} from './payment-types';

/**
 * SABO Pool Arena - Payment Business Logic Service
 * 
 * Consolidated payment business logic extracted from:
 * - Tournament registration payment flows
 * - SPA Points purchase logic
 * - Payment validation and business rules
 * - Order management and processing
 * - Refund and cancellation logic
 * 
 * This service handles all payment business operations:
 * - Order creation and validation
 * - Payment method selection and rules
 * - Tournament entry fee calculations
 * - SPA Points package pricing
 * - Refund policy enforcement
 * - Payment analytics and reporting
 */
export class PaymentBusinessLogic {
  private readonly paymentMethods: PaymentMethod[] = [
    {
      id: 'vnpay',
      name: 'VNPAY',
      code: 'vnpay',
      type: 'gateway',
      enabled: true,
      min_amount: 10000, // 10,000 VND
      max_amount: 50000000, // 50,000,000 VND
      currency: 'VND',
      fee_percentage: 2.0, // 2%
      fee_fixed: 0,
      processing_time: '1-3 minutes',
      description: 'Pay using Vietnamese banks, Visa, Mastercard',
      logo_url: '/images/payment/vnpay-logo.png',
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      code: 'bank_transfer',
      type: 'bank_transfer',
      enabled: true,
      min_amount: 50000, // 50,000 VND
      max_amount: 100000000, // 100,000,000 VND
      currency: 'VND',
      fee_percentage: 0,
      fee_fixed: 0,
      processing_time: '30 minutes - 2 hours',
      description: 'Direct bank transfer with manual verification',
      logo_url: '/images/payment/bank-transfer-logo.png',
    },
  ];

  private readonly spaPointsPackages: SPAPointsPackage[] = [
    {
      id: 'spa_starter',
      name: 'Starter Pack',
      points_amount: 1000,
      price: 50000, // 50,000 VND
      currency: 'VND',
      bonus_points: 100,
      total_points: 1100,
      discount_percentage: 10,
      description: 'Perfect for beginners',
    },
    {
      id: 'spa_popular',
      name: 'Popular Pack',
      points_amount: 2500,
      price: 100000, // 100,000 VND
      currency: 'VND',
      bonus_points: 500,
      total_points: 3000,
      discount_percentage: 20,
      popular: true,
      description: 'Most popular choice',
    },
    {
      id: 'spa_premium',
      name: 'Premium Pack',
      points_amount: 5000,
      price: 200000, // 200,000 VND
      currency: 'VND',
      bonus_points: 1500,
      total_points: 6500,
      discount_percentage: 30,
      description: 'Best value for serious players',
    },
    {
      id: 'spa_ultimate',
      name: 'Ultimate Pack',
      points_amount: 10000,
      price: 350000, // 350,000 VND
      currency: 'VND',
      bonus_points: 4000,
      total_points: 14000,
      discount_percentage: 40,
      description: 'Maximum points and bonus',
    },
  ];

  /**
   * Create tournament payment order
   */
  createTournamentPaymentOrder(
    tournamentInfo: TournamentPaymentInfo,
    participantInfo: {
      user_id: string;
      username: string;
      email: string;
      phone?: string;
      rank: string;
      rating: number;
    }
  ): PaymentServiceResult<TournamentPaymentOrder> {
    try {
      // Validate tournament registration eligibility
      const validation = this.validateTournamentRegistration(tournamentInfo, participantInfo);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Tournament registration validation failed',
            details: validation.errors,
          },
        };
      }

      // Generate order ID
      const orderId = `TOURNAMENT_${tournamentInfo.tournament_id}_${Date.now()}`;

      // Create order items
      const orderItem: PaymentOrderItem = {
        id: `${orderId}_ENTRY`,
        order_id: orderId,
        item_type: 'tournament_entry',
        item_id: tournamentInfo.tournament_id,
        item_name: `${tournamentInfo.tournament_name} - Entry Fee`,
        quantity: 1,
        unit_price: tournamentInfo.entry_fee,
        total_price: tournamentInfo.entry_fee,
        metadata: {
          tournament_id: tournamentInfo.tournament_id,
          tournament_name: tournamentInfo.tournament_name,
          participant_rank: participantInfo.rank,
          participant_rating: participantInfo.rating,
        },
      };

      // Calculate payment deadline (24 hours before tournament or registration deadline)
      const paymentDeadline = new Date(Math.min(
        tournamentInfo.registration_deadline.getTime(),
        tournamentInfo.registration_deadline.getTime() - (24 * 60 * 60 * 1000) // 24 hours before
      ));

      // Create tournament payment order
      const order: TournamentPaymentOrder = {
        id: orderId,
        user_id: participantInfo.user_id,
        amount: tournamentInfo.entry_fee,
        currency: tournamentInfo.currency,
        description: `Tournament Entry: ${tournamentInfo.tournament_name}`,
        order_type: 'tournament_entry',
        status: 'draft',
        items: [orderItem],
        total_amount: tournamentInfo.entry_fee,
        created_at: new Date(),
        updated_at: new Date(),
        payment_deadline: paymentDeadline,
        expires_at: tournamentInfo.registration_deadline,
        metadata: {
          tournament_id: tournamentInfo.tournament_id,
          participant_id: participantInfo.user_id,
          registration_type: 'individual',
        },
        tournament_info: tournamentInfo,
        participant_info: participantInfo,
      };

      return {
        success: true,
        data: order,
        message: 'Tournament payment order created successfully',
      };
    } catch (error) {
      console.error('Error creating tournament payment order:', error);
      return {
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: 'Failed to create tournament payment order',
          details: error,
        },
      };
    }
  }

  /**
   * Create SPA Points purchase order
   */
  createSPAPointsPurchaseOrder(
    userId: string,
    packageId: string,
    promotionCode?: string
  ): PaymentServiceResult<SPAPointsPurchaseOrder> {
    try {
      // Find SPA Points package
      const packageInfo = this.spaPointsPackages.find(pkg => pkg.id === packageId);
      if (!packageInfo) {
        return {
          success: false,
          error: {
            code: 'PACKAGE_NOT_FOUND',
            message: 'SPA Points package not found',
          },
        };
      }

      // Validate package availability
      if (packageInfo.limited_time && packageInfo.expires_at && packageInfo.expires_at < new Date()) {
        return {
          success: false,
          error: {
            code: 'PACKAGE_EXPIRED',
            message: 'SPA Points package has expired',
          },
        };
      }

      // Generate order ID
      const orderId = `SPA_POINTS_${packageId}_${Date.now()}`;

      // Apply promotion if provided
      let finalPrice = packageInfo.price;
      let promotionDiscount = 0;
      if (promotionCode) {
        const promotion = this.validatePromotionCode(promotionCode, packageInfo);
        if (promotion.valid) {
          promotionDiscount = promotion.discount_amount;
          finalPrice = Math.max(0, finalPrice - promotionDiscount);
        }
      }

      // Create order item
      const orderItem: PaymentOrderItem = {
        id: `${orderId}_SPA_POINTS`,
        order_id: orderId,
        item_type: 'spa_points_pack',
        item_id: packageId,
        item_name: `${packageInfo.name} - ${packageInfo.total_points.toLocaleString()} SPA Points`,
        quantity: 1,
        unit_price: packageInfo.price,
        total_price: finalPrice,
        metadata: {
          base_points: packageInfo.points_amount,
          bonus_points: packageInfo.bonus_points,
          total_points: packageInfo.total_points,
          discount_percentage: packageInfo.discount_percentage,
          promotion_code: promotionCode,
          promotion_discount: promotionDiscount,
        },
      };

      // Create SPA Points purchase order
      const order: SPAPointsPurchaseOrder = {
        id: orderId,
        user_id: userId,
        amount: finalPrice,
        currency: packageInfo.currency,
        description: `SPA Points Purchase: ${packageInfo.name}`,
        order_type: 'spa_points',
        status: 'draft',
        items: [orderItem],
        total_amount: finalPrice,
        discount_amount: promotionDiscount,
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        metadata: {
          package_id: packageId,
          promotion_code: promotionCode,
        },
        package_info: packageInfo,
        bonus_applied: packageInfo.bonus_points > 0,
        promotion_code: promotionCode,
      };

      return {
        success: true,
        data: order,
        message: 'SPA Points purchase order created successfully',
      };
    } catch (error) {
      console.error('Error creating SPA Points purchase order:', error);
      return {
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: 'Failed to create SPA Points purchase order',
          details: error,
        },
      };
    }
  }

  /**
   * Validate tournament registration
   */
  validateTournamentRegistration(
    tournamentInfo: TournamentPaymentInfo,
    participantInfo: { user_id: string; rank: string; rating: number }
  ): PaymentValidationResult {
    const errors: PaymentValidationError[] = [];
    const warnings: PaymentValidationWarning[] = [];

    // Check registration deadline
    if (new Date() > tournamentInfo.registration_deadline) {
      errors.push({
        field: 'registration_deadline',
        code: 'REGISTRATION_CLOSED',
        message: 'Tournament registration has closed',
        details: {
          deadline: tournamentInfo.registration_deadline,
          current_time: new Date(),
        },
      });
    }

    // Check tournament capacity
    if (tournamentInfo.current_participants >= tournamentInfo.max_participants) {
      errors.push({
        field: 'participants',
        code: 'TOURNAMENT_FULL',
        message: 'Tournament is full',
        details: {
          max_participants: tournamentInfo.max_participants,
          current_participants: tournamentInfo.current_participants,
        },
      });
    }

    // Check entry fee amount
    if (tournamentInfo.entry_fee <= 0) {
      errors.push({
        field: 'entry_fee',
        code: 'INVALID_ENTRY_FEE',
        message: 'Invalid entry fee amount',
        details: { entry_fee: tournamentInfo.entry_fee },
      });
    }

    // Check payment deadline
    if (tournamentInfo.payment_deadline < new Date()) {
      errors.push({
        field: 'payment_deadline',
        code: 'PAYMENT_DEADLINE_PASSED',
        message: 'Payment deadline has passed',
        details: {
          deadline: tournamentInfo.payment_deadline,
          current_time: new Date(),
        },
      });
    }

    // Warn about upcoming deadlines
    const hoursUntilDeadline = (tournamentInfo.registration_deadline.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilDeadline < 24 && hoursUntilDeadline > 0) {
      warnings.push({
        field: 'registration_deadline',
        code: 'DEADLINE_APPROACHING',
        message: `Registration closes in ${Math.round(hoursUntilDeadline)} hours`,
        details: { hours_remaining: hoursUntilDeadline },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate payment order
   */
  validatePaymentOrder(order: PaymentOrder): PaymentValidationResult {
    const errors: PaymentValidationError[] = [];
    const warnings: PaymentValidationWarning[] = [];

    // Validate order amount
    if (order.amount <= 0) {
      errors.push({
        field: 'amount',
        code: 'INVALID_AMOUNT',
        message: 'Order amount must be greater than 0',
        details: { amount: order.amount },
      });
    }

    // Validate currency
    if (!['VND', 'USD'].includes(order.currency)) {
      errors.push({
        field: 'currency',
        code: 'UNSUPPORTED_CURRENCY',
        message: 'Unsupported currency',
        details: { currency: order.currency },
      });
    }

    // Validate order items
    if (!order.items || order.items.length === 0) {
      errors.push({
        field: 'items',
        code: 'NO_ITEMS',
        message: 'Order must contain at least one item',
      });
    } else {
      // Validate each item
      order.items.forEach((item, index) => {
        if (item.quantity <= 0) {
          errors.push({
            field: `items[${index}].quantity`,
            code: 'INVALID_QUANTITY',
            message: 'Item quantity must be greater than 0',
            details: { item_id: item.id, quantity: item.quantity },
          });
        }

        if (item.unit_price < 0) {
          errors.push({
            field: `items[${index}].unit_price`,
            code: 'INVALID_PRICE',
            message: 'Item price cannot be negative',
            details: { item_id: item.id, price: item.unit_price },
          });
        }
      });

      // Validate total calculation
      const calculatedTotal = order.items.reduce((sum, item) => sum + item.total_price, 0);
      const expectedTotal = calculatedTotal - (order.discount_amount || 0) + (order.tax_amount || 0);
      
      if (Math.abs(order.total_amount - expectedTotal) > 0.01) {
        errors.push({
          field: 'total_amount',
          code: 'TOTAL_MISMATCH',
          message: 'Order total does not match calculated amount',
          details: {
            provided_total: order.total_amount,
            calculated_total: expectedTotal,
            difference: order.total_amount - expectedTotal,
          },
        });
      }
    }

    // Check order expiration
    if (order.expires_at && order.expires_at < new Date()) {
      errors.push({
        field: 'expires_at',
        code: 'ORDER_EXPIRED',
        message: 'Order has expired',
        details: {
          expires_at: order.expires_at,
          current_time: new Date(),
        },
      });
    }

    // Warn about approaching expiration
    if (order.expires_at) {
      const hoursUntilExpiry = (order.expires_at.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilExpiry < 2 && hoursUntilExpiry > 0) {
        warnings.push({
          field: 'expires_at',
          code: 'EXPIRY_APPROACHING',
          message: `Order expires in ${Math.round(hoursUntilExpiry * 60)} minutes`,
          details: { minutes_remaining: hoursUntilExpiry * 60 },
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
   * Calculate payment fees
   */
  calculatePaymentFees(amount: number, paymentMethodId: string): {
    base_amount: number;
    fee_percentage: number;
    fee_amount: number;
    total_amount: number;
    payment_method: PaymentMethod | null;
  } {
    const paymentMethod = this.paymentMethods.find(method => method.id === paymentMethodId);
    
    if (!paymentMethod) {
      return {
        base_amount: amount,
        fee_percentage: 0,
        fee_amount: 0,
        total_amount: amount,
        payment_method: null,
      };
    }

    const feeAmount = Math.round(
      (amount * paymentMethod.fee_percentage / 100) + paymentMethod.fee_fixed
    );

    return {
      base_amount: amount,
      fee_percentage: paymentMethod.fee_percentage,
      fee_amount: feeAmount,
      total_amount: amount + feeAmount,
      payment_method: paymentMethod,
    };
  }

  /**
   * Get available payment methods for amount
   */
  getAvailablePaymentMethods(amount: number, currency: string = 'VND'): PaymentMethod[] {
    return this.paymentMethods.filter(method => 
      method.enabled &&
      method.currency === currency &&
      amount >= method.min_amount &&
      amount <= method.max_amount
    );
  }

  /**
   * Validate promotion code
   */
  validatePromotionCode(
    code: string,
    packageInfo?: SPAPointsPackage
  ): {
    valid: boolean;
    discount_amount: number;
    discount_percentage?: number;
    message: string;
  } {
    // Mock promotion codes for demonstration
    const promotions = {
      'WELCOME10': { discount_percentage: 10, min_amount: 50000 },
      'PREMIUM20': { discount_percentage: 20, min_amount: 100000 },
      'NEWUSER': { discount_amount: 10000, min_amount: 0 },
    };

    const promotion = promotions[code as keyof typeof promotions];
    if (!promotion) {
      return {
        valid: false,
        discount_amount: 0,
        message: 'Invalid promotion code',
      };
    }

    if (packageInfo && packageInfo.price < promotion.min_amount) {
      return {
        valid: false,
        discount_amount: 0,
        message: `Minimum order amount required: ${promotion.min_amount.toLocaleString()} VND`,
      };
    }

    const discountAmount = 'discount_amount' in promotion
      ? promotion.discount_amount
      : Math.round(packageInfo!.price * promotion.discount_percentage / 100);

    const discountPercentage = 'discount_percentage' in promotion 
      ? promotion.discount_percentage 
      : undefined;

    return {
      valid: true,
      discount_amount: discountAmount,
      discount_percentage: discountPercentage,
      message: 'Promotion code applied successfully',
    };
  }

  /**
   * Check refund eligibility
   */
  checkRefundEligibility(
    transaction: PaymentTransaction,
    refundAmount: number,
    reason: string
  ): PaymentValidationResult {
    const errors: PaymentValidationError[] = [];
    const warnings: PaymentValidationWarning[] = [];

    // Check transaction status
    if (transaction.status !== 'completed') {
      errors.push({
        field: 'status',
        code: 'INVALID_STATUS',
        message: 'Only completed transactions can be refunded',
        details: { current_status: transaction.status },
      });
    }

    // Check refund amount
    if (refundAmount <= 0 || refundAmount > transaction.amount) {
      errors.push({
        field: 'amount',
        code: 'INVALID_REFUND_AMOUNT',
        message: 'Refund amount must be positive and not exceed transaction amount',
        details: {
          refund_amount: refundAmount,
          transaction_amount: transaction.amount,
        },
      });
    }

    // Check refund deadline (for tournaments)
    if (transaction.metadata?.payment_type === 'tournament_entry') {
      const tournamentStart = transaction.metadata?.tournament_start_date;
      if (tournamentStart && new Date(tournamentStart) <= new Date()) {
        errors.push({
          field: 'tournament_deadline',
          code: 'TOURNAMENT_STARTED',
          message: 'Cannot refund after tournament has started',
          details: { tournament_start: tournamentStart },
        });
      }
    }

    // Check time limits (general 7-day policy)
    const daysSincePayment = (Date.now() - transaction.paid_at!.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePayment > 7) {
      warnings.push({
        field: 'time_limit',
        code: 'REFUND_TIME_LIMIT',
        message: 'Refund requested after 7-day policy period',
        details: { days_since_payment: Math.round(daysSincePayment) },
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate refund amount based on policy
   */
  calculateRefundAmount(
    transaction: PaymentTransaction,
    requestedAmount: number,
    reason: string
  ): {
    eligible_amount: number;
    fee_deduction: number;
    final_refund: number;
    processing_fee: number;
    policy_applied: string;
  } {
    let eligibleAmount = requestedAmount;
    let feeDeduction = 0;
    let processingFee = 0;
    let policyApplied = 'full_refund';

    // Apply tournament-specific refund policy
    if (transaction.metadata?.payment_type === 'tournament_entry') {
      const tournamentStart = transaction.metadata?.tournament_start_date;
      if (tournamentStart) {
        const hoursUntilStart = (new Date(tournamentStart).getTime() - Date.now()) / (1000 * 60 * 60);
        
        if (hoursUntilStart < 24) {
          // Less than 24 hours: 50% refund
          eligibleAmount = requestedAmount * 0.5;
          policyApplied = 'partial_refund_24h';
        } else if (hoursUntilStart < 48) {
          // Less than 48 hours: 80% refund
          eligibleAmount = requestedAmount * 0.8;
          policyApplied = 'partial_refund_48h';
        }
      }
    }

    // Apply processing fee for payment gateway refunds
    if (transaction.payment_method === 'vnpay') {
      processingFee = Math.min(10000, eligibleAmount * 0.02); // 2% or max 10,000 VND
    }

    const finalRefund = Math.max(0, eligibleAmount - feeDeduction - processingFee);

    return {
      eligible_amount: eligibleAmount,
      fee_deduction: feeDeduction,
      final_refund: finalRefund,
      processing_fee: processingFee,
      policy_applied: policyApplied,
    };
  }

  /**
   * Generate payment analytics
   */
  generatePaymentAnalytics(
    transactions: PaymentTransaction[],
    startDate: Date,
    endDate: Date
  ): PaymentAnalytics {
    const filteredTransactions = transactions.filter(
      tx => tx.created_at >= startDate && tx.created_at <= endDate
    );

    const totalTransactions = filteredTransactions.length;
    const successfulTransactions = filteredTransactions.filter(tx => tx.status === 'completed').length;
    const failedTransactions = filteredTransactions.filter(tx => tx.status === 'failed').length;
    const totalAmount = filteredTransactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
    const averageAmount = successfulTransactions > 0 ? totalAmount / successfulTransactions : 0;

    // Payment methods breakdown
    const methodStats = new Map<string, PaymentMethodStats>();
    filteredTransactions.forEach(tx => {
      const method = tx.payment_method;
      if (!methodStats.has(method)) {
        methodStats.set(method, {
          payment_method: method,
          transaction_count: 0,
          total_amount: 0,
          success_rate: 0,
          average_amount: 0,
        });
      }

      const stats = methodStats.get(method)!;
      stats.transaction_count++;
      if (tx.status === 'completed') {
        stats.total_amount += tx.amount;
      }
    });

    // Calculate success rates and averages for each method
    methodStats.forEach(stats => {
      const methodTransactions = filteredTransactions.filter(tx => tx.payment_method === stats.payment_method);
      const methodSuccessful = methodTransactions.filter(tx => tx.status === 'completed').length;
      
      stats.success_rate = methodTransactions.length > 0 
        ? (methodSuccessful / methodTransactions.length) * 100 
        : 0;
      
      stats.average_amount = methodSuccessful > 0 
        ? stats.total_amount / methodSuccessful 
        : 0;
    });

    return {
      total_transactions: totalTransactions,
      total_amount: totalAmount,
      successful_transactions: successfulTransactions,
      failed_transactions: failedTransactions,
      success_rate: successRate,
      average_transaction_amount: averageAmount,
      payment_methods_breakdown: Array.from(methodStats.values()),
      time_period: {
        start_date: startDate,
        end_date: endDate,
      },
    };
  }

  /**
   * Get SPA Points packages
   */
  getSPAPointsPackages(): SPAPointsPackage[] {
    return [...this.spaPointsPackages];
  }

  /**
   * Get payment methods
   */
  getPaymentMethods(): PaymentMethod[] {
    return [...this.paymentMethods];
  }

  /**
   * Get payment method by ID
   */
  getPaymentMethodById(id: string): PaymentMethod | undefined {
    return this.paymentMethods.find(method => method.id === id);
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'VND'): string {
    const locale = currency === 'VND' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'VND' ? 0 : 2,
      maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
  }
}
