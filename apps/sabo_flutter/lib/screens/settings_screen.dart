import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // Account Settings
  bool _emailNotifications = true;
  bool _pushNotifications = true;
  bool _smsNotifications = false;
  bool _soundEnabled = true;
  bool _vibrationEnabled = true;

  // Privacy Settings
  bool _profilePublic = true;
  bool _showLocation = true;
  bool _showStats = true;
  bool _allowFriendRequests = true;

  // App Preferences
  String _language = 'vi';
  String _currency = 'VND';
  String _theme = 'dark';
  double _soundVolume = 0.7;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0B),
      appBar: _buildAppBar(),
      body: _buildBody(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: const Color(0xFF1A1A1B),
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      title: const Text(
        'Cài Đặt',
        style: TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      centerTitle: true,
    );
  }

  Widget _buildBody() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildAccountSection(),
          const SizedBox(height: 24),
          _buildNotificationSection(),
          const SizedBox(height: 24),
          _buildPrivacySection(),
          const SizedBox(height: 24),
          _buildAppPreferencesSection(),
          const SizedBox(height: 24),
          _buildAboutSection(),
          const SizedBox(height: 100), // Bottom padding
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildAccountSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Tài Khoản'),
        _buildSettingsCard([
          _buildListTile(
            icon: Icons.person_outline,
            title: 'Chỉnh sửa hồ sơ',
            subtitle: 'Cập nhật thông tin cá nhân',
            onTap: () => _navigateToProfile(),
          ),
          _buildListTile(
            icon: Icons.lock_outline,
            title: 'Đổi mật khẩu',
            subtitle: 'Cập nhật mật khẩu đăng nhập',
            onTap: () => _changePassword(),
          ),
          _buildListTile(
            icon: Icons.phone_outlined,
            title: 'Số điện thoại',
            subtitle: '+84 123 456 789',
            onTap: () => _changePhone(),
          ),
          _buildListTile(
            icon: Icons.email_outlined,
            title: 'Email',
            subtitle: 'user@example.com',
            onTap: () => _changeEmail(),
          ),
        ]),
      ],
    );
  }

  Widget _buildNotificationSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Thông Báo'),
        _buildSettingsCard([
          _buildSwitchTile(
            icon: Icons.email_outlined,
            title: 'Email thông báo',
            subtitle: 'Nhận thông báo qua email',
            value: _emailNotifications,
            onChanged: (value) => setState(() => _emailNotifications = value),
          ),
          _buildSwitchTile(
            icon: Icons.notifications_outlined,
            title: 'Push notifications',
            subtitle: 'Thông báo đẩy trên điện thoại',
            value: _pushNotifications,
            onChanged: (value) => setState(() => _pushNotifications = value),
          ),
          _buildSwitchTile(
            icon: Icons.sms_outlined,
            title: 'SMS thông báo',
            subtitle: 'Nhận thông báo qua tin nhắn',
            value: _smsNotifications,
            onChanged: (value) => setState(() => _smsNotifications = value),
          ),
          _buildSwitchTile(
            icon: Icons.volume_up_outlined,
            title: 'Âm thanh',
            subtitle: 'Phát âm thanh thông báo',
            value: _soundEnabled,
            onChanged: (value) => setState(() => _soundEnabled = value),
          ),
          _buildSwitchTile(
            icon: Icons.vibration,
            title: 'Rung',
            subtitle: 'Rung khi có thông báo',
            value: _vibrationEnabled,
            onChanged: (value) => setState(() => _vibrationEnabled = value),
          ),
        ]),
      ],
    );
  }

  Widget _buildPrivacySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Quyền Riêng Tư'),
        _buildSettingsCard([
          _buildSwitchTile(
            icon: Icons.public,
            title: 'Hồ sơ công khai',
            subtitle: 'Cho phép người khác xem hồ sơ',
            value: _profilePublic,
            onChanged: (value) => setState(() => _profilePublic = value),
          ),
          _buildSwitchTile(
            icon: Icons.location_on_outlined,
            title: 'Hiển thị vị trí',
            subtitle: 'Chia sẻ vị trí hiện tại',
            value: _showLocation,
            onChanged: (value) => setState(() => _showLocation = value),
          ),
          _buildSwitchTile(
            icon: Icons.bar_chart,
            title: 'Hiển thị thống kê',
            subtitle: 'Cho phép xem thống kê game',
            value: _showStats,
            onChanged: (value) => setState(() => _showStats = value),
          ),
          _buildSwitchTile(
            icon: Icons.person_add_outlined,
            title: 'Cho phép kết bạn',
            subtitle: 'Nhận lời mời kết bạn',
            value: _allowFriendRequests,
            onChanged: (value) => setState(() => _allowFriendRequests = value),
          ),
        ]),
      ],
    );
  }

  Widget _buildAppPreferencesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Tùy Chọn Ứng Dụng'),
        _buildSettingsCard([
          _buildDropdownTile(
            icon: Icons.language,
            title: 'Ngôn ngữ',
            value: _language,
            items: const [
              {'value': 'vi', 'label': 'Tiếng Việt'},
              {'value': 'en', 'label': 'English'},
            ],
            onChanged: (value) => setState(() => _language = value!),
          ),
          _buildDropdownTile(
            icon: Icons.monetization_on_outlined,
            title: 'Tiền tệ',
            value: _currency,
            items: const [
              {'value': 'VND', 'label': 'VND (₫)'},
              {'value': 'USD', 'label': 'USD (\$)'},
            ],
            onChanged: (value) => setState(() => _currency = value!),
          ),
          _buildDropdownTile(
            icon: Icons.palette_outlined,
            title: 'Giao diện',
            value: _theme,
            items: const [
              {'value': 'dark', 'label': 'Tối'},
              {'value': 'light', 'label': 'Sáng'},
              {'value': 'auto', 'label': 'Tự động'},
            ],
            onChanged: (value) => setState(() => _theme = value!),
          ),
          _buildSliderTile(
            icon: Icons.volume_up,
            title: 'Âm lượng',
            value: _soundVolume,
            onChanged: (value) => setState(() => _soundVolume = value),
          ),
        ]),
      ],
    );
  }

  Widget _buildAboutSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Thông Tin'),
        _buildSettingsCard([
          _buildListTile(
            icon: Icons.info_outline,
            title: 'Về ứng dụng',
            subtitle: 'Phiên bản 1.0.0',
            onTap: () => _showAboutDialog(),
          ),
          _buildListTile(
            icon: Icons.privacy_tip_outlined,
            title: 'Chính sách bảo mật',
            subtitle: 'Điều khoản sử dụng',
            onTap: () => _showPrivacyPolicy(),
          ),
          _buildListTile(
            icon: Icons.help_outline,
            title: 'Trợ giúp',
            subtitle: 'Hỗ trợ khách hàng',
            onTap: () => _showHelp(),
          ),
          _buildListTile(
            icon: Icons.logout,
            title: 'Đăng xuất',
            subtitle: 'Thoát khỏi tài khoản',
            onTap: () => _logout(),
            isDestructive: true,
          ),
        ]),
      ],
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF333333),
          width: 1,
        ),
      ),
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildListTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: isDestructive ? Colors.red : Colors.white70,
        size: 24,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isDestructive ? Colors.red : Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          color: Colors.white54,
          fontSize: 14,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: isDestructive ? Colors.red : Colors.white54,
      ),
      onTap: onTap,
    );
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.white70, size: 24),
      title: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          color: Colors.white54,
          fontSize: 14,
        ),
      ),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: const Color(0xFF4CAF50),
        activeTrackColor: const Color(0xFF4CAF50).withOpacity(0.3),
      ),
    );
  }

  Widget _buildDropdownTile({
    required IconData icon,
    required String title,
    required String value,
    required List<Map<String, String>> items,
    required ValueChanged<String?> onChanged,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.white70, size: 24),
      title: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: DropdownButton<String>(
        value: value,
        items: items.map((item) {
          return DropdownMenuItem<String>(
            value: item['value'],
            child: Text(
              item['label']!,
              style: const TextStyle(color: Colors.white),
            ),
          );
        }).toList(),
        onChanged: onChanged,
        dropdownColor: const Color(0xFF2A2A2B),
        underline: Container(),
        icon: const Icon(Icons.arrow_drop_down, color: Colors.white54),
      ),
    );
  }

  Widget _buildSliderTile({
    required IconData icon,
    required String title,
    required double value,
    required ValueChanged<double> onChanged,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.white70, size: 24),
      title: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Slider(
        value: value,
        onChanged: onChanged,
        activeColor: const Color(0xFF4CAF50),
        inactiveColor: const Color(0xFF4CAF50).withOpacity(0.3),
        divisions: 10,
        label: '${(value * 100).round()}%',
      ),
    );
  }

  // Navigation methods
  void _navigateToProfile() {
    Navigator.pushNamed(context, '/profile');
  }

  void _changePassword() {
    // Show change password dialog
    _showChangePasswordDialog();
  }

  void _changePhone() {
    // Show change phone dialog
    _showChangePhoneDialog();
  }

  void _changeEmail() {
    // Show change email dialog
    _showChangeEmailDialog();
  }

  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1B),
        title: const Text(
          'SABO Pool Arena',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Phiên bản: 1.0.0\nPhát triển bởi SABO Team\n\n© 2025 SABO Pool Arena',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Đóng',
              style: TextStyle(color: Color(0xFF4CAF50)),
            ),
          ),
        ],
      ),
    );
  }

  void _showPrivacyPolicy() {
    // Navigate to privacy policy screen
  }

  void _showHelp() {
    // Navigate to help screen
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1B),
        title: const Text(
          'Đăng xuất',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Bạn có chắc chắn muốn đăng xuất?',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Hủy',
              style: TextStyle(color: Colors.white54),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Perform logout
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/auth/login',
                (route) => false,
              );
            },
            child: const Text(
              'Đăng xuất',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog() {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1B),
        title: const Text(
          'Đổi mật khẩu',
          style: TextStyle(color: Colors.white),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: currentPasswordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Mật khẩu hiện tại',
                labelStyle: TextStyle(color: Colors.white54),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white54),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Color(0xFF4CAF50)),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: newPasswordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Mật khẩu mới',
                labelStyle: TextStyle(color: Colors.white54),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white54),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Color(0xFF4CAF50)),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: confirmPasswordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Xác nhận mật khẩu mới',
                labelStyle: TextStyle(color: Colors.white54),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white54),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Color(0xFF4CAF50)),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Hủy',
              style: TextStyle(color: Colors.white54),
            ),
          ),
          TextButton(
            onPressed: () {
              // Validate and change password
              Navigator.pop(context);
              HapticFeedback.lightImpact();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Đổi mật khẩu thành công!'),
                  backgroundColor: Color(0xFF4CAF50),
                ),
              );
            },
            child: const Text(
              'Đổi mật khẩu',
              style: TextStyle(color: Color(0xFF4CAF50)),
            ),
          ),
        ],
      ),
    );
  }

  void _showChangePhoneDialog() {
    final phoneController = TextEditingController(text: '0123456789');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1B),
        title: const Text(
          'Đổi số điện thoại',
          style: TextStyle(color: Colors.white),
        ),
        content: TextField(
          controller: phoneController,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            labelText: 'Số điện thoại mới',
            labelStyle: TextStyle(color: Colors.white54),
            enabledBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.white54),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Color(0xFF4CAF50)),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Hủy',
              style: TextStyle(color: Colors.white54),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              HapticFeedback.lightImpact();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Cập nhật số điện thoại thành công!'),
                  backgroundColor: Color(0xFF4CAF50),
                ),
              );
            },
            child: const Text(
              'Cập nhật',
              style: TextStyle(color: Color(0xFF4CAF50)),
            ),
          ),
        ],
      ),
    );
  }

  void _showChangeEmailDialog() {
    final emailController = TextEditingController(text: 'user@example.com');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1B),
        title: const Text(
          'Đổi email',
          style: TextStyle(color: Colors.white),
        ),
        content: TextField(
          controller: emailController,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            labelText: 'Email mới',
            labelStyle: TextStyle(color: Colors.white54),
            enabledBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.white54),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Color(0xFF4CAF50)),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Hủy',
              style: TextStyle(color: Colors.white54),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              HapticFeedback.lightImpact();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Cập nhật email thành công!'),
                  backgroundColor: Color(0xFF4CAF50),
                ),
              );
            },
            child: const Text(
              'Cập nhật',
              style: TextStyle(color: Color(0xFF4CAF50)),
            ),
          ),
        ],
      ),
    );
  }
}
