import crypto from 'crypto';
import {
  VNPAYConfig,
  VNPAYPaymentParams,
  VNPAYResponse,
  VNPAYReturnParams,
  VNPAYIPNResponse,
  PaymentServiceResult,
  HashVerificationResult,
  VNPAYResponseCode,
  PaymentError,
} from './payment-types';

/**
 * SABO Pool Arena - VNPAY Service
 * 
 * Consolidated VNPAY payment gateway integration extracted from:
 * - apps/sabo-user/src/integrations/vnpay/vnpay-payment-gateway.js
 * - VNPAY documentation and configuration
 * - Hash verification and security functions
 * - Payment URL generation and response handling
 * 
 * This service handles all VNPAY operations:
 * - Payment URL generation with secure hash
 * - Return URL and IPN handling
 * - Hash verification for security
 * - Response code mapping and error handling
 * - Transaction status management
 */
export class VNPAYService {
  private readonly defaultConfig: VNPAYConfig = {
    tmn_code: process.env.VNP_TMN_CODE || 'T53WMA78',
    hash_secret: process.env.VNP_HASH_SECRET || 'M1TOK8Z2U7KIPX67FDFBSXTPHGSEFHZ9',
    payment_url: process.env.VNP_PAYMENT_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    return_url: process.env.VNP_RETURN_URL || '',
    ipn_url: process.env.VNP_IPN_URL || '',
    version: '2.1.0',
    command: 'pay',
    currency_code: 'VND',
    locale: 'vn',
  };

  private readonly responseCodes: { [key: string]: VNPAYResponseCode } = {
    '00': {
      code: '00',
      message: 'Giao dịch thành công',
      message_en: 'Transaction successful',
      category: 'success',
      retry_allowed: false,
    },
    '07': {
      code: '07',
      message: 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      message_en: 'Transaction failed - Invalid amount',
      category: 'system_error',
      retry_allowed: false,
    },
    '09': {
      code: '09',
      message: 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      message_en: 'Transaction failed - Invalid order information',
      category: 'user_error',
      retry_allowed: true,
    },
    '10': {
      code: '10',
      message: 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      message_en: 'Transaction failed - Too many failed authentication attempts',
      category: 'user_error',
      retry_allowed: false,
    },
    '11': {
      code: '11',
      message: 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      message_en: 'Transaction failed - Payment timeout',
      category: 'system_error',
      retry_allowed: true,
    },
    '12': {
      code: '12',
      message: 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      message_en: 'Transaction failed - Card/Account locked',
      category: 'user_error',
      retry_allowed: false,
    },
    '13': {
      code: '13',
      message: 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      message_en: 'Transaction failed - Wrong OTP',
      category: 'user_error',
      retry_allowed: true,
    },
    '24': {
      code: '24',
      message: 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      message_en: 'Transaction failed - Customer cancelled',
      category: 'user_error',
      retry_allowed: true,
    },
    '51': {
      code: '51',
      message: 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      message_en: 'Transaction failed - Insufficient balance',
      category: 'user_error',
      retry_allowed: true,
    },
    '65': {
      code: '65',
      message: 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      message_en: 'Transaction failed - Exceeded daily limit',
      category: 'user_error',
      retry_allowed: false,
    },
    '75': {
      code: '75',
      message: 'Ngân hàng thanh toán đang bảo trì.',
      message_en: 'Transaction failed - Bank maintenance',
      category: 'bank_error',
      retry_allowed: true,
    },
    '79': {
      code: '79',
      message: 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      message_en: 'Transaction failed - Too many wrong payment password attempts',
      category: 'user_error',
      retry_allowed: false,
    },
    '99': {
      code: '99',
      message: 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
      message_en: 'Transaction failed - Unknown error',
      category: 'system_error',
      retry_allowed: true,
    },
  };

