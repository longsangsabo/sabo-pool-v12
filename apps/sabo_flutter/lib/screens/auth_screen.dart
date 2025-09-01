import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

// Import new auth screens
import 'auth/otp_verification_screen.dart';
import 'auth/password_reset_screen.dart';

class AuthScreen extends StatefulWidget {
  final String mode; // 'login', 'register', 'forgot-password', 'reset-password'
  final Function(Map<String, String>)? onSubmit;

  const AuthScreen({
    super.key,
    this.mode = 'login',
    this.onSubmit,
  });

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  // Form controllers
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _fullNameController = TextEditingController();

  // Form state
  bool _isLoading = false;
  bool _showPassword = false;
  bool _emailSent = false;
  String _activeTab = 'phone'; // 'phone' or 'email'

  // Form validation
  String? _phoneError;
  String? _emailError;
  String? _passwordError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _animationController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _fullNameController.dispose();
    super.dispose();
  }

  String get _pageTitle {
    switch (widget.mode) {
      case 'register':
        return 'Đăng ký';
      case 'forgot-password':
        return 'Quên mật khẩu';
      case 'reset-password':
        return 'Đặt lại mật khẩu';
      default:
        return 'Đăng nhập';
    }
  }

  IconData get _pageIcon {
    switch (widget.mode) {
      case 'register':
        return Icons.person_add_rounded;
      case 'forgot-password':
        return Icons.mail_outline_rounded;
      case 'reset-password':
        return Icons.security_rounded;
      default:
        return Icons.login_rounded;
    }
  }

  bool _validatePhone(String phone) {
    final phoneRegex = RegExp(r'^0\d{9}$');
    return phoneRegex.hasMatch(phone);
  }

  bool _validateEmail(String email) {
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return emailRegex.hasMatch(email);
  }

  void _validateInputs() {
    setState(() {
      _phoneError = null;
      _emailError = null;
      _passwordError = null;
    });

    if (_activeTab == 'phone' && !_validatePhone(_phoneController.text)) {
      setState(() {
        _phoneError = 'Số điện thoại phải có 10 số và bắt đầu bằng 0';
      });
      return;
    }

    if (_activeTab == 'email' && !_validateEmail(_emailController.text)) {
      setState(() {
        _emailError = 'Email không hợp lệ';
      });
      return;
    }

    if (_passwordController.text.length < 6) {
      setState(() {
        _passwordError = 'Mật khẩu phải có ít nhất 6 ký tự';
      });
      return;
    }

    if (widget.mode == 'register' &&
        _passwordController.text != _confirmPasswordController.text) {
      setState(() {
        _passwordError = 'Mật khẩu xác nhận không khớp';
      });
      return;
    }
  }

  Future<void> _handleSubmit() async {
    _validateInputs();
    
    if (_phoneError != null || _emailError != null || _passwordError != null) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      if (widget.onSubmit != null) {
        // Use provided callback
        final data = {
          'identifier': _activeTab == 'phone' ? _phoneController.text : _emailController.text,
          'password': _passwordController.text,
          'method': _activeTab,
          'fullName': _fullNameController.text,
        };
        await widget.onSubmit!(data);
      } else {
        // Fallback to old logic
        await Future.delayed(const Duration(seconds: 2));

        if (widget.mode == 'forgot-password') {
          // Navigate to enhanced password reset screen
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => const PasswordResetScreen(),
            ),
          );
        } else if (widget.mode == 'reset-password') {
          _showSuccess('Mật khẩu đã được cập nhật thành công!');
          context.go('/auth/login');
        } else if (widget.mode == 'login' || widget.mode == 'register') {
          // Navigate to OTP verification screen
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => OTPVerificationScreen(
                phoneNumber: _phoneController.text,
                email: _emailController.text,
                verificationType: _activeTab, // 'phone' or 'email'
              ),
            ),
          );
        }
      }
    } catch (error) {
      _showError('Có lỗi xảy ra: $error');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Widget _buildSocialButtons() {
    if (widget.mode != 'login' && widget.mode != 'register') {
      return const SizedBox.shrink();
    }

    return Column(
      children: [
        // Google Sign In Button
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton.icon(
            onPressed: () {
              // TODO: Implement Google Sign In
              _showError('Google Sign In chưa được triển khai');
            },
            icon: Image.asset(
              'assets/images/google_logo.png',
              height: 20,
              width: 20,
              errorBuilder: (context, error, stackTrace) => 
                  const Icon(Icons.g_mobiledata, color: Colors.red),
            ),
            label: const Text('Tiếp tục với Google'),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.grey),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Facebook Sign In Button
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton.icon(
            onPressed: () {
              // TODO: Implement Facebook Sign In
              _showError('Facebook Sign In chưa được triển khai');
            },
            icon: const Icon(Icons.facebook, color: Colors.blue),
            label: const Text('Tiếp tục với Facebook'),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.blue),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(child: Divider(color: Colors.grey[400])),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'HOẶC',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Expanded(child: Divider(color: Colors.grey[400])),
          ],
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildAuthTabs() {
    if (widget.mode != 'login' && widget.mode != 'register') {
      return const SizedBox.shrink();
    }

    return Column(
      children: [
        TabBar(
          controller: _tabController,
          onTap: (index) {
            setState(() {
              _activeTab = index == 0 ? 'phone' : 'email';
            });
          },
          labelColor: Theme.of(context).primaryColor,
          unselectedLabelColor: Colors.grey[600],
          indicatorColor: Theme.of(context).primaryColor,
          tabs: const [
            Tab(
              icon: Icon(Icons.phone_rounded),
              text: 'SĐT',
            ),
            Tab(
              icon: Icon(Icons.mail_outline_rounded),
              text: 'Email',
            ),
          ],
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildAuthForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Full name field for register
        if (widget.mode == 'register') ...[
          TextFormField(
            controller: _fullNameController,
            decoration: const InputDecoration(
              labelText: 'Họ và tên',
              hintText: 'Nguyễn Văn A',
              prefixIcon: Icon(Icons.person_outline_rounded),
              border: OutlineInputBorder(),
            ),
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 16),
        ],

        // Phone/Email field
        if (_activeTab == 'phone' || widget.mode == 'forgot-password') ...[
          TextFormField(
            controller: _activeTab == 'phone' ? _phoneController : _emailController,
            decoration: InputDecoration(
              labelText: _activeTab == 'phone' ? 'Số điện thoại' : 'Email',
              hintText: _activeTab == 'phone' ? '0961167717' : 'example@email.com',
              prefixIcon: Icon(_activeTab == 'phone' 
                  ? Icons.phone_rounded 
                  : Icons.mail_outline_rounded),
              border: const OutlineInputBorder(),
              errorText: _activeTab == 'phone' ? _phoneError : _emailError,
            ),
            keyboardType: _activeTab == 'phone' 
                ? TextInputType.phone 
                : TextInputType.emailAddress,
            inputFormatters: _activeTab == 'phone' 
                ? [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(10)]
                : null,
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 16),
        ] else if (_activeTab == 'email') ...[
          TextFormField(
            controller: _emailController,
            decoration: InputDecoration(
              labelText: 'Email',
              hintText: 'example@email.com',
              prefixIcon: const Icon(Icons.mail_outline_rounded),
              border: const OutlineInputBorder(),
              errorText: _emailError,
            ),
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 16),
        ],

        // Password field
        if (widget.mode != 'forgot-password') ...[
          TextFormField(
            controller: _passwordController,
            decoration: InputDecoration(
              labelText: widget.mode == 'reset-password' ? 'Mật khẩu mới' : 'Mật khẩu',
              hintText: widget.mode == 'register' 
                  ? 'Tạo mật khẩu (tối thiểu 6 ký tự)'
                  : 'Nhập mật khẩu',
              prefixIcon: const Icon(Icons.lock_outline_rounded),
              suffixIcon: IconButton(
                onPressed: () {
                  setState(() {
                    _showPassword = !_showPassword;
                  });
                },
                icon: Icon(_showPassword 
                    ? Icons.visibility_off_rounded 
                    : Icons.visibility_rounded),
              ),
              border: const OutlineInputBorder(),
              errorText: _passwordError,
            ),
            obscureText: !_showPassword,
            textInputAction: widget.mode == 'register' 
                ? TextInputAction.next 
                : TextInputAction.done,
          ),
          const SizedBox(height: 16),
        ],

        // Confirm password field for register/reset
        if (widget.mode == 'register' || widget.mode == 'reset-password') ...[
          TextFormField(
            controller: _confirmPasswordController,
            decoration: const InputDecoration(
              labelText: 'Xác nhận mật khẩu',
              hintText: 'Nhập lại mật khẩu',
              prefixIcon: Icon(Icons.lock_outline_rounded),
              border: OutlineInputBorder(),
            ),
            obscureText: !_showPassword,
            textInputAction: TextInputAction.done,
          ),
          const SizedBox(height: 24),
        ] else ...[
          const SizedBox(height: 8),
        ],

        // Submit button
        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleSubmit,
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 2,
            ),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Text(
                    _getSubmitButtonText(),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  String _getSubmitButtonText() {
    switch (widget.mode) {
      case 'register':
        return _activeTab == 'phone' ? 'Đăng ký với SĐT' : 'Đăng ký với Email';
      case 'forgot-password':
        return 'Gửi email khôi phục';
      case 'reset-password':
        return 'Cập nhật mật khẩu';
      default:
        return _activeTab == 'phone' ? 'Đăng nhập với SĐT' : 'Đăng nhập với Email';
    }
  }

  Widget _buildFooterLinks() {
    return Column(
      children: [
        if (widget.mode == 'login') ...[
          TextButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const PasswordResetScreen(),
                ),
              );
            },
            child: const Text('Quên mật khẩu?'),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Chưa có tài khoản? '),
              TextButton(
                onPressed: () => context.go('/auth/register'),
                child: const Text(
                  'Đăng ký ngay',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ] else if (widget.mode == 'register') ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Đã có tài khoản? '),
              TextButton(
                onPressed: () => context.go('/auth/login'),
                child: const Text(
                  'Đăng nhập',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ] else ...[
          TextButton(
            onPressed: () => context.go('/auth/login'),
            child: const Text('← Về trang đăng nhập'),
          ),
        ],
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => context.go('/'),
          child: Text(
            '← Về trang chủ',
            style: TextStyle(color: Colors.grey[600]),
          ),
        ),
      ],
    );
  }

  Widget _buildEmailSentScreen() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Scaffold(
        backgroundColor: const Color(0xFF121212),
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF2196F3),
                Color(0xFF121212),
                Color(0xFF9C27B0),
              ],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(40),
                    ),
                    child: const Icon(
                      Icons.mail_outline_rounded,
                      size: 40,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Email đã được gửi!',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => context.go('/auth/login'),
                      child: const Text('Về trang đăng nhập'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _emailSent = false;
                      });
                    },
                    child: const Text(
                      'Gửi lại email',
                      style: TextStyle(color: Colors.white70),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Show email sent screen for forgot password
    if (widget.mode == 'forgot-password' && _emailSent) {
      return _buildEmailSentScreen();
    }

    return FadeTransition(
      opacity: _fadeAnimation,
      child: Scaffold(
        backgroundColor: const Color(0xFF121212),
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF2196F3),
                Color(0xFF121212),
                Color(0xFF9C27B0),
              ],
            ),
          ),
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  const SizedBox(height: 40),
                  // App Icon and Title
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2196F3), Color(0xFF9C27B0)],
                      ),
                      borderRadius: BorderRadius.circular(40),
                    ),
                    child: Icon(
                      _pageIcon,
                      size: 40,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    _pageTitle,
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'SABO ARENA - Cộng đồng Billiards #1 Việt Nam',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white70,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),
                  
                  // Auth Form Card
                  Card(
                    elevation: 8,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        children: [
                          _buildSocialButtons(),
                          _buildAuthTabs(),
                          _buildAuthForm(),
                          const SizedBox(height: 24),
                          _buildFooterLinks(),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
