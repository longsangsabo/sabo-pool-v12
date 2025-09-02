class AppConstants {
  // Supabase Configuration - PRODUCTION KEYS
  static const String supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
  
  static const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';
  
  // VNPay Configuration
  static const String vnpayTmnCode = String.fromEnvironment(
    'VNPAY_TMN_CODE',
    defaultValue: '7F93DNAA',
  );
  
  static const String vnpayUrl = String.fromEnvironment(
    'VNPAY_URL',
    defaultValue: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  );
  
  // App Configuration
  static const String appVersion = '1.0.0';
  static const String appName = 'SABO Pool Arena';
}
