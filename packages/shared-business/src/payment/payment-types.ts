// Payment System Types for SABO Pool Arena

// VNPAY Gateway Types
export interface VNPAYConfig {
  tmn_code: string;
  hash_secret: string;
  payment_url: string;
  return_url: string;
  ipn_url: string;
  version: string;
  command: string;
  currency_code: string;
  locale: string;
}

export interface VNPAYPaymentParams {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_CurrCode: string;
  vnp_TxnRef: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_ReturnUrl: string;
  vnp_IpAddr: string;
  vnp_CreateDate: string;
  vnp_Locale: string;
  vnp_SecureHash?: string;
}

export interface VNPAYResponse {
  success: boolean;
  paymentUrl?: string;
  orderId: string;
  amount: number;
  message: string;
  errorCode?: string;
}

export interface VNPAYReturnParams {
  vnp_ResponseCode: string;
  vnp_TxnRef: string;
  vnp_Amount: string;
  vnp_TransactionNo: string;
  vnp_SecureHash: string;
  vnp_PayDate?: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
}

export interface VNPAYIPNResponse {
  RspCode: string;
  Message: string;
}

// Payment Transaction Types
export interface PaymentTransaction {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: 'vnpay' | 'bank_transfer' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transaction_id?: string;
  gateway_response?: any;
  created_at: Date;
  updated_at: Date;
  paid_at?: Date;
  failed_at?: Date;
  refunded_at?: Date;
  error_code?: string;
  error_message?: string;
  metadata?: PaymentMetadata;
}

export interface PaymentMetadata {
  tournament_id?: string;
  tournament_name?: string;
  tournament_start_date?: string;
  payment_type: 'tournament_entry' | 'spa_points_purchase' | 'premium_subscription' | 'other';
  description: string;
  user_email?: string;
  user_phone?: string;
  bank_code?: string;
  card_type?: string;
  ip_address?: string;
  user_agent?: string;
}

// Payment Order Types
export interface PaymentOrder {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  description: string;
  order_type: 'tournament_entry' | 'spa_points' | 'subscription' | 'other';
  status: 'draft' | 'pending_payment' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  payment_method?: string;
  items: PaymentOrderItem[];
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
  payment_deadline?: Date;
  metadata?: any;
}

export interface PaymentOrderItem {
  id: string;
  order_id: string;
  item_type: 'tournament_entry' | 'spa_points_pack' | 'subscription' | 'cue_unlock' | 'table_theme';
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  metadata?: any;
}

// Payment Method Types
export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  type: 'gateway' | 'bank_transfer' | 'wallet' | 'cryptocurrency';
  enabled: boolean;
  min_amount: number;
  max_amount: number;
  currency: string;
  fee_percentage: number;
  fee_fixed: number;
  processing_time: string;
  description: string;
  logo_url?: string;
  config?: any;
}

// Bank and Card Types
export interface SupportedBank {
  code: string;
  name: string;
  name_en: string;
  logo_url?: string;
  enabled: boolean;
  min_amount: number;
  max_amount: number;
  processing_fee: number;
}

export interface CardInfo {
  card_number_masked: string;
  card_type: 'VISA' | 'MASTERCARD' | 'JCB' | 'AMEX' | 'LOCAL';
  bank_code: string;
  bank_name: string;
  country_code: string;
}

// Payment Validation Types
export interface PaymentValidationResult {
  valid: boolean;
  errors: PaymentValidationError[];
  warnings: PaymentValidationWarning[];
}

export interface PaymentValidationError {
  field: string;
  code: string;
  message: string;
  details?: any;
}

export interface PaymentValidationWarning {
  field: string;
  code: string;
  message: string;
  details?: any;
}

// Payment Analytics Types
export interface PaymentAnalytics {
  total_transactions: number;
  total_amount: number;
  successful_transactions: number;
  failed_transactions: number;
  success_rate: number;
  average_transaction_amount: number;
  payment_methods_breakdown: PaymentMethodStats[];
  time_period: {
    start_date: Date;
    end_date: Date;
  };
}

export interface PaymentMethodStats {
  payment_method: string;
  transaction_count: number;
  total_amount: number;
  success_rate: number;
  average_amount: number;
}

