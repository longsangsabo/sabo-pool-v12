// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PaymentRequest _$PaymentRequestFromJson(Map<String, dynamic> json) =>
    PaymentRequest(
      id: json['id'] as String,
      userId: json['userId'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'VND',
      type: $enumDecode(_$TransactionTypeEnumMap, json['type']),
      method: $enumDecode(_$PaymentMethodEnumMap, json['method']),
      description: json['description'] as String,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      expiresAt: json['expiresAt'] == null
          ? null
          : DateTime.parse(json['expiresAt'] as String),
    );

Map<String, dynamic> _$PaymentRequestToJson(PaymentRequest instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'amount': instance.amount,
      'currency': instance.currency,
      'type': _$TransactionTypeEnumMap[instance.type]!,
      'method': _$PaymentMethodEnumMap[instance.method]!,
      'description': instance.description,
      'metadata': instance.metadata,
      'createdAt': instance.createdAt.toIso8601String(),
      'expiresAt': instance.expiresAt?.toIso8601String(),
    };

const _$TransactionTypeEnumMap = {
  TransactionType.topup: 'topup',
  TransactionType.tournament: 'tournament',
  TransactionType.spa: 'spa',
  TransactionType.spaPoints: 'spaPoints',
  TransactionType.membership: 'membership',
  TransactionType.withdrawal: 'withdrawal',
  TransactionType.refund: 'refund',
};

const _$PaymentMethodEnumMap = {
  PaymentMethod.vnpay: 'vnpay',
  PaymentMethod.wallet: 'wallet',
  PaymentMethod.bankTransfer: 'bankTransfer',
  PaymentMethod.cash: 'cash',
};

PaymentResponse _$PaymentResponseFromJson(Map<String, dynamic> json) =>
    PaymentResponse(
      id: json['id'] as String,
      paymentRequestId: json['paymentRequestId'] as String,
      status: $enumDecode(_$PaymentStatusEnumMap, json['status']),
      paymentUrl: json['paymentUrl'] as String?,
      transactionId: json['transactionId'] as String?,
      errorCode: json['errorCode'] as String?,
      errorMessage: json['errorMessage'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
    );

Map<String, dynamic> _$PaymentResponseToJson(PaymentResponse instance) =>
    <String, dynamic>{
      'id': instance.id,
      'paymentRequestId': instance.paymentRequestId,
      'status': _$PaymentStatusEnumMap[instance.status]!,
      'paymentUrl': instance.paymentUrl,
      'transactionId': instance.transactionId,
      'errorCode': instance.errorCode,
      'errorMessage': instance.errorMessage,
      'createdAt': instance.createdAt.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
    };

const _$PaymentStatusEnumMap = {
  PaymentStatus.pending: 'pending',
  PaymentStatus.processing: 'processing',
  PaymentStatus.completed: 'completed',
  PaymentStatus.failed: 'failed',
  PaymentStatus.cancelled: 'cancelled',
  PaymentStatus.refunded: 'refunded',
};

Transaction _$TransactionFromJson(Map<String, dynamic> json) => Transaction(
      id: json['id'] as String,
      userId: json['userId'] as String,
      type: $enumDecode(_$TransactionTypeEnumMap, json['type']),
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'VND',
      status: $enumDecode(_$PaymentStatusEnumMap, json['status']),
      method: $enumDecode(_$PaymentMethodEnumMap, json['method']),
      description: json['description'] as String,
      referenceId: json['referenceId'] as String?,
      transactionId: json['transactionId'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$TransactionToJson(Transaction instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'type': _$TransactionTypeEnumMap[instance.type]!,
      'amount': instance.amount,
      'currency': instance.currency,
      'status': _$PaymentStatusEnumMap[instance.status]!,
      'method': _$PaymentMethodEnumMap[instance.method]!,
      'description': instance.description,
      'referenceId': instance.referenceId,
      'transactionId': instance.transactionId,
      'createdAt': instance.createdAt.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'metadata': instance.metadata,
    };

Wallet _$WalletFromJson(Map<String, dynamic> json) => Wallet(
      id: json['id'] as String,
      userId: json['userId'] as String,
      balance: (json['balance'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'VND',
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$WalletToJson(Wallet instance) => <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'balance': instance.balance,
      'currency': instance.currency,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

VNPayPaymentRequest _$VNPayPaymentRequestFromJson(Map<String, dynamic> json) =>
    VNPayPaymentRequest(
      orderId: json['orderId'] as String,
      amount: (json['amount'] as num).toDouble(),
      orderInfo: json['orderInfo'] as String,
      orderType: json['orderType'] as String? ?? 'billpayment',
      returnUrl: json['returnUrl'] as String,
      ipnUrl: json['ipnUrl'] as String?,
    );

Map<String, dynamic> _$VNPayPaymentRequestToJson(
        VNPayPaymentRequest instance) =>
    <String, dynamic>{
      'orderId': instance.orderId,
      'amount': instance.amount,
      'orderInfo': instance.orderInfo,
      'orderType': instance.orderType,
      'returnUrl': instance.returnUrl,
      'ipnUrl': instance.ipnUrl,
    };

VNPayPaymentResponse _$VNPayPaymentResponseFromJson(
        Map<String, dynamic> json) =>
    VNPayPaymentResponse(
      success: json['success'] as bool,
      paymentUrl: json['paymentUrl'] as String?,
      orderId: json['orderId'] as String?,
      amount: (json['amount'] as num?)?.toDouble(),
      message: json['message'] as String,
      errorCode: json['errorCode'] as String?,
    );

Map<String, dynamic> _$VNPayPaymentResponseToJson(
        VNPayPaymentResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'paymentUrl': instance.paymentUrl,
      'orderId': instance.orderId,
      'amount': instance.amount,
      'message': instance.message,
      'errorCode': instance.errorCode,
    };

PaymentReceipt _$PaymentReceiptFromJson(Map<String, dynamic> json) =>
    PaymentReceipt(
      id: json['id'] as String,
      transactionId: json['transactionId'] as String,
      orderId: json['orderId'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'VND',
      method: $enumDecode(_$PaymentMethodEnumMap, json['method']),
      type: $enumDecode(_$TransactionTypeEnumMap, json['type']),
      status: $enumDecode(_$PaymentStatusEnumMap, json['status']),
      createdAt: DateTime.parse(json['createdAt'] as String),
      details: json['details'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$PaymentReceiptToJson(PaymentReceipt instance) =>
    <String, dynamic>{
      'id': instance.id,
      'transactionId': instance.transactionId,
      'orderId': instance.orderId,
      'amount': instance.amount,
      'currency': instance.currency,
      'method': _$PaymentMethodEnumMap[instance.method]!,
      'type': _$TransactionTypeEnumMap[instance.type]!,
      'status': _$PaymentStatusEnumMap[instance.status]!,
      'createdAt': instance.createdAt.toIso8601String(),
      'details': instance.details,
    };

TopUpPackage _$TopUpPackageFromJson(Map<String, dynamic> json) => TopUpPackage(
      id: json['id'] as String,
      name: json['name'] as String,
      amount: (json['amount'] as num).toDouble(),
      bonusAmount: (json['bonusAmount'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String? ?? 'VND',
      isPopular: json['isPopular'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? true,
      description: json['description'] as String?,
      icon: json['icon'] as String?,
    );

Map<String, dynamic> _$TopUpPackageToJson(TopUpPackage instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'amount': instance.amount,
      'bonusAmount': instance.bonusAmount,
      'currency': instance.currency,
      'isPopular': instance.isPopular,
      'isActive': instance.isActive,
      'description': instance.description,
      'icon': instance.icon,
    };

PaymentTransaction _$PaymentTransactionFromJson(Map<String, dynamic> json) =>
    PaymentTransaction(
      id: json['id'] as String,
      userId: json['userId'] as String,
      orderId: json['orderId'] as String?,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'VND',
      type: $enumDecode(_$TransactionTypeEnumMap, json['type']),
      method: $enumDecode(_$PaymentMethodEnumMap, json['method']),
      status: $enumDecode(_$PaymentStatusEnumMap, json['status']),
      description: json['description'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$PaymentTransactionToJson(PaymentTransaction instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'orderId': instance.orderId,
      'amount': instance.amount,
      'currency': instance.currency,
      'type': _$TransactionTypeEnumMap[instance.type]!,
      'method': _$PaymentMethodEnumMap[instance.method]!,
      'status': _$PaymentStatusEnumMap[instance.status]!,
      'description': instance.description,
      'createdAt': instance.createdAt.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'metadata': instance.metadata,
    };

WalletInfo _$WalletInfoFromJson(Map<String, dynamic> json) => WalletInfo(
      id: json['id'] as String,
      userId: json['userId'] as String,
      balance: (json['balance'] as num).toDouble(),
      availableBalance: (json['availableBalance'] as num).toDouble(),
      lockedBalance: (json['lockedBalance'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String? ?? 'VND',
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$WalletInfoToJson(WalletInfo instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'balance': instance.balance,
      'availableBalance': instance.availableBalance,
      'lockedBalance': instance.lockedBalance,
      'currency': instance.currency,
      'lastUpdated': instance.lastUpdated.toIso8601String(),
      'isActive': instance.isActive,
    };

PaymentMethodInfoLocal _$PaymentMethodInfoLocalFromJson(
        Map<String, dynamic> json) =>
    PaymentMethodInfoLocal(
      id: json['id'] as String,
      method: $enumDecode(_$PaymentMethodEnumMap, json['method']),
      name: json['name'] as String,
      description: json['description'] as String,
      icon: json['icon'] as String,
      isEnabled: json['isEnabled'] as bool? ?? true,
      minAmount: (json['minAmount'] as num?)?.toDouble(),
      maxAmount: (json['maxAmount'] as num?)?.toDouble(),
      settings: json['settings'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$PaymentMethodInfoLocalToJson(
        PaymentMethodInfoLocal instance) =>
    <String, dynamic>{
      'id': instance.id,
      'method': _$PaymentMethodEnumMap[instance.method]!,
      'name': instance.name,
      'description': instance.description,
      'icon': instance.icon,
      'isEnabled': instance.isEnabled,
      'minAmount': instance.minAmount,
      'maxAmount': instance.maxAmount,
      'settings': instance.settings,
    };
