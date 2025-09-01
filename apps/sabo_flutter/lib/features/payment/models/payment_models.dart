// Payment Models for SABO Pool Arena
// COPILOT 3: PAYMENT & TRANSACTIONS
// Focus: Financial features & VNPAY integration

import 'package:json_annotation/json_annotation.dart';

part 'payment_models.g.dart';

/// Payment Status Enum
enum PaymentStatus {
  pending,
  processing,
  completed,
  failed,
  cancelled,
  refunded
}

/// Payment Method Enum
enum PaymentMethod {
  vnpay,
  wallet,
  bankTransfer,
  cash
}

/// Transaction Type Enum
enum TransactionType {
  topup,           // Nạp tiền vào ví
  tournament,      // Thanh toán tham gia tournament
  spa,            // Mua SPA points
  spaPoints,      // Mua SPA points (alias)
  membership,     // Thanh toán membership
  withdrawal,     // Rút tiền
  refund         // Hoàn tiền
}

/// Payment Request Model
@JsonSerializable()
class PaymentRequest {
  final String id;
  final String userId;
  final double amount;
  final String currency;
  final TransactionType type;
  final PaymentMethod method;
  final String description;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime? expiresAt;

  PaymentRequest({
    required this.id,
    required this.userId,
    required this.amount,
    this.currency = 'VND',
    required this.type,
    required this.method,
    required this.description,
    this.metadata,
    required this.createdAt,
    this.expiresAt,
  });

  factory PaymentRequest.fromJson(Map<String, dynamic> json) =>
      _$PaymentRequestFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentRequestToJson(this);
}

/// Payment Response Model
@JsonSerializable()
class PaymentResponse {
  final String id;
  final String paymentRequestId;
  final PaymentStatus status;
  final String? paymentUrl;
  final String? transactionId;
  final String? errorCode;
  final String? errorMessage;
  final DateTime createdAt;
  final DateTime? completedAt;

  PaymentResponse({
    required this.id,
    required this.paymentRequestId,
    required this.status,
    this.paymentUrl,
    this.transactionId,
    this.errorCode,
    this.errorMessage,
    required this.createdAt,
    this.completedAt,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) =>
      _$PaymentResponseFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentResponseToJson(this);
}

/// Transaction Model
@JsonSerializable()
class Transaction {
  final String id;
  final String userId;
  final TransactionType type;
  final double amount;
  final String currency;
  final PaymentStatus status;
  final PaymentMethod method;
  final String description;
  final String? referenceId;
  final String? transactionId;
  final DateTime createdAt;
  final DateTime? completedAt;
  final Map<String, dynamic>? metadata;

  Transaction({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    this.currency = 'VND',
    required this.status,
    required this.method,
    required this.description,
    this.referenceId,
    this.transactionId,
    required this.createdAt,
    this.completedAt,
    this.metadata,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) =>
      _$TransactionFromJson(json);

  Map<String, dynamic> toJson() => _$TransactionToJson(this);

  /// Get transaction type display name in Vietnamese
  String get typeDisplayName {
    switch (type) {
      case TransactionType.topup:
        return 'Nạp tiền';
      case TransactionType.tournament:
        return 'Tham gia Tournament';
      case TransactionType.spa:
        return 'Mua SPA Points';
      case TransactionType.membership:
        return 'Thanh toán Membership';
      case TransactionType.withdrawal:
        return 'Rút tiền';
      case TransactionType.refund:
        return 'Hoàn tiền';
    }
  }

  /// Get status display name in Vietnamese
  String get statusDisplayName {
    switch (status) {
      case PaymentStatus.pending:
        return 'Chờ xử lý';
      case PaymentStatus.processing:
        return 'Đang xử lý';
      case PaymentStatus.completed:
        return 'Thành công';
      case PaymentStatus.failed:
        return 'Thất bại';
      case PaymentStatus.cancelled:
        return 'Đã hủy';
      case PaymentStatus.refunded:
        return 'Đã hoàn tiền';
    }
  }

  /// Get payment method display name
  String get methodDisplayName {
    switch (method) {
      case PaymentMethod.vnpay:
        return 'VNPAY';
      case PaymentMethod.wallet:
        return 'Ví SABO';
      case PaymentMethod.bankTransfer:
        return 'Chuyển khoản';
      case PaymentMethod.cash:
        return 'Tiền mặt';
    }
  }

  /// Format amount for display
  String get formattedAmount {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} đ';
  }

  /// Check if transaction is successful
  bool get isSuccess => status == PaymentStatus.completed;

  /// Check if transaction is pending
  bool get isPending => status == PaymentStatus.pending || status == PaymentStatus.processing;

  /// Check if transaction is failed
  bool get isFailed => status == PaymentStatus.failed || status == PaymentStatus.cancelled;
}

/// Wallet Model
@JsonSerializable()
class Wallet {
  final String id;
  final String userId;
  final double balance;
  final String currency;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Wallet({
    required this.id,
    required this.userId,
    required this.balance,
    this.currency = 'VND',
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) =>
      _$WalletFromJson(json);

  Map<String, dynamic> toJson() => _$WalletToJson(this);

  /// Format balance for display
  String get formattedBalance {
    return '${balance.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} đ';
  }

  /// Check if wallet has sufficient balance
  bool hasSufficientBalance(double amount) {
    return isActive && balance >= amount;
  }
}

/// VNPAY Payment Request
@JsonSerializable()
class VNPayPaymentRequest {
  final String orderId;
  final double amount;
  final String orderInfo;
  final String orderType;
  final String returnUrl;
  final String? ipnUrl;