// Refund Types
export interface RefundRequest {
  id: string;
  transaction_id: string;
  order_id: string;
  user_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed';
  requested_at: Date;
  processed_at?: Date;
  processed_by?: string;
  refund_method: 'original_payment' | 'bank_transfer' | 'wallet';
  gateway_refund_id?: string;
  notes?: string;
}

export interface RefundResponse {
  success: boolean;
  refund_id?: string;
  transaction_id: string;
  amount: number;
  status: string;
  message: string;
  processing_time?: string;
  gateway_response?: any;
}

// Payment Security Types
export interface PaymentSecurityLog {
  id: string;
  transaction_id?: string;
  event_type: 'hash_verification' | 'ip_validation' | 'rate_limit' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  user_agent?: string;
  details: any;
  timestamp: Date;
  resolved: boolean;
  resolved_at?: Date;
}

export interface HashVerificationResult {
  valid: boolean;
  calculated_hash: string;
  received_hash: string;
  algorithm: 'sha256' | 'sha512' | 'md5';
  timestamp: Date;
}

// Payment Configuration Types
export interface PaymentGatewayConfig {
  gateway_name: string;
  enabled: boolean;
  test_mode: boolean;
  credentials: {
    merchant_id?: string;
    api_key?: string;
    secret_key?: string;
    hash_secret?: string;
    [key: string]: any;
  };
  endpoints: {
    payment_url: string;
    return_url: string;
    ipn_url: string;
    api_base_url?: string;
  };
  settings: {
    timeout_minutes: number;
    retry_attempts: number;
    auto_capture: boolean;
    currency: string;
    locale: string;
  };
}

// Webhook Types
export interface PaymentWebhook {
  id: string;
  event_type: 'payment.completed' | 'payment.failed' | 'payment.cancelled' | 'refund.processed';
  payment_id: string;
  order_id: string;
  payload: any;
  signature: string;
  received_at: Date;
  processed: boolean;
  processed_at?: Date;
  retry_count: number;
  max_retries: number;
  next_retry_at?: Date;
}

// Service Result Types
export interface PaymentServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: PaymentError;
  message?: string;
  transaction_id?: string;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: any;
  gateway_error?: any;
  retry_allowed?: boolean;
}

// Currency and Localization
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  smallest_unit_multiplier: number; // e.g., 100 for VND (to convert to xu)
}

export interface PaymentLocalization {
  language: string;
  currency: string;
  date_format: string;
  number_format: string;
  payment_texts: {
    [key: string]: string;
  };
}

// Response Code Mappings
export interface VNPAYResponseCode {
  code: string;
  message: string;
  message_en: string;
  category: 'success' | 'user_error' | 'system_error' | 'bank_error';
  retry_allowed: boolean;
}

// Tournament Payment Integration
export interface TournamentPaymentInfo {
  tournament_id: string;
  tournament_name: string;
  entry_fee: number;
  currency: string;
  max_participants: number;
  current_participants: number;
  registration_deadline: Date;
  payment_deadline: Date;
  refund_policy: 'full' | 'partial' | 'none';
  refund_deadline?: Date;
}

export interface TournamentPaymentOrder extends PaymentOrder {
  tournament_info: TournamentPaymentInfo;
  participant_info: {
    user_id: string;
    username: string;
    email: string;
    phone?: string;
    rank: string;
    rating: number;
  };
}

// SPA Points Purchase Types
export interface SPAPointsPackage {
  id: string;
  name: string;
  points_amount: number;
  price: number;
  currency: string;
  bonus_points: number;
  total_points: number;
  discount_percentage?: number;
  limited_time?: boolean;
  expires_at?: Date;
  popular?: boolean;
  description: string;
}

export interface SPAPointsPurchaseOrder extends PaymentOrder {
  package_info: SPAPointsPackage;
  bonus_applied: boolean;
  promotion_code?: string;
}

// Payment Flow Types
export type PaymentFlow = 'redirect' | 'embedded' | 'api' | 'mobile_app';

export interface PaymentFlowConfig {
  flow_type: PaymentFlow;
  return_url?: string;
  cancel_url?: string;
  webhook_url?: string;
  embedded_options?: {
    theme: 'light' | 'dark';
    language: string;
    width?: number;
    height?: number;
  };
}

// Rate Limiting Types
export interface PaymentRateLimit {
  user_id?: string;
  ip_address?: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  current_minute_count: number;
  current_hour_count: number;
  current_day_count: number;
  window_start: Date;
  blocked_until?: Date;
}
