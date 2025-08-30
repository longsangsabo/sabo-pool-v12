// Consolidated Payment Module Exports
import { VNPAYService } from './VNPAYService';
import { PaymentBusinessLogic } from './PaymentBusinessLogic';

export { VNPAYService } from './VNPAYService';
export { PaymentBusinessLogic } from './PaymentBusinessLogic';

// Re-export all types
export * from './payment-types';

// Payment Module Configuration
export const PaymentConfig = {
  VNPAY_TIMEOUT_MINUTES: 15,
  MIN_DEPOSIT_AMOUNT: 10000, // 10,000 VND
  MAX_DEPOSIT_AMOUNT: 10000000, // 10,000,000 VND
  TRANSACTION_FEE_PERCENTAGE: 0.02, // 2%
  CURRENCY_CODE: 'VND',
  SUPPORTED_BANKS: [
    'VIETCOMBANK',
    'TECHCOMBANK', 
    'BIDV',
    'VIETINBANK',
    'AGRIBANK',
    'MBBANK',
    'VPBANK',
    'SACOMBANK',
    'ACB',
    'OCB'
  ],
};

// Payment Service Factory  
export class PaymentServiceFactory {
  private static vnpayService: VNPAYService;
  private static paymentBusinessLogic: PaymentBusinessLogic;

  static getVNPAYService(): VNPAYService {
    if (!this.vnpayService) {
      this.vnpayService = new VNPAYService();
    }
    return this.vnpayService;
  }

  static getPaymentBusinessLogic(): PaymentBusinessLogic {
    if (!this.paymentBusinessLogic) {
      this.paymentBusinessLogic = new PaymentBusinessLogic();
    }
    return this.paymentBusinessLogic;
  }

  static getAllServices() {
    return {
      vnpay: this.getVNPAYService(),
      businessLogic: this.getPaymentBusinessLogic(),
    };
  }
}