  VNPayPaymentRequest({
    required this.orderId,
    required this.amount,
    required this.orderInfo,
    this.orderType = 'billpayment',
    required this.returnUrl,
    this.ipnUrl,
  });

  factory VNPayPaymentRequest.fromJson(Map<String, dynamic> json) =>
      _$VNPayPaymentRequestFromJson(json);

  Map<String, dynamic> toJson() => _$VNPayPaymentRequestToJson(this);
}

/// VNPAY Payment Response
@JsonSerializable()
class VNPayPaymentResponse {
  final bool success;
  final String? paymentUrl;
  final String? orderId;
  final double? amount;
  final String message;
  final String? errorCode;

  VNPayPaymentResponse({
    required this.success,
    this.paymentUrl,
    this.orderId,
    this.amount,
    required this.message,
    this.errorCode,
  });

  factory VNPayPaymentResponse.fromJson(Map<String, dynamic> json) =>
      _$VNPayPaymentResponseFromJson(json);

  Map<String, dynamic> toJson() => _$VNPayPaymentResponseToJson(this);
}

/// Payment Receipt Model
@JsonSerializable()
class PaymentReceipt {
  final String id;
  final String transactionId;
  final String orderId;
  final double amount;
  final String currency;
  final PaymentMethod method;
  final TransactionType type;
  final PaymentStatus status;
  final DateTime createdAt;
  final Map<String, dynamic>? details;

  PaymentReceipt({
    required this.id,
    required this.transactionId,
    required this.orderId,
    required this.amount,
    this.currency = 'VND',
    required this.method,
    required this.type,
    required this.status,
    required this.createdAt,
    this.details,
  });

  factory PaymentReceipt.fromJson(Map<String, dynamic> json) =>
      _$PaymentReceiptFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentReceiptToJson(this);

  /// Format amount for display
  String get formattedAmount {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} đ';
  }
}

/// Top-up Package Model
@JsonSerializable()
class TopUpPackage {
  final String id;
  final String name;
  final double amount;
  final double bonusAmount;
  final String currency;
  final bool isPopular;
  final bool isActive;
  final String? description;
  final String? icon;

  TopUpPackage({
    required this.id,
    required this.name,
    required this.amount,
    this.bonusAmount = 0,
    this.currency = 'VND',
    this.isPopular = false,
    this.isActive = true,
    this.description,
    this.icon,
  });

  factory TopUpPackage.fromJson(Map<String, dynamic> json) =>
      _$TopUpPackageFromJson(json);

  Map<String, dynamic> toJson() => _$TopUpPackageToJson(this);

  /// Get total amount including bonus
  double get totalAmount => amount + bonusAmount;

  /// Format amount for display
  String get formattedAmount {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} đ';
  }

  /// Format total amount for display
  String get formattedTotalAmount {
    return '${totalAmount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} đ';
  }

  /// Format bonus amount for display
  String get formattedBonusAmount {
    if (bonusAmount <= 0) return '';
    return '+${bonusAmount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} đ';
  }
}

/// Payment Transaction Model
@JsonSerializable()
class PaymentTransaction {
  final String id;
  final String userId;
  final String? orderId;
  final double amount;
  final String currency;
  final TransactionType type;
  final PaymentMethod method;
  final PaymentStatus status;
  final String description;
  final DateTime createdAt;
  final DateTime? completedAt;
  final Map<String, dynamic>? metadata;

  PaymentTransaction({
    required this.id,
    required this.userId,
    this.orderId,
    required this.amount,
    this.currency = 'VND',
    required this.type,
    required this.method,
    required this.status,
    required this.description,
    required this.createdAt,
    this.completedAt,
    this.metadata,
  });

  factory PaymentTransaction.fromJson(Map<String, dynamic> json) =>
      _$PaymentTransactionFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentTransactionToJson(this);

  /// Format amount for display
  String get formattedAmount {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} đ';
  }
}

/// Wallet Info Model  
@JsonSerializable()
class WalletInfo {
  final String id;
  final String userId;
  final double balance;
  final double availableBalance;
  final double lockedBalance;
  final String currency;
  final DateTime lastUpdated;
  final bool isActive;

  WalletInfo({
    required this.id,
    required this.userId,
    required this.balance,
    required this.availableBalance,
    this.lockedBalance = 0,
    this.currency = 'VND',
    required this.lastUpdated,
    this.isActive = true,
  });

  factory WalletInfo.fromJson(Map<String, dynamic> json) =>
      _$WalletInfoFromJson(json);

  Map<String, dynamic> toJson() => _$WalletInfoToJson(this);

  /// Format balance for display
  String get formattedBalance {
    return '${balance.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )} đ';
  }
}

/// Payment Method Info Model
@JsonSerializable()
class PaymentMethodInfoLocal {
  final String id;
  final PaymentMethod method;
  final String name;
  final String description;
  final String icon;
  final bool isEnabled;
  final double? minAmount;
  final double? maxAmount;
  final Map<String, dynamic>? settings;

  const PaymentMethodInfoLocal({
    required this.id,
    required this.method,
    required this.name,
    required this.description,
    required this.icon,
    this.isEnabled = true,
    this.minAmount,
    this.maxAmount,
    this.settings,
  });

  factory PaymentMethodInfoLocal.fromJson(Map<String, dynamic> json) =>
      _$PaymentMethodInfoLocalFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentMethodInfoLocalToJson(this);
}
