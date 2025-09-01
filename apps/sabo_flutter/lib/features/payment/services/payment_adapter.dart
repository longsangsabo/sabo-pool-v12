// SABO Pool - Payment Adapter for Shared Logic
// Bridge between Flutter app and shared business logic

import 'dart:convert';
import '../models/payment_models.dart';
import '../models/payment_integration_models.dart';
import 'http_service.dart';

/// This adapter maps shared TypeScript payment logic to Flutter/Dart
/// Maps to: packages/shared-business/src/payment/

class PaymentAdapter {
  /// Maps shared PaymentTransaction interface to Dart
  static PaymentTransaction fromSharedTransaction(Map<String, dynamic> json) {
    return PaymentTransaction.fromJson(json);
  }

  /// Maps shared PaymentMethod interface to Dart
  static PaymentMethodInfo fromSharedPaymentMethod(Map<String, dynamic> json) {
    return PaymentMethodInfo.fromJson(json);
  }

  /// Maps shared VNPAYResponse interface to Dart  
  static VNPayResponse fromSharedVNPayResponse(Map<String, dynamic> json) {
    return VNPayResponse.fromJson(json);
  }

  /// Convert Dart models to shared logic format
  static Map<String, dynamic> toSharedTransaction(PaymentTransaction transaction) {
    return transaction.toJson();
  }

  /// Convert payment request to shared logic format
  static Map<String, dynamic> toSharedPaymentRequest({
    required String userId,
    required double amount,
    required String paymentType,
    required String description,
    Map<String, dynamic>? metadata,
  }) {
    return {
      'user_id': userId,
      'amount': amount,
      'payment_type': paymentType,
      'description': description,
      'currency': 'VND',
      'metadata': metadata ?? {},
    };
  }
}

/// Payment Integration Service
/// Uses shared business logic via HTTP API calls
class PaymentIntegrationService {
  static const String baseUrl = '/api/payment'; // Will use existing backend API

  /// Initialize payment using shared logic
  static Future<VNPayResponse> initiateVNPayPayment({
    required String userId,
    required double amount,
    required String description,
    required String paymentType,
    Map<String, dynamic>? metadata,
  }) async {
    final request = PaymentAdapter.toSharedPaymentRequest(
      userId: userId,
      amount: amount,
      paymentType: paymentType,
      description: description,
      metadata: metadata,
    );

    // Call shared payment logic via API
    // This will use the existing PaymentService.ts logic
    final response = await HttpService.post('$baseUrl/vnpay/create', request);
    
    return PaymentAdapter.fromSharedVNPayResponse(response.data);
  }

  /// Verify payment using shared logic
  static Future<PaymentTransaction> verifyPayment(String transactionId) async {
    final response = await HttpService.get('$baseUrl/verify/$transactionId');
    return PaymentAdapter.fromSharedTransaction(response.data);
  }

  /// Get transaction history using shared logic
  static Future<List<PaymentTransaction>> getTransactionHistory(String userId) async {
    final response = await HttpService.get('$baseUrl/transactions/$userId');
    return (response.data as List)
        .map((json) => PaymentAdapter.fromSharedTransaction(json))
        .toList();
  }
}
