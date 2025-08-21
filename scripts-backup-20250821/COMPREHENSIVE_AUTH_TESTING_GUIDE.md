# 🧪 Auth System Testing Guide

## Phase 1: Core Functionality Testing

### 1. Registration Flow Testing

#### Email Registration
```bash
# Test cases to verify
✅ Valid email registration
✅ Duplicate email handling
✅ Email verification flow
✅ Verification email resend with countdown
✅ Invalid email format handling
✅ Weak password rejection
```

#### Phone Registration with OTP
```bash
# Test cases to verify
✅ Valid phone number registration
✅ OTP generation and SMS delivery
✅ OTP verification (correct/incorrect)
✅ OTP resend functionality with 60s countdown
✅ OTP expiration handling
✅ Invalid phone number format
✅ International phone number support
```

#### OAuth Registration
```bash
# Test cases to verify
✅ Google OAuth flow
✅ Facebook OAuth flow
✅ OAuth error handling
✅ Account linking with existing email
✅ OAuth callback processing
```

### 2. Login Flow Testing

#### Email Login
```bash
# Test scenarios
✅ Valid credentials login
✅ Invalid email/password combinations
✅ Unverified email account login
✅ Account lockout after failed attempts
✅ "Remember me" functionality
```

#### Phone OTP Login
```bash
# Test scenarios
✅ Request OTP for existing phone
✅ Request OTP for non-existing phone
✅ Verify OTP (correct/incorrect codes)
✅ OTP resend with countdown
✅ Multiple OTP attempts handling
```

#### OAuth Login
```bash
# Test scenarios
✅ Existing account OAuth login
✅ New account creation via OAuth
✅ OAuth permission revocation handling
✅ Cross-platform OAuth consistency
```

### 3. Session Management Testing

```bash
# Test scenarios
✅ Session persistence across browser tabs
✅ Session expiration and auto-refresh
✅ Logout functionality
✅ Global logout (all devices)
✅ Session recovery after network issues
✅ Concurrent session handling
```

### 4. Error Handling Testing

```bash
# Network scenarios
✅ Offline authentication attempts
✅ Slow network responses
✅ Server timeouts
✅ API rate limiting

# Error recovery
✅ Automatic retry mechanisms
✅ Error message localization
✅ User-friendly error displays
✅ Recovery action suggestions
```

## Phase 2: Enhanced Features Testing

### 1. Smart Redirect Testing

```bash
# Redirect scenarios
✅ Post-login intended path navigation
✅ Deep link preservation
✅ Role-based redirect logic
✅ Fallback redirect handling
✅ Cross-origin redirect security
```

### 2. Route Protection Testing

```bash
# Access control scenarios
✅ Public route access (unauthenticated)
✅ Protected route blocking (unauthenticated)
✅ Role-based route access (user/admin/club-owner)
✅ Permission elevation scenarios
✅ Route protection bypass attempts
```

### 3. Progress Indicators Testing

```bash
# UX flow scenarios
✅ Registration progress display
✅ Multi-step form navigation
✅ Loading state accuracy
✅ Progress persistence across refreshes
✅ Mobile progress indicator behavior
```

### 4. Toast Notifications Testing

```bash
# Notification scenarios
✅ Success message timing and content
✅ Error message clarity and actions
✅ Multiple notification handling
✅ Notification dismissal behavior
✅ Accessibility compliance
```

## Phase 3: Mobile & Responsive Testing

### 1. Mobile Layout Testing

```bash
# Mobile-specific scenarios
✅ Touch-optimized form inputs
✅ Virtual keyboard handling
✅ Safe area compliance (iOS)
✅ Android back button behavior
✅ Orientation change handling
```

### 2. Cross-Device Testing

```bash
# Device compatibility
✅ iOS Safari authentication
✅ Android Chrome authentication
✅ Mobile OAuth redirects
✅ Mobile OTP input experience
✅ Responsive design breakpoints
```

### 3. Accessibility Testing

```bash
# Accessibility scenarios
✅ Screen reader compatibility
✅ Keyboard navigation
✅ Focus management
✅ Color contrast compliance
✅ ARIA labels and roles
```

## Testing Automation Scripts

### 1. E2E Test Setup

