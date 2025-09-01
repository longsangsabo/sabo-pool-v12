// SABO Pool - VNPAY WebView Integration
// Mobile WebView for VNPAY payment processing

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../models/payment_models.dart';
import '../services/mobile_payment_service.dart';

class VNPayWebViewScreen extends StatefulWidget {
  final String paymentUrl;
  final String transactionId;
  final Function(PaymentResult) onPaymentResult;

  const VNPayWebViewScreen({
    Key? key,
    required this.paymentUrl,
    required this.transactionId,
    required this.onPaymentResult,
  }) : super(key: key);

  @override
  State<VNPayWebViewScreen> createState() => _VNPayWebViewScreenState();
}

class _VNPayWebViewScreenState extends State<VNPayWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }

  void _initializeWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
            _handleUrlChange(url);
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onHttpError: (HttpResponseError error) {
            setState(() {
              _error = 'HTTP Error: ${error.response?.statusCode}';
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _error = 'Web Resource Error: ${error.description}';
              _isLoading = false;
            });
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  void _handleUrlChange(String url) {
    // Check for VNPAY return URLs
    if (url.contains('/payment/vnpay/return') || 
        url.contains('/payment/vnpay/cancel')) {
      _processPaymentResult(url);
    }
  }

  Future<void> _processPaymentResult(String returnUrl) async {
    try {
      // Extract parameters from return URL
      final uri = Uri.parse(returnUrl);
      final params = uri.queryParameters;
      
      // Verify payment with backend using shared logic
      final transaction = await MobilePaymentService.verifyPayment(widget.transactionId);
      
      final result = PaymentResult(
        success: transaction.status == PaymentStatus.completed,
        transactionId: widget.transactionId,
        message: _getPaymentMessage(transaction.status),
        transaction: transaction,
        vnpayParams: params,
      );

      widget.onPaymentResult(result);
    } catch (e) {
      final result = PaymentResult(
        success: false,
        transactionId: widget.transactionId,
        message: 'Lỗi xác thực thanh toán: $e',
        transaction: null,
        vnpayParams: {},
      );
      widget.onPaymentResult(result);
    }
  }

  String _getPaymentMessage(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.completed:
        return 'Thanh toán thành công!';
      case PaymentStatus.failed:
        return 'Thanh toán thất bại!';
      case PaymentStatus.cancelled:
        return 'Thanh toán bị hủy!';
      case PaymentStatus.pending:
        return 'Thanh toán đang xử lý...';
      default:
        return 'Trạng thái thanh toán không xác định';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('VNPAY Payment'),
        backgroundColor: const Color(0xFF1E88E5),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              _controller.reload();
            },
          ),
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              // Cancel payment
              final result = PaymentResult(
                success: false,
                transactionId: widget.transactionId,
                message: 'Thanh toán bị hủy bởi người dùng',
                transaction: null,
                vnpayParams: {},
              );
              widget.onPaymentResult(result);
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          if (_error != null)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.red,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Lỗi tải trang thanh toán',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _error!,
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _error = null;
                      });
                      _initializeWebView();
                    },
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            )
          else
            WebViewWidget(controller: _controller),
          
          if (_isLoading)
            Container(
              color: Colors.white.withOpacity(0.8),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('Đang tải trang thanh toán...'),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// Payment Result Model
class PaymentResult {
  final bool success;
  final String transactionId;
  final String message;
  final PaymentTransaction? transaction;
  final Map<String, String> vnpayParams;

  PaymentResult({
    required this.success,
    required this.transactionId,
    required this.message,
    required this.transaction,
    required this.vnpayParams,
  });
}

// VNPAY Payment Widget - Easy integration
class VNPayPaymentButton extends StatelessWidget {
  final String userId;
  final double amount;
  final String description;
  final VNPayPaymentType paymentType;
  final Map<String, dynamic>? metadata;
  final Function(PaymentResult) onPaymentResult;
  final Widget? child;

  const VNPayPaymentButton({
    Key? key,
    required this.userId,
    required this.amount,
    required this.description,
    required this.paymentType,
    required this.onPaymentResult,
    this.metadata,
    this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => _initiatePayment(context),
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF1E88E5),
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
      child: child ?? 
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'assets/icons/vnpay.png',
              height: 24,
              width: 24,
            ),
            const SizedBox(width: 8),
            const Text('Thanh toán VNPAY'),
          ],
        ),
    );
  }

  Future<void> _initiatePayment(BuildContext context) async {
    try {
      // Show loading
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );

      // Create payment using shared logic
      final vnpayResponse = await MobilePaymentService.createVNPayPayment(
        userId: userId,
        amount: amount,
        description: description,
        paymentType: paymentType,
        metadata: metadata,
      );

      // Hide loading
      if (context.mounted) {
        Navigator.of(context).pop();
      }

      if (vnpayResponse.success && vnpayResponse.paymentUrl != null) {
        // Open WebView for payment
        if (context.mounted) {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => VNPayWebViewScreen(
                paymentUrl: vnpayResponse.paymentUrl!,
                transactionId: vnpayResponse.orderId,
                onPaymentResult: (result) {
                  Navigator.of(context).pop(); // Close WebView
                  onPaymentResult(result);
                },
              ),
            ),
          );
        }
      } else {
        // Payment creation failed
        onPaymentResult(PaymentResult(
          success: false,
          transactionId: vnpayResponse.orderId,
          message: vnpayResponse.message,
          transaction: null,
          vnpayParams: {},
        ));
      }
    } catch (e) {
      // Hide loading if still showing
      if (context.mounted) {
        Navigator.of(context).pop();
      }
      
      onPaymentResult(PaymentResult(
        success: false,
        transactionId: '',
        message: 'Lỗi khởi tạo thanh toán: $e',
        transaction: null,
        vnpayParams: {},
      ));
    }
  }
}
