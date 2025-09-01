import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../providers/real_auth_provider.dart';
import '../providers/data_providers.dart';

class ProfileScreen extends ConsumerWidget {
  final Function()? onLogout;
  
  const ProfileScreen({super.key, this.onLogout});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final authState = ref.watch(realAuthStateProvider);
    final userDataAsync = ref.watch(currentUserDataProvider);

    if (!authState.isAuthenticated) {
      return const Scaffold(
        body: Center(
          child: Text('Cần đăng nhập để xem hồ sơ'),
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDark 
        ? const Color(0xFF0f172a) 
        : const Color(0xFFf8fafc),
      appBar: AppBar(
        title: const Text('Hồ sơ'),
        backgroundColor: isDark 
          ? const Color(0xFF1e293b) 
          : Colors.white,
        foregroundColor: isDark 
          ? Colors.white 
          : Colors.grey[900],
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Header
            userDataAsync.when(
              data: (userData) => _buildProfileHeader(
                user: authState.user!,
                userData: userData,
                isDark: isDark,
              ),
              loading: () => _buildLoadingHeader(isDark),
              error: (error, stack) => _buildErrorHeader(error.toString(), isDark),
            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader({
    required user,
    required Map<String, dynamic>? userData,
    required bool isDark,
  }) {
    final userStats = userData?['user'] as Map<String, dynamic>?;
    final ranking = userData?['ranking'] as Map<String, dynamic>?;
    final spaBalance = userData?['spa_balance'] as double? ?? 0;
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1e293b) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark
              ? Colors.grey[700]!.withOpacity(0.5)
              : Colors.grey[200]!,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withOpacity(0.3)
                : Colors.grey.withOpacity(0.1),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Avatar
          CircleAvatar(
            radius: 40,
            backgroundImage: user.avatar != null 
                ? NetworkImage(user.avatar!)
                : null,
            backgroundColor: Colors.blue[600],
            child: user.avatar == null 
                ? const Icon(
                    Icons.person,
                    size: 40,
                    color: Colors.white,
                  )
                : null,
          ),
          const SizedBox(height: 16),
          
          // Name
          Text(
            user.name,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.grey[900],
            ),
          ),
          const SizedBox(height: 8),
          
          // Stats Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatItem(
                'ELO', 
                (userStats?['elo_rating'] ?? 1200).toString(), 
                isDark
              ),
              _buildStatItem(
                'Hạng', 
                userStats?['current_rank'] ?? 'Beginner', 
                isDark
              ),
              _buildStatItem(
                'SPA', 
                spaBalance.toStringAsFixed(0), 
                isDark
              ),
            ],
          ),
          
          if (ranking != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.yellow[600]?.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.yellow[600]?.withOpacity(0.3) ?? Colors.yellow,
                ),
              ),
              child: Text(
                'Xếp hạng #${ranking['ranking_position']}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.yellow[700],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLoadingHeader(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1e293b) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark
              ? Colors.grey[700]!.withOpacity(0.5)
              : Colors.grey[200]!,
        ),
      ),
      child: const Column(
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text('Đang tải dữ liệu...'),
        ],
      ),
    );
  }

  Widget _buildErrorHeader(String error, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1e293b) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark
              ? Colors.grey[700]!.withOpacity(0.5)
              : Colors.grey[200]!,
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.error_outline,
            size: 48,
            color: Colors.red[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Lỗi tải dữ liệu',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.grey[900],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
            
            const SizedBox(height: 24),
            
            // Menu Items
            _buildMenuItem(
              icon: Icons.edit,
              title: 'Chỉnh sửa thông tin',
              onTap: () {
                // Navigate to edit profile
              },
              isDark: isDark,
            ),
            
            const SizedBox(height: 8),
            
            _buildMenuItem(
              icon: Icons.history,
              title: 'Lịch sử trận đấu',
              onTap: () {
                // Navigate to match history
              },
              isDark: isDark,
            ),
            
            const SizedBox(height: 8),
            
            _buildMenuItem(
              icon: Icons.settings,
              title: 'Cài đặt',
              onTap: () {
                // Navigate to settings
              },
              isDark: isDark,
            ),
            
            const SizedBox(height: 8),
            
            _buildMenuItem(
              icon: Icons.help_outline,
              title: 'Trợ giúp',
              onTap: () {
                // Navigate to help
              },
              isDark: isDark,
            ),
            
            const SizedBox(height: 24),
            
            // Logout Button
            if (onLogout != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1e293b) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark
                        ? Colors.grey[700]!.withOpacity(0.5)
                        : Colors.grey[200]!,
                  ),
                ),
                child: ElevatedButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        backgroundColor: isDark ? const Color(0xFF1e293b) : Colors.white,
                        title: Text(
                          'Đăng xuất',
                          style: TextStyle(
                            color: isDark ? Colors.white : Colors.grey[900],
                          ),
                        ),
                        content: Text(
                          'Bạn có chắc chắn muốn đăng xuất?',
                          style: TextStyle(
                            color: isDark ? Colors.grey[300] : Colors.grey[700],
                          ),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: Text(
                              'Hủy',
                              style: TextStyle(
                                color: isDark ? Colors.grey[400] : Colors.grey[600],
                              ),
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context);
                              onLogout!();
                            },
                            child: const Text(
                              'Đăng xuất',
                              style: TextStyle(color: Colors.red),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red[600],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Đăng xuất',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, bool isDark) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.grey[900],
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1e293b) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark
              ? Colors.grey[700]!.withOpacity(0.5)
              : Colors.grey[200]!,
        ),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: isDark ? Colors.blue[300] : Colors.blue[600],
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isDark ? Colors.white : Colors.grey[900],
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: Icon(
          Icons.chevron_right,
          color: isDark ? Colors.grey[400] : Colors.grey[600],
        ),
        onTap: onTap,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