```typescript
// e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Auth Flow Tests', () => {
  test('Complete email registration flow', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="register-button"]');
    
    // Check verification message
    await expect(page.locator('[data-testid="verification-message"]')).toBeVisible();
    
    // Test resend functionality
    await page.click('[data-testid="resend-button"]');
    await expect(page.locator('[data-testid="countdown-timer"]')).toBeVisible();
  });

  test('Phone OTP registration flow', async ({ page }) => {
    await page.goto('/register');
    
    // Switch to phone registration
    await page.click('[data-testid="phone-tab"]');
    await page.fill('[data-testid="phone-input"]', '+84987654321');
    await page.click('[data-testid="send-otp-button"]');
    
    // Verify OTP dialog appears
    await expect(page.locator('[data-testid="otp-dialog"]')).toBeVisible();
    
    // Test countdown timer
    await expect(page.locator('[data-testid="resend-countdown"]')).toContainText('59');
  });

  test('OAuth login flow', async ({ page }) => {
    await page.goto('/login');
    
    // Test Google OAuth
    await page.click('[data-testid="google-login-button"]');
    
    // Mock OAuth success (in real test, would interact with OAuth provider)
    await page.route('**/auth/callback*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### 2. Unit Test Examples

```typescript
// src/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from './useAuth';

describe('useAuth Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  test('handles email registration', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      const response = await result.current.signUp('test@example.com', 'password123');
      expect(response.error).toBeNull();
    });
  });

  test('handles authentication errors', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      const response = await result.current.signIn('invalid@email.com', 'wrongpass');
      expect(response.error).toBeDefined();
      expect(result.current.error).toContain('không đúng');
    });
  });

  test('manages session state correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.loading).toBe(true);
    expect(result.current.isInitialized).toBe(false);
    
    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.isInitialized).toBe(true);
  });
});
```

### 3. Component Testing

```typescript
// src/components/auth/PhoneOtpDialog.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhoneOtpDialog } from './PhoneOtpDialog';

describe('PhoneOtpDialog', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    phone: '+84987654321',
    onVerify: jest.fn(),
    onResend: jest.fn(),
  };

  test('renders OTP input fields', () => {
    render(<PhoneOtpDialog {...mockProps} />);
    
    const otpInputs = screen.getAllByRole('textbox');
    expect(otpInputs).toHaveLength(6);
  });

  test('handles OTP input and verification', async () => {
    render(<PhoneOtpDialog {...mockProps} />);
    
    const otpInputs = screen.getAllByRole('textbox');
    
    // Fill OTP
    otpInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1).toString() } });
    });

    const verifyButton = screen.getByRole('button', { name: /xác thực/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockProps.onVerify).toHaveBeenCalledWith('123456');
    });
  });

  test('shows countdown timer for resend', async () => {
    render(<PhoneOtpDialog {...mockProps} />);
    
    const resendButton = screen.getByRole('button', { name: /gửi lại/i });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText(/59/)).toBeInTheDocument();
    });

    expect(mockProps.onResend).toHaveBeenCalled();
  });
});
```

## Performance Testing

### 1. Load Testing Scenarios

```bash
# Authentication load testing
✅ Concurrent login attempts (100+ users)
✅ OTP generation under load
✅ OAuth callback processing
✅ Session refresh performance
✅ Database query optimization
```

### 2. Mobile Performance

```bash
# Mobile-specific performance
✅ Auth page load times (< 2s)
✅ OTP input responsiveness
✅ Touch interaction latency
✅ Memory usage optimization
✅ Battery impact assessment
```

## Security Testing

### 1. Security Scenarios

```bash
# Security test cases
✅ SQL injection attempts in auth forms
✅ XSS prevention in user inputs
✅ CSRF token validation
✅ Rate limiting effectiveness
✅ Session hijacking prevention
✅ OAuth state parameter validation
```

### 2. Data Protection

```bash
# Privacy and data protection
✅ Password encryption verification
✅ PII data handling compliance
✅ Cookie security settings
✅ HTTPS enforcement
✅ Data retention policies
```

## Testing Checklist

### Pre-Production Testing

- [ ] All registration methods working
- [ ] All login methods working
- [ ] Session management stable
- [ ] Error handling comprehensive
- [ ] Mobile experience optimized
- [ ] Accessibility compliant
- [ ] Performance benchmarks met
- [ ] Security vulnerabilities addressed

### Production Monitoring

- [ ] Authentication success rates
- [ ] Error frequency tracking
- [ ] Performance metrics
- [ ] User experience feedback
- [ ] Security incident monitoring

## Test Data Management

### Test Accounts
```bash
# Email test accounts
test-user-1@example.com
test-user-2@example.com
admin-test@example.com

# Phone test numbers
+84987654321 (primary)
+84987654322 (secondary)
+84987654323 (admin)

# OAuth test accounts
google-test@gmail.com
facebook-test@fb.com
```

### Environment Setup
```bash
# Development testing
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_ANON_KEY=dev_anon_key

# Staging testing
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_ANON_KEY=staging_anon_key

# Production testing (limited)
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=prod_anon_key
```

---

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Component tests
npm run test:components

# Performance tests
npm run test:performance

# Security tests
npm run test:security

# Full test suite
npm run test:all
```