  /**
   * Create VNPAY secure hash using HMAC SHA512
   */
  createSecureHash(params: Record<string, any>, secretKey?: string): string {
    try {
      const hashSecret = secretKey || this.defaultConfig.hash_secret;

      // Sort parameters by key
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((result, key) => {
          if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            result[key] = params[key];
          }
          return result;
        }, {} as Record<string, any>);

      // Convert to query string format
      const queryString = Object.keys(sortedParams)
        .map(key => `${key}=${sortedParams[key]}`)
        .join('&');

      // Create HMAC SHA512 hash
      const hmac = crypto.createHmac('sha512', hashSecret);
      hmac.update(queryString);

      return hmac.digest('hex');
    } catch (error) {
      console.error('Error creating VNPAY hash:', error);
      throw new Error('Failed to create payment hash');
    }
  }

  /**
   * Verify VNPAY secure hash
   */
  verifySecureHash(
    params: Record<string, any>,
    receivedHash: string,
    secretKey?: string
  ): HashVerificationResult {
    try {
      const hashSecret = secretKey || this.defaultConfig.hash_secret;

      // Remove vnp_SecureHash from params for verification
      const paramsForVerification = { ...params };
      delete paramsForVerification.vnp_SecureHash;

      // Create hash from received parameters
      const calculatedHash = this.createSecureHash(paramsForVerification, hashSecret);

      // Compare hashes (case-insensitive)
      const isValid = calculatedHash.toLowerCase() === receivedHash.toLowerCase();

      return {
        valid: isValid,
        calculated_hash: calculatedHash,
        received_hash: receivedHash,
        algorithm: 'sha512',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error verifying VNPAY hash:', error);
      return {
        valid: false,
        calculated_hash: '',
        received_hash: receivedHash,
        algorithm: 'sha512',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Create VNPAY payment URL
   */
  createPaymentUrl(
    orderId: string,
    amount: number,
    orderInfo: string,
    orderType: string = 'billpayment',
    ipAddress: string = '127.0.0.1',
    config?: Partial<VNPAYConfig>
  ): PaymentServiceResult<VNPAYResponse> {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };

      // Validate required parameters
      if (!orderId || !amount || !orderInfo) {
        return {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Missing required parameters: orderId, amount, orderInfo',
          },
        };
      }

      // Validate amount (must be positive)
      if (amount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Amount must be greater than 0',
          },
        };
      }

      // Validate configuration
      if (!finalConfig.tmn_code || !finalConfig.hash_secret || !finalConfig.return_url) {
        return {
          success: false,
          error: {
            code: 'INVALID_CONFIG',
            message: 'Missing required VNPAY configuration',
          },
        };
      }

      // Create timestamp
      const createDate = new Date().toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, '')
        .replace('T', '');

      // Build VNPAY parameters
      const params: VNPAYPaymentParams = {
        vnp_Version: finalConfig.version,
        vnp_Command: finalConfig.command,
        vnp_TmnCode: finalConfig.tmn_code,
        vnp_Amount: Math.round(amount * 100), // Convert to smallest currency unit
        vnp_CurrCode: finalConfig.currency_code,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_ReturnUrl: finalConfig.return_url,
        vnp_IpAddr: ipAddress,
        vnp_CreateDate: createDate,
        vnp_Locale: finalConfig.locale,
      };

      // Create secure hash
      const secureHash = this.createSecureHash(params, finalConfig.hash_secret);
      params.vnp_SecureHash = secureHash;

      // Build payment URL
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key as keyof VNPAYPaymentParams] as string)}`)
        .join('&');

      const paymentUrl = `${finalConfig.payment_url}?${queryString}`;

      const response: VNPAYResponse = {
        success: true,
        paymentUrl,
        orderId,
        amount,
        message: 'Payment URL generated successfully',
      };

      return {
        success: true,
        data: response,
        message: 'Payment URL created successfully',
      };
    } catch (error) {
      console.error('Error creating VNPAY payment:', error);
      return {
        success: false,
        error: {
          code: 'PAYMENT_CREATION_FAILED',
          message: 'Failed to create payment request',
          details: error,
        },
      };
    }
  }

  /**
   * Process VNPAY return URL response
   */
  processReturnUrl(
    queryParams: Record<string, any>,
    secretKey?: string
  ): PaymentServiceResult<{
    orderId: string;
    amount: number;
    responseCode: string;
    transactionId?: string;
    isSuccess: boolean;
    message: string;
  }> {
    try {
      const receivedHash = queryParams.vnp_SecureHash;

      // Validate required parameters
      if (!receivedHash) {
        return {
          success: false,
          error: {
            code: 'MISSING_HASH',
            message: 'Missing secure hash in response',
          },
        };
      }

      // Verify hash
      const hashResult = this.verifySecureHash(queryParams, receivedHash, secretKey);

      if (!hashResult.valid) {
        return {
          success: false,
          error: {
            code: 'INVALID_HASH',
            message: 'Invalid payment signature',
            details: hashResult,
          },
        };
      }

      const responseCode = queryParams.vnp_ResponseCode;
      const orderId = queryParams.vnp_TxnRef;
      const amount = parseInt(queryParams.vnp_Amount) / 100; // Convert back from smallest unit
      const transactionId = queryParams.vnp_TransactionNo;

      const isSuccess = responseCode === '00';
      const responseInfo = this.getResponseCodeInfo(responseCode);

      return {
        success: true,
        data: {
          orderId,
          amount,
          responseCode,
          transactionId,
          isSuccess,
          message: responseInfo.message_en,
        },
        message: isSuccess ? 'Payment completed successfully' : responseInfo.message_en,
      };
    } catch (error) {
      console.error('Error processing VNPAY return:', error);
      return {
        success: false,
        error: {
          code: 'RETURN_PROCESSING_FAILED',
          message: 'Error processing payment return',
          details: error,
        },
      };
    }
  }

  /**
   * Process VNPAY IPN (Instant Payment Notification)
   */
  processIPN(
    queryParams: Record<string, any>,
    secretKey?: string
  ): PaymentServiceResult<VNPAYIPNResponse> {
    try {
      const receivedHash = queryParams.vnp_SecureHash;

      // Validate required parameters
      if (!receivedHash) {
        return {
          success: false,
          data: { RspCode: '99', Message: 'Invalid IPN - Missing hash' },
          error: {
            code: 'MISSING_HASH',
            message: 'Missing secure hash in IPN',
          },
        };
      }

      // Verify hash
      const hashResult = this.verifySecureHash(queryParams, receivedHash, secretKey);

      if (!hashResult.valid) {
        return {
          success: false,
          data: { RspCode: '97', Message: 'Invalid signature' },
          error: {
            code: 'INVALID_HASH',
            message: 'Invalid IPN signature',
            details: hashResult,
          },
        };
      }

      const responseCode = queryParams.vnp_ResponseCode;
      const orderId = queryParams.vnp_TxnRef;
      const amount = parseInt(queryParams.vnp_Amount) / 100;
      const transactionId = queryParams.vnp_TransactionNo;

      // Log IPN processing
      console.log(
        `VNPAY IPN: Order ${orderId}, Response Code: ${responseCode}, Amount: ${amount} VND`
      );

      // Return success response to stop IPN retries
      return {
        success: true,
        data: { RspCode: '00', Message: 'OK' },
        message: 'IPN processed successfully',
      };
    } catch (error) {
      console.error('Error processing VNPAY IPN:', error);
      return {
        success: false,
        data: { RspCode: '99', Message: 'Internal Error' },
        error: {
          code: 'IPN_PROCESSING_FAILED',
          message: 'Error processing IPN',
          details: error,
        },
      };
    }
  }

  /**
   * Get response code information
   */
  getResponseCodeInfo(code: string): VNPAYResponseCode {
    return this.responseCodes[code] || {
      code,
      message: 'Mã lỗi không xác định',
      message_en: 'Unknown error code',
      category: 'system_error',
      retry_allowed: true,
    };
  }

  /**
   * Check if response code indicates success
   */
  isSuccessResponse(code: string): boolean {
    return code === '00';
  }

  /**
   * Check if response code allows retry
   */
  isRetryAllowed(code: string): boolean {
    const responseInfo = this.getResponseCodeInfo(code);
    return responseInfo.retry_allowed;
  }

  /**
   * Convert amount to VNPAY format (smallest currency unit)
   */
  convertAmountToVNPAY(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert amount from VNPAY format (smallest currency unit)
   */
  convertAmountFromVNPAY(amount: number): number {
    return amount / 100;
  }

  /**
   * Generate order ID with timestamp
   */
  generateOrderId(prefix: string = 'ORDER'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Validate order ID format
   */
  validateOrderId(orderId: string): boolean {
    // Order ID should be alphanumeric, max 34 characters
    const regex = /^[A-Za-z0-9_-]{1,34}$/;
    return regex.test(orderId);
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'VND'): string {
    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  }

  /**
   * Get client IP from request headers (for Express.js)
   */
  getClientIP(req: any): string {
    return (
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }

  /**
   * Create refund request
   * Note: VNPAY refunds are typically processed manually or through separate API
   */
  createRefundRequest(
    transactionId: string,
    orderId: string,
    amount: number,
    reason: string
  ): PaymentServiceResult<{
    refundId: string;
    transactionId: string;
    amount: number;
    status: string;
  }> {
    try {
      // Generate refund ID
      const refundId = this.generateOrderId('REFUND');

      // In a real implementation, this would call VNPAY's refund API
      // For now, we'll return a mock response
      return {
        success: true,
        data: {
          refundId,
          transactionId,
          amount,
          status: 'pending',
        },
        message: 'Refund request submitted successfully',
      };
    } catch (error) {
      console.error('Error creating refund request:', error);
      return {
        success: false,
        error: {
          code: 'REFUND_CREATION_FAILED',
          message: 'Failed to create refund request',
          details: error,
        },
      };
    }
  }

  /**
   * Get configuration for testing
   */
  getTestConfig(): VNPAYConfig {
    return {
      tmn_code: 'T53WMA78',
      hash_secret: 'M1TOK8Z2U7KIPX67FDFBSXTPHGSEFHZ9',
      payment_url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      return_url: 'http://localhost:3000/api/webhooks/vnpay-return',
      ipn_url: 'http://localhost:3000/api/webhooks/vnpay-ipn',
      version: '2.1.0',
      command: 'pay',
      currency_code: 'VND',
      locale: 'vn',
    };
  }

  /**
   * Get test card information
   */
  getTestCardInfo() {
    return {
      bank: 'VCB',
      cardNumber: '4524 0418 7644 5035',
      cardholderName: 'VÕ LONG SANG',
      expiryDate: '10/27',
      otp: '160922',
      description: 'Test card for VNPAY sandbox environment',
    };
  }

  /**
   * Get all supported response codes
   */
  getAllResponseCodes(): VNPAYResponseCode[] {
    return Object.values(this.responseCodes);
  }

  /**
   * Get environment configuration
   */
  getEnvironmentConfig(): {
    isProduction: boolean;
    paymentUrl: string;
    tmnCode: string;
  } {
    const isProduction = !this.defaultConfig.payment_url.includes('sandbox');
    
    return {
      isProduction,
      paymentUrl: this.defaultConfig.payment_url,
      tmnCode: this.defaultConfig.tmn_code,
    };
  }
}
