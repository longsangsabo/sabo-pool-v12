// SABO Pool - Wallet Screen
// Mobile wallet interface using shared payment logic

import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../models/payment_models.dart';
import '../services/mobile_payment_service.dart';
import '../widgets/vnpay_webview.dart';

class WalletScreen extends HookConsumerWidget {
  final String userId;

  const WalletScreen({
    Key? key,
    required this.userId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletInfo = useState<WalletInfo?>(null);
    final transactions = useState<List<PaymentTransaction>>([]);
    final isLoading = useState(true);
    final error = useState<String?>(null);

    // Load wallet data
    useEffect(() {
      _loadWalletData() async {
        try {
          isLoading.value = true;
          final [wallet, txHistory] = await Future.wait([
            MobilePaymentService.getWalletInfo(userId),
            MobilePaymentService.getTransactionHistory(userId, limit: 10),
          ]);
          
          walletInfo.value = wallet as WalletInfo;
          transactions.value = txHistory as List<PaymentTransaction>;
          error.value = null;
        } catch (e) {
          error.value = 'Lỗi tải dữ liệu ví: $e';
        } finally {
          isLoading.value = false;
        }
      }
      
      _loadWalletData();
      return null;
    }, [userId]);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text('Ví SABO'),
        backgroundColor: const Color(0xFF1E88E5),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => _showTransactionHistory(context, transactions.value),
          ),
        ],
      ),
      body: isLoading.value 
        ? const Center(child: CircularProgressIndicator())
        : error.value != null
          ? _buildErrorState(context, error.value!, () {
              // Retry logic
              error.value = null;
              // Trigger reload
            })
          : _buildWalletContent(context, walletInfo.value!, transactions.value),
    );
  }

  Widget _buildWalletContent(
    BuildContext context, 
    WalletInfo wallet, 
    List<PaymentTransaction> transactions,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Wallet Balance Card
          _buildBalanceCard(context, wallet),
          
          const SizedBox(height: 20),
          
          // Quick Actions
          _buildQuickActions(context),
          
          const SizedBox(height: 20),
          
          // Recent Transactions
          _buildRecentTransactions(context, transactions),
        ],
      ),
    );
  }

  Widget _buildBalanceCard(BuildContext context, WalletInfo wallet) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E88E5), Color(0xFF1565C0)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E88E5).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.account_balance_wallet,
                color: Colors.white,
                size: 28,
              ),
              const SizedBox(width: 12),
              Text(
                'Ví SABO',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          Text(
            'Số dư hiện tại',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.white70,
            ),
          ),
          
          const SizedBox(height: 4),
          
          Text(
            '${_formatCurrency(wallet.balance)} VNĐ',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          
          const SizedBox(height: 16),
          
          Row(
            children: [
              Icon(
                Icons.trending_up,
                color: Colors.green[300],
                size: 16,
              ),
              const SizedBox(width: 4),
              Text(
                'Hoạt động: ${transactions.length} giao dịch',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white70,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Thao tác nhanh',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        
        const SizedBox(height: 12),
        
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.add,
                title: 'Nạp tiền',
                subtitle: 'Thêm tiền vào ví',
                color: Colors.green,
                onTap: () => _showTopUpDialog(context),
              ),
            ),
            
            const SizedBox(width: 12),
            
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.sports_esports,
                title: 'Tournament',
                subtitle: 'Tham gia ngay',
                color: Colors.orange,
                onTap: () => _navigateToTournaments(context),
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 12),
        
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.spa,
                title: 'SPA Points',
                subtitle: 'Mua điểm SPA',
                color: Colors.purple,
                onTap: () => _showSPAPointsDialog(context),
              ),
            ),
            
            const SizedBox(width: 12),
            
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.receipt,
                title: 'Lịch sử',
                subtitle: 'Xem giao dịch',
                color: Colors.blue,
                onTap: () => _showTransactionHistory(context, []),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            
            const SizedBox(height: 8),
            
            Text(
              title,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            
            const SizedBox(height: 2),
            
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentTransactions(
    BuildContext context, 
    List<PaymentTransaction> transactions,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Giao dịch gần đây',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () => _showTransactionHistory(context, transactions),
              child: const Text('Xem tất cả'),
            ),
          ],
        ),
        
        const SizedBox(height: 12),
        
        if (transactions.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.receipt_long_outlined,
                  size: 48,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  'Chưa có giao dịch nào',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          )
        else
          ...transactions.take(5).map((transaction) => 
            _buildTransactionCard(context, transaction)
          ),
      ],
    );
  }

  Widget _buildTransactionCard(BuildContext context, PaymentTransaction transaction) {
    final isIncome = transaction.amount > 0;
    final statusColor = _getStatusColor(transaction.status);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getTransactionIcon(transaction),
              color: statusColor,
              size: 24,
            ),
          ),
          
          const SizedBox(width: 12),
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getTransactionTitle(transaction),
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                
                const SizedBox(height: 2),
                
                Text(
                  _formatDate(transaction.createdAt),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isIncome ? '+' : '-'}${_formatCurrency(transaction.amount.abs())} VNĐ',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: isIncome ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
              
              const SizedBox(height: 2),
              
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  _getStatusText(transaction.status),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String error, VoidCallback onRetry) {
    return Center(
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
            'Có lỗi xảy ra',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: onRetry,
            child: const Text('Thử lại'),
          ),
        ],
      ),
    );
  }

  // Helper methods
  void _showTopUpDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => TopUpSheet(userId: userId),
    );
  }

  void _showSPAPointsDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SPAPointsSheet(userId: userId),
    );
  }

  void _showTransactionHistory(BuildContext context, List<PaymentTransaction> transactions) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TransactionHistoryScreen(userId: userId),
      ),
    );
  }

  void _navigateToTournaments(BuildContext context) {
    // Navigate to tournaments screen
    Navigator.pushNamed(context, '/tournaments');
  }

  String _formatCurrency(double amount) {
    return amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  Color _getStatusColor(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.completed:
        return Colors.green;
      case PaymentStatus.pending:
      case PaymentStatus.processing:
        return Colors.orange;
      case PaymentStatus.failed:
      case PaymentStatus.cancelled:
        return Colors.red;
      case PaymentStatus.refunded:
        return Colors.blue;
    }
  }

  String _getStatusText(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.completed:
        return 'Thành công';
      case PaymentStatus.pending:
        return 'Chờ xử lý';
      case PaymentStatus.processing:
        return 'Đang xử lý';
      case PaymentStatus.failed:
        return 'Thất bại';
      case PaymentStatus.cancelled:
        return 'Đã hủy';
      case PaymentStatus.refunded:
        return 'Đã hoàn';
    }
  }

  IconData _getTransactionIcon(PaymentTransaction transaction) {
    // Based on transaction metadata or type
    return Icons.payment;
  }

  String _getTransactionTitle(PaymentTransaction transaction) {
    // Extract from metadata or use description
    return transaction.metadata?.description ?? 'Giao dịch';
  }
}

