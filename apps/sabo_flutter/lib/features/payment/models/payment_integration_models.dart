// Additional Payment Models for Shared Logic Integration
// Maps to packages/shared-business/src/payment/payment-types.ts

import 'package:json_annotation/json_annotation.dart';
import 'payment_models.dart' show PaymentStatus, PaymentMethod;

part 'payment_integration_models.g.dart';

/// VNPAY Payment Type - Maps to shared enum
enum VNPayPaymentType {
  tournament,
  wallet,
  spaPoints,
  membership,
  other
}

/// VNPAY Response - Maps to shared VNPAYResponse interface
@JsonSerializable()
class VNPayResponse {
  final bool success;
  final String? paymentUrl;
  final String orderId;
  final double amount;
  final String message;
  final String? errorCode;

  VNPayResponse({
    required this.success,
    this.paymentUrl,
    required this.orderId,
    required this.amount,
    required this.message,
    this.errorCode,
  });

  factory VNPayResponse.fromJson(Map<String, dynamic> json) =>
      _$VNPayResponseFromJson(json);

  Map<String, dynamic> toJson() => _$VNPayResponseToJson(this);
}

/// Payment Method Info - Maps to shared PaymentMethod interface
@JsonSerializable()
class PaymentMethodInfo {
  final String id;
  final String name;
  final String description;
  final PaymentMethod type;
  final String? iconUrl;
  final bool isEnabled;
  final bool mobileSupported;
  final double minAmount;
  final double maxAmount;
  final double processingFee;

  const PaymentMethodInfo({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    this.iconUrl,
    required this.isEnabled,
    required this.mobileSupported,
    required this.minAmount,
    required this.maxAmount,
    required this.processingFee,
  });

  factory PaymentMethodInfo.fromJson(Map<String, dynamic> json) =>
      _$PaymentMethodInfoFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentMethodInfoToJson(this);
}

/// Wallet Info - Maps to shared wallet interfaces
@JsonSerializable()
class WalletInfoShared {
  final String id;
  final String userId;
  final double balance;
  final double availableBalance;
  final double lockedBalance;
  final String currency;
  final bool isActive;
  final DateTime lastUpdated;
  final List<WalletTransaction>? recentTransactions;

  WalletInfoShared({
    required this.id,
    required this.userId,
    required this.balance,
    required this.availableBalance,
    this.lockedBalance = 0,
    this.currency = 'VND',
    required this.lastUpdated,
    this.isActive = true,
  });

  factory WalletInfoShared.fromJson(Map<String, dynamic> json) =>
      _$WalletInfoSharedFromJson(json);

  Map<String, dynamic> toJson() => _$WalletInfoSharedToJson(this);
}

/// Wallet Transaction
@JsonSerializable()
class WalletTransaction {
  final String id;
  final String walletId;
  final double amount;
  final String type; // credit, debit
  final String description;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  WalletTransaction({
    required this.id,
    required this.walletId,
    required this.amount,
    required this.type,
    required this.description,
    required this.createdAt,
    this.metadata,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) =>
      _$WalletTransactionFromJson(json);

  Map<String, dynamic> toJson() => _$WalletTransactionToJson(this);
}

/// Payment Metadata - Maps to shared PaymentMetadata interface
@JsonSerializable()
class PaymentMetadata {
  final String? tournamentId;
  final String? tournamentName;
  final String? tournamentStartDate;
  final String paymentType;
  final String description;
  final String? userEmail;
  final String? userPhone;
  final String? bankCode;
  final String? cardType;
  final String? ipAddress;
  final String? userAgent;

  PaymentMetadata({
    this.tournamentId,
    this.tournamentName,
    this.tournamentStartDate,
    required this.paymentType,
    required this.description,
    this.userEmail,
    this.userPhone,
    this.bankCode,
    this.cardType,
    this.ipAddress,
    this.userAgent,
  });

  factory PaymentMetadata.fromJson(Map<String, dynamic> json) =>
      _$PaymentMetadataFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentMetadataToJson(this);
}

/// Payment Transaction - Maps to shared PaymentTransaction interface
@JsonSerializable()
class PaymentTransaction {
  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'user_id')
  final String userId;
  final double amount;
  final String currency;
  @JsonKey(name: 'payment_method')
  final String paymentMethod;
  final PaymentStatus status;
  @JsonKey(name: 'transaction_id')
  final String? transactionId;
  @JsonKey(name: 'gateway_response')
  final String? gatewayResponse;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  @JsonKey(name: 'paid_at')
  final DateTime? paidAt;
  @JsonKey(name: 'failed_at')
  final DateTime? failedAt;
  @JsonKey(name: 'error_code')
  final String? errorCode;
  @JsonKey(name: 'error_message')
  final String? errorMessage;
  final PaymentMetadata? metadata;

  PaymentTransaction({
    required this.id,
    required this.orderId,
    required this.userId,
    required this.amount,
    required this.currency,
    required this.paymentMethod,
    required this.status,
    this.transactionId,
    this.gatewayResponse,
    required this.createdAt,
    required this.updatedAt,
    this.paidAt,
    this.failedAt,
    this.errorCode,
    this.errorMessage,
    this.metadata,
  });

  factory PaymentTransaction.fromJson(Map<String, dynamic> json) =>
      _$PaymentTransactionFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentTransactionToJson(this);
}

/// Supported Bank - Maps to shared SupportedBank interface
@JsonSerializable()
class SupportedBank {
  final String code;
  final String name;
  final String nameEn;
  final String? logoUrl;
  final bool enabled;
  final double minAmount;
  final double maxAmount;
  final double processingFee;

  SupportedBank({
    required this.code,
    required this.name,
    required this.nameEn,
    this.logoUrl,
    required this.enabled,
    required this.minAmount,
    required this.maxAmount,
    required this.processingFee,
  });

  factory SupportedBank.fromJson(Map<String, dynamic> json) =>
      _$SupportedBankFromJson(json);

  Map<String, dynamic> toJson() => _$SupportedBankToJson(this);
}
