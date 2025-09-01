// SABO Pool - Payment Feature Index
// COPILOT 3: PAYMENT & TRANSACTIONS
// Export all payment-related components

// Models
export 'models/payment_models.dart';
export 'models/payment_integration_models.dart';

// Services
export 'services/mobile_payment_service.dart';
export 'services/payment_adapter.dart';

// Screens
export 'screens/wallet_screen.dart';

// Widgets
export 'widgets/vnpay_webview.dart';

// Constants
class PaymentConstants {
  static const String vnpayReturnUrl = '/payment/vnpay/return';
  static const String vnpayCancelUrl = '/payment/vnpay/cancel';
  static const String currency = 'VND';
  
  // Minimum amounts
  static const double minTopUpAmount = 10000;
  static const double maxTopUpAmount = 50000000;
  static const double minTournamentEntry = 5000;
  
  // SPA Points rates
  static const Map<int, double> spaPointsPackages = {
    1000: 50000,
    2500: 100000,
    5000: 200000,
    10000: 350000,
  };
}

// Payment Feature Configuration
class PaymentConfig {
  static const bool enableVNPay = true;
  static const bool enableWallet = true;
  static const bool enableBankTransfer = false;
  static const bool enableCash = false;
  
  static const int transactionTimeoutMinutes = 15;
  static const int maxRetryAttempts = 3;
}