// Top-up Bottom Sheet
class TopUpSheet extends StatelessWidget {
  final String userId;

  const TopUpSheet({Key? key, required this.userId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Nạp tiền vào ví',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Predefined amounts
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [100000, 200000, 500000, 1000000].map((amount) =>
              VNPayPaymentButton(
                userId: userId,
                amount: amount.toDouble(),
                description: 'Nạp ${_formatCurrency(amount.toDouble())} VNĐ vào ví',
                paymentType: VNPayPaymentType.wallet,
                onPaymentResult: (result) {
                  Navigator.of(context).pop();
                  _showPaymentResult(context, result);
                },
                child: Text('${_formatCurrency(amount.toDouble())} VNĐ'),
              ),
            ).toList(),
          ),
          
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  String _formatCurrency(double amount) {
    return amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  void _showPaymentResult(BuildContext context, PaymentResult result) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(result.success ? 'Thành công' : 'Thất bại'),
        content: Text(result.message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}

// SPA Points Bottom Sheet
class SPAPointsSheet extends StatelessWidget {
  final String userId;

  const SPAPointsSheet({Key? key, required this.userId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Mua SPA Points',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          
          const SizedBox(height: 20),
          
          // SPA Points packages
          _buildSPAPackage(context, 1000, 50000),
          _buildSPAPackage(context, 2500, 100000),
          _buildSPAPackage(context, 5000, 200000),
          _buildSPAPackage(context, 10000, 350000),
          
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildSPAPackage(BuildContext context, int points, double price) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: VNPayPaymentButton(
        userId: userId,
        amount: price,
        description: 'Mua $points SPA Points',
        paymentType: VNPayPaymentType.spaPoints,
        metadata: {'spa_points': points},
        onPaymentResult: (result) {
          Navigator.of(context).pop();
          _showPaymentResult(context, result);
        },
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('$points SPA Points'),
              Text('${_formatCurrency(price)} VNĐ'),
            ],
          ),
        ),
      ),
    );
  }

  String _formatCurrency(double amount) {
    return amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  void _showPaymentResult(BuildContext context, PaymentResult result) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(result.success ? 'Thành công' : 'Thất bại'),
        content: Text(result.message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}

// Transaction History Screen  
class TransactionHistoryScreen extends StatelessWidget {
  final String userId;

  const TransactionHistoryScreen({Key? key, required this.userId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lịch sử giao dịch'),
        backgroundColor: const Color(0xFF1E88E5),
        foregroundColor: Colors.white,
      ),
      body: const Center(
        child: Text('Transaction History - To be implemented'),
      ),
    );
  }
}
