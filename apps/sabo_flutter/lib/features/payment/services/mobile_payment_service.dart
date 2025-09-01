// SABO Pool - Mobile Payment Service
// Leverages shared business logic for consistent payment processing

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../models/payment_models.dart';
import '../models/payment_integration_models.dart';
import 'payment_adapter.dart';

class MobilePaymentService {
  static const String _apiBase = '/api/payment';
  
  // Payment Methods - Uses shared logic
  static Future<List<PaymentMethodInfo>> getPaymentMethods() async {
    try {
      final response = await http.get(Uri.parse('$_apiBase/methods'));
      
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data
            .map((json) => PaymentAdapter.fromSharedPaymentMethod(json))
            .toList();
      }
      throw Exception('Failed to load payment methods');
    } catch (e) {
      debugPrint('Error loading payment methods: $e');
      return _getDefaultPaymentMethods();
    }
  }

  // VNPAY Integration - Uses shared VNPAYService.ts
  static Future<VNPayResponse> createVNPayPayment({
    required String userId,
    required double amount,
    required String description,
    required VNPayPaymentType paymentType,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      return await PaymentIntegrationService.initiateVNPayPayment(
        userId: userId,
        amount: amount,
        description: description,
        paymentType: paymentType.name,
        metadata: metadata,
      );
    } catch (e) {
      debugPrint('VNPAY payment creation failed: $e');
      rethrow;
    }
  }

  // Transaction Management - Uses shared PaymentBusinessLogic.ts
  static Future<PaymentTransaction> createTransaction({
    required String userId,
    required double amount,
    required TransactionType type,
    required String description,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final request = {
        'user_id': userId,
        'amount': amount,
        'type': type.name,
        'description': description,
        'currency': 'VND',
        'metadata': metadata ?? {},
      };

      final response = await http.post(
        Uri.parse('$_apiBase/transactions'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(request),
      );

      if (response.statusCode == 201) {
        return PaymentAdapter.fromSharedTransaction(jsonDecode(response.body));
      }
      throw Exception('Failed to create transaction');
    } catch (e) {
      debugPrint('Transaction creation failed: $e');
      rethrow;
    }
  }

  // Wallet Operations - Uses shared wallet logic
  static Future<WalletInfo> getWalletInfo(String userId) async {
    try {
      final response = await http.get(Uri.parse('$_apiBase/wallet/$userId'));
      
      if (response.statusCode == 200) {
        return WalletInfo.fromJson(jsonDecode(response.body));
      }
      throw Exception('Failed to load wallet info');
    } catch (e) {
      debugPrint('Wallet info loading failed: $e');
      rethrow;
    }
  }

  static Future<PaymentTransaction> topUpWallet({
    required String userId,
    required double amount,
    required PaymentMethod method,
  }) async {
    return createTransaction(
      userId: userId,
      amount: amount,
      type: TransactionType.topup,
      description: 'Nạp tiền vào ví',
      metadata: {'payment_method': method.name},
    );
  }

  // Tournament Payments
  static Future<PaymentTransaction> payTournamentEntry({
    required String userId,
    required String tournamentId,
    required double entryFee,
    required PaymentMethod method,
  }) async {
    return createTransaction(
      userId: userId,
      amount: entryFee,
      type: TransactionType.tournament,
      description: 'Phí tham gia Tournament',
      metadata: {
        'tournament_id': tournamentId,
        'payment_method': method.name,
      },
    );
  }

  // SPA Points Purchase
  static Future<PaymentTransaction> purchaseSPAPoints({
    required String userId,
    required int pointsAmount,
    required double price,
    required PaymentMethod method,
  }) async {
    return createTransaction(
      userId: userId,
      amount: price,
      type: TransactionType.spaPoints,
      description: 'Mua $pointsAmount SPA Points',
      metadata: {
        'spa_points': pointsAmount,
        'payment_method': method.name,
      },
    );
  }

  // Payment Verification - Uses shared verification logic
  static Future<PaymentTransaction> verifyPayment(String transactionId) async {
    return PaymentIntegrationService.verifyPayment(transactionId);
  }

  // Transaction History
  static Future<List<PaymentTransaction>> getTransactionHistory(
    String userId, {
    int? limit,
    TransactionType? type,
  }) async {
    try {
      var url = '$_apiBase/transactions/$userId';
      final queryParams = <String, String>{};
      
      if (limit != null) queryParams['limit'] = limit.toString();
      if (type != null) queryParams['type'] = type.name;
      
      if (queryParams.isNotEmpty) {
        url += '?' + queryParams.entries.map((e) => '${e.key}=${e.value}').join('&');
      }

      return PaymentIntegrationService.getTransactionHistory(userId);
    } catch (e) {
      debugPrint('Transaction history loading failed: $e');
      return [];
    }
  }

  // Payment Security - Uses shared security logic
  static Future<bool> validatePaymentSecurity(String transactionId) async {
    try {
      final response = await http.get(Uri.parse('$_apiBase/security/validate/$transactionId'));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Payment security validation failed: $e');
      return false;
    }
  }

  // Fallback payment methods when API is unavailable
  static List<PaymentMethodInfo> _getDefaultPaymentMethods() {
    return [
      const PaymentMethodInfo(
        id: 'vnpay',
        name: 'VNPAY',
        description: 'Thanh toán qua VNPAY',
        type: PaymentMethod.vnpay,
        iconUrl: 'assets/icons/vnpay.png',
        isEnabled: true,
        mobileSupported: true,
        minAmount: 10000,
        maxAmount: 500000000,
        processingFee: 0.02,
      ),
      const PaymentMethodInfo(
        id: 'wallet',
        name: 'Ví SABO',
        description: 'Thanh toán bằng ví SABO',
        type: PaymentMethod.wallet,
        iconUrl: 'assets/icons/wallet.png',
        isEnabled: true,
        mobileSupported: true,
        minAmount: 1000,
        maxAmount: 50000000,
        processingFee: 0.0,
      ),
    ];
  }
}

// HTTP Service helper
class HttpService {
  static Future<HttpResponse> get(String url) async {
    final response = await http.get(Uri.parse(url));
    return HttpResponse(response.statusCode, jsonDecode(response.body));
  }

  static Future<HttpResponse> post(String url, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return HttpResponse(response.statusCode, jsonDecode(response.body));
  }
}

class HttpResponse {
  final int statusCode;
  final dynamic data;

  HttpResponse(this.statusCode, this.data);
}
