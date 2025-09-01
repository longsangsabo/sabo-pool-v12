// Payment Service for SABO Pool Arena
// COPILOT 3: PAYMENT & TRANSACTIONS
// VNPAY Integration & Wallet Management

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../models/payment_models.dart';

class PaymentService {
  static const String _baseUrl = 'https://api.sabopool.com'; // Replace with actual API URL
  static const String _vnpayEndpoint = '/api/payments';
  
  // VNPAY Configuration from backend
  static const String _vnpayCreateUrl = '$_vnpayEndpoint/create-vnpay';
  static const String _vnpayReturnUrl = '$_vnpayEndpoint/webhooks/vnpay-return';
  static const String _vnpayIPNUrl = '$_vnpayEndpoint/webhooks/vnpay-ipn';

  /// Create VNPAY payment request
  Future<VNPayPaymentResponse> createVNPayPayment({
    required String orderId,
    required double amount,
    required String orderInfo,
    String orderType = 'billpayment',
  }) async {
    try {
      final request = VNPayPaymentRequest(
        orderId: orderId,
        amount: amount,
        orderInfo: orderInfo,
        orderType: orderType,
        returnUrl: '$_baseUrl$_vnpayReturnUrl',
        ipnUrl: '$_baseUrl$_vnpayIPNUrl',
      );

      final response = await http.post(
        Uri.parse('$_baseUrl$_vnpayCreateUrl'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode(request.toJson()),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return VNPayPaymentResponse.fromJson(data);
      } else {
        final errorData = jsonDecode(response.body);
        return VNPayPaymentResponse(
          success: false,
          message: errorData['message'] ?? 'Payment creation failed',
          errorCode: response.statusCode.toString(),
        );
      }
    } catch (e) {
      debugPrint('Error creating VNPAY payment: $e');
      return VNPayPaymentResponse(
        success: false,
        message: 'Network error occurred',
        errorCode: 'NETWORK_ERROR',
      );
    }
  }

  /// Get payment status
  Future<PaymentResponse?> getPaymentStatus(String orderId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl$_vnpayEndpoint/status/$orderId'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return PaymentResponse.fromJson(data);
      }
      return null;
    } catch (e) {
      debugPrint('Error getting payment status: $e');
      return null;
    }
  }

  /// Create wallet top-up payment
  Future<VNPayPaymentResponse> createTopUpPayment({
    required String userId,
    required double amount,
    required String packageId,
  }) async {
    final orderId = 'TOPUP_${DateTime.now().millisecondsSinceEpoch}';
    final orderInfo = 'Nạp tiền vào ví SABO Pool - ${_formatCurrency(amount)}';

    return createVNPayPayment(
      orderId: orderId,
      amount: amount,
      orderInfo: orderInfo,
      orderType: 'topup',
    );
  }

  /// Create tournament entry payment
  Future<VNPayPaymentResponse> createTournamentPayment({
    required String userId,
    required String tournamentId,
    required double amount,
    required String tournamentName,
  }) async {
    final orderId = 'TOURNAMENT_${tournamentId}_${DateTime.now().millisecondsSinceEpoch}';
    final orderInfo = 'Tham gia Tournament: $tournamentName - ${_formatCurrency(amount)}';

    return createVNPayPayment(
      orderId: orderId,
      amount: amount,
      orderInfo: orderInfo,
      orderType: 'tournament',
    );
  }

  /// Create SPA points purchase payment
  Future<VNPayPaymentResponse> createSPAPayment({
    required String userId,
    required double amount,
    required int points,
  }) async {
    final orderId = 'SPA_${DateTime.now().millisecondsSinceEpoch}';
    final orderInfo = 'Mua $points SPA Points - ${_formatCurrency(amount)}';

    return createVNPayPayment(
      orderId: orderId,
      amount: amount,
      orderInfo: orderInfo,
      orderType: 'spa',
    );
  }

  /// Create membership payment
  Future<VNPayPaymentResponse> createMembershipPayment({
    required String userId,
    required String membershipType,
    required double amount,
  }) async {
    final orderId = 'MEMBERSHIP_${DateTime.now().millisecondsSinceEpoch}';
    final orderInfo = 'Thanh toán Membership $membershipType - ${_formatCurrency(amount)}';

    return createVNPayPayment(
      orderId: orderId,
      amount: amount,
      orderInfo: orderInfo,
      orderType: 'membership',
    );
  }

  /// Get user wallet
  Future<Wallet?> getUserWallet(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/wallet/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Wallet.fromJson(data);
      }
      return null;
    } catch (e) {
      debugPrint('Error getting user wallet: $e');
      return null;
    }
  }

  /// Get transaction history
  Future<List<Transaction>> getTransactionHistory({
    required String userId,
    int page = 1,
    int limit = 20,
    TransactionType? type,
    PaymentStatus? status,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (type != null) {
        queryParams['type'] = type.name;
      }

      if (status != null) {
        queryParams['status'] = status.name;
      }

      final uri = Uri.parse('$_baseUrl/api/transactions/$userId').replace(
        queryParameters: queryParams,
      );

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final transactions = (data['transactions'] as List)
            .map((item) => Transaction.fromJson(item))
            .toList();
        return transactions;
      }
      return [];
    } catch (e) {
      debugPrint('Error getting transaction history: $e');
      return [];
    }
  }

  /// Get top-up packages
  Future<List<TopUpPackage>> getTopUpPackages() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/topup/packages'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final packages = (data['packages'] as List)
            .map((item) => TopUpPackage.fromJson(item))
            .toList();
        return packages;
      }
      return _getDefaultTopUpPackages();
    } catch (e) {
      debugPrint('Error getting top-up packages: $e');
      return _getDefaultTopUpPackages();
    }
  }

  /// Process wallet payment
  Future<PaymentResponse> processWalletPayment({
    required String userId,
    required double amount,
    required TransactionType type,
    required String description,
    String? referenceId,
  }) async {
    try {
      final request = {
        'userId': userId,
        'amount': amount,
        'type': type.name,
        'description': description,
        'referenceId': referenceId,
        'method': PaymentMethod.wallet.name,
      };

      final response = await http.post(
        Uri.parse('$_baseUrl/api/wallet/payment'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode(request),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return PaymentResponse.fromJson(data);
      } else {
        final errorData = jsonDecode(response.body);
        return PaymentResponse(
          id: 'ERROR_${DateTime.now().millisecondsSinceEpoch}',
          paymentRequestId: 'ERROR',
          status: PaymentStatus.failed,
          errorCode: response.statusCode.toString(),
          errorMessage: errorData['message'] ?? 'Wallet payment failed',
          createdAt: DateTime.now(),
        );
      }
    } catch (e) {
      debugPrint('Error processing wallet payment: $e');
      return PaymentResponse(
        id: 'ERROR_${DateTime.now().millisecondsSinceEpoch}',
        paymentRequestId: 'ERROR',
        status: PaymentStatus.failed,
        errorCode: 'NETWORK_ERROR',
        errorMessage: 'Network error occurred',
        createdAt: DateTime.now(),
      );
    }
  }

  /// Get payment receipt
  Future<PaymentReceipt?> getPaymentReceipt(String transactionId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/receipts/$transactionId'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return PaymentReceipt.fromJson(data);
      }
      return null;
    } catch (e) {
      debugPrint('Error getting payment receipt: $e');
      return null;
    }
  }

  /// Request refund
  Future<bool> requestRefund({
    required String orderId,
    required double amount,
    required String reason,
  }) async {
    try {
      final request = {
        'orderId': orderId,
        'amount': amount,
        'reason': reason,
      };

      final response = await http.post(
        Uri.parse('$_baseUrl$_vnpayEndpoint/vnpay-refund'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode(request),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error requesting refund: $e');
      return false;
    }
  }

  /// Format currency for display
  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} đ';
  }

  /// Default top-up packages
  List<TopUpPackage> _getDefaultTopUpPackages() {
    return [
      TopUpPackage(
        id: 'package_50k',
        name: 'Gói cơ bản',
        amount: 50000,
        bonusAmount: 0,
        description: 'Gói nạp tiền cơ bản',
      ),
      TopUpPackage(
        id: 'package_100k',
        name: 'Gói phổ biến',
        amount: 100000,
        bonusAmount: 10000,
        isPopular: true,
        description: 'Gói nạp tiền phổ biến + 10k bonus',
      ),
      TopUpPackage(
        id: 'package_200k',
        name: 'Gói tiết kiệm',
        amount: 200000,
        bonusAmount: 30000,
        description: 'Gói nạp tiền tiết kiệm + 30k bonus',
      ),
      TopUpPackage(
        id: 'package_500k',
        name: 'Gói VIP',
        amount: 500000,
        bonusAmount: 100000,
        description: 'Gói nạp tiền VIP + 100k bonus',
      ),
      TopUpPackage(
        id: 'package_1m',
        name: 'Gói cao cấp',
        amount: 1000000,
        bonusAmount: 250000,
        description: 'Gói nạp tiền cao cấp + 250k bonus',
      ),
    ];
  }

  /// Generate order ID with timestamp
  String generateOrderId(String prefix) {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return '${prefix}_$timestamp';
  }

  /// Validate payment amount
  bool isValidAmount(double amount) {
    return amount > 0 && amount <= 100000000; // Max 100M VND
  }

  /// Get payment method icon
  String getPaymentMethodIcon(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.vnpay:
        return '💳';
      case PaymentMethod.wallet:
        return '💰';
      case PaymentMethod.bankTransfer:
        return '🏦';
      case PaymentMethod.cash:
        return '💵';
    }
  }

  /// Get transaction type icon
  String getTransactionTypeIcon(TransactionType type) {
    switch (type) {
      case TransactionType.topup:
        return '⬆️';
      case TransactionType.tournament:
        return '🏆';
      case TransactionType.spa:
        return '✨';
      case TransactionType.membership:
        return '👑';
      case TransactionType.withdrawal:
        return '⬇️';
      case TransactionType.refund:
        return '↩️';
    }
  }
}
