// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_integration_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VNPayResponse _$VNPayResponseFromJson(Map<String, dynamic> json) =>
    VNPayResponse(
      success: json['success'] as bool,
      paymentUrl: json['paymentUrl'] as String?,
      orderId: json['orderId'] as String,
      amount: (json['amount'] as num).toDouble(),
      message: json['message'] as String,
      errorCode: json['errorCode'] as String?,
    );

Map<String, dynamic> _$VNPayResponseToJson(VNPayResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'paymentUrl': instance.paymentUrl,
      'orderId': instance.orderId,
      'amount': instance.amount,
      'message': instance.message,
      'errorCode': instance.errorCode,
    };

PaymentMethodInfo _$PaymentMethodInfoFromJson(Map<String, dynamic> json) =>
    PaymentMethodInfo(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      type: $enumDecode(_$PaymentMethodEnumMap, json['type']),
      iconUrl: json['iconUrl'] as String?,
      isEnabled: json['isEnabled'] as bool,
      mobileSupported: json['mobileSupported'] as bool,
      minAmount: (json['minAmount'] as num).toDouble(),
      maxAmount: (json['maxAmount'] as num).toDouble(),
      processingFee: (json['processingFee'] as num).toDouble(),
    );

Map<String, dynamic> _$PaymentMethodInfoToJson(PaymentMethodInfo instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'type': _$PaymentMethodEnumMap[instance.type]!,
      'iconUrl': instance.iconUrl,
      'isEnabled': instance.isEnabled,
      'mobileSupported': instance.mobileSupported,
      'minAmount': instance.minAmount,
      'maxAmount': instance.maxAmount,
      'processingFee': instance.processingFee,
    };

const _$PaymentMethodEnumMap = {
  PaymentMethod.vnpay: 'vnpay',
  PaymentMethod.wallet: 'wallet',
  PaymentMethod.bankTransfer: 'bankTransfer',
  PaymentMethod.cash: 'cash',
};

WalletInfoShared _$WalletInfoSharedFromJson(Map<String, dynamic> json) =>
    WalletInfoShared(
      id: json['id'] as String,
      userId: json['userId'] as String,
      balance: (json['balance'] as num).toDouble(),
      availableBalance: (json['availableBalance'] as num).toDouble(),
      lockedBalance: (json['lockedBalance'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String? ?? 'VND',
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$WalletInfoSharedToJson(WalletInfoShared instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'balance': instance.balance,
      'availableBalance': instance.availableBalance,
      'lockedBalance': instance.lockedBalance,
      'currency': instance.currency,
      'isActive': instance.isActive,
      'lastUpdated': instance.lastUpdated.toIso8601String(),
    };

WalletTransaction _$WalletTransactionFromJson(Map<String, dynamic> json) =>
    WalletTransaction(
      id: json['id'] as String,
      walletId: json['walletId'] as String,
      amount: (json['amount'] as num).toDouble(),
      type: json['type'] as String,
      description: json['description'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$WalletTransactionToJson(WalletTransaction instance) =>
    <String, dynamic>{
      'id': instance.id,
      'walletId': instance.walletId,
      'amount': instance.amount,
      'type': instance.type,
      'description': instance.description,
      'createdAt': instance.createdAt.toIso8601String(),
      'metadata': instance.metadata,
    };

PaymentMetadata _$PaymentMetadataFromJson(Map<String, dynamic> json) =>
    PaymentMetadata(
      tournamentId: json['tournamentId'] as String?,
      tournamentName: json['tournamentName'] as String?,
      tournamentStartDate: json['tournamentStartDate'] as String?,
      paymentType: json['paymentType'] as String,
      description: json['description'] as String,
      userEmail: json['userEmail'] as String?,
      userPhone: json['userPhone'] as String?,
      bankCode: json['bankCode'] as String?,
      cardType: json['cardType'] as String?,
      ipAddress: json['ipAddress'] as String?,
      userAgent: json['userAgent'] as String?,
    );

Map<String, dynamic> _$PaymentMetadataToJson(PaymentMetadata instance) =>
    <String, dynamic>{
      'tournamentId': instance.tournamentId,
      'tournamentName': instance.tournamentName,
      'tournamentStartDate': instance.tournamentStartDate,
      'paymentType': instance.paymentType,
      'description': instance.description,
      'userEmail': instance.userEmail,
      'userPhone': instance.userPhone,
      'bankCode': instance.bankCode,
      'cardType': instance.cardType,
      'ipAddress': instance.ipAddress,
      'userAgent': instance.userAgent,
    };

PaymentTransaction _$PaymentTransactionFromJson(Map<String, dynamic> json) =>
    PaymentTransaction(
      id: json['id'] as String,
      orderId: json['order_id'] as String,
      userId: json['user_id'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      paymentMethod: json['payment_method'] as String,
      status: $enumDecode(_$PaymentStatusEnumMap, json['status']),
      transactionId: json['transaction_id'] as String?,
      gatewayResponse: json['gateway_response'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      paidAt: json['paid_at'] == null
          ? null
          : DateTime.parse(json['paid_at'] as String),
      failedAt: json['failed_at'] == null
          ? null
          : DateTime.parse(json['failed_at'] as String),
      errorCode: json['error_code'] as String?,
      errorMessage: json['error_message'] as String?,
      metadata: json['metadata'] == null
          ? null
          : PaymentMetadata.fromJson(json['metadata'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$PaymentTransactionToJson(PaymentTransaction instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'user_id': instance.userId,
      'amount': instance.amount,
      'currency': instance.currency,
      'payment_method': instance.paymentMethod,
      'status': _$PaymentStatusEnumMap[instance.status]!,
      'transaction_id': instance.transactionId,
      'gateway_response': instance.gatewayResponse,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'paid_at': instance.paidAt?.toIso8601String(),
      'failed_at': instance.failedAt?.toIso8601String(),
      'error_code': instance.errorCode,
      'error_message': instance.errorMessage,
      'metadata': instance.metadata,
    };

const _$PaymentStatusEnumMap = {
  PaymentStatus.pending: 'pending',
  PaymentStatus.processing: 'processing',
  PaymentStatus.completed: 'completed',
  PaymentStatus.failed: 'failed',
  PaymentStatus.cancelled: 'cancelled',
  PaymentStatus.refunded: 'refunded',
};

SupportedBank _$SupportedBankFromJson(Map<String, dynamic> json) =>
    SupportedBank(
      code: json['code'] as String,
      name: json['name'] as String,
      nameEn: json['nameEn'] as String,
      logoUrl: json['logoUrl'] as String?,
      enabled: json['enabled'] as bool,
      minAmount: (json['minAmount'] as num).toDouble(),
      maxAmount: (json['maxAmount'] as num).toDouble(),
      processingFee: (json['processingFee'] as num).toDouble(),
    );

Map<String, dynamic> _$SupportedBankToJson(SupportedBank instance) =>
    <String, dynamic>{
      'code': instance.code,
      'name': instance.name,
      'nameEn': instance.nameEn,
      'logoUrl': instance.logoUrl,
      'enabled': instance.enabled,
      'minAmount': instance.minAmount,
      'maxAmount': instance.maxAmount,
      'processingFee': instance.processingFee,
    };
