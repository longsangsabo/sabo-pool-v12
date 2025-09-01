import 'package:flutter/material.dart';import 'package:flutter_riverpod/flutter_riverpod.dart';import '../../../shared/providers/auth_provider.dart';import 'register_screen.dart';import 'forgot_password_screen.dart';class LoginScreen extends ConsumerStatefulWidget {  const LoginScreen({super.key});  @override  ConsumerState<LoginScreen> createState() => _LoginScreenState();}class _LoginScreenState extends ConsumerState<LoginScreen> {  final _formKey = GlobalKey<FormState>();  final _emailController = TextEditingController();  final _passwordController = TextEditingController();  bool _isLoading = false;  bool _obscurePassword = true;  @override  void dispose() {    _emailController.dispose();    _passwordController.dispose();    super.dispose();  }  String? _validateEmail(String? value) {    if (value == null || value.isEmpty) {      return 'Email is required';    }    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');    if (!emailRegex.hasMatch(value)) {      return 'Please enter a valid email';    }    return null;  }  String? _validatePassword(String? value) {    if (value == null || value.isEmpty) {      return 'Password is required';    }    return null;  }  Future<void> _signIn() async {    if (!_formKey.currentState!.validate()) return;        setState(() => _isLoading = true);        try {      await ref.read(authControllerProvider).signIn(        email: _emailController.text.trim(),        password: _passwordController.text,      );    } catch (error) {      if (mounted) {        ScaffoldMessenger.of(context).showSnackBar(          SnackBar(            content: Text('Login failed: $error'),            backgroundColor: Colors.red,          ),        );      }    } finally {      if (mounted) {        setState(() => _isLoading = false);      }    }  }  @override  Widget build(BuildContext context) {    return Scaffold(      appBar: AppBar(        title: const Text('SABO Pool Arena'),        backgroundColor: Theme.of(context).colorScheme.inversePrimary,      ),      body: SingleChildScrollView(        padding: const EdgeInsets.all(24.0),        child: Form(          key: _formKey,          child: Column(            crossAxisAlignment: CrossAxisAlignment.stretch,            children: [              const SizedBox(height: 40),                            const Icon(                Icons.sports_tennis,                size: 100,                color: Colors.blue,              ),              const SizedBox(height: 20),                            const Text(                'Welcome Back!',                style: TextStyle(                  fontSize: 28,                  fontWeight: FontWeight.bold,                ),                textAlign: TextAlign.center,              ),              const SizedBox(height: 10),              
              const Text(
                'Sign in to continue your pool journey',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              
              // Email Field
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: _validateEmail,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 16),
              
              // Password Field
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                obscureText: _obscurePassword,
                validator: _validatePassword,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _signIn(),
              ),
              
              // Forgot Password Link
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()),
                  ),
                  child: const Text('Forgot Password?'),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Sign In Button
              SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _signIn,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
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
                    : const Text(
                        'Sign In',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Divider
              const Row(
                children: [
                  Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('or', style: TextStyle(color: Colors.grey)),
                  ),
                  Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 24),
              
              // Social Login Buttons
              OutlinedButton.icon(
                onPressed: () {
                  // TODO: Implement Google Sign In
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Google Sign In - Coming Soon!')),
                  );
                },
                icon: const Icon(Icons.g_mobiledata, color: Colors.red),
                label: const Text('Continue with Google'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
              const SizedBox(height: 12),
              
              OutlinedButton.icon(
                onPressed: () {
                  // TODO: Implement Facebook Sign In
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Facebook Sign In - Coming Soon!')),
                  );
                },
                icon: const Icon(Icons.facebook, color: Colors.blue),
                label: const Text('Continue with Facebook'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
              const SizedBox(height: 24),
              
              // Register Link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Don\'t have an account? '),
                  TextButton(
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const RegisterScreen()),
                    ),
                    child: const Text('Sign Up'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
