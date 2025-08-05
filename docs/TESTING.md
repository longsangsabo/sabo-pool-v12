# 🧪 Testing Guide

## Overview
Comprehensive testing strategy for SABO Pool Arena application.

## Testing Structure

### Test Types
1. **Unit Tests** - Individual component testing
2. **Integration Tests** - Component interaction testing
3. **E2E Tests** - Full user workflow testing
4. **Performance Tests** - Load and speed testing

## Running Tests

### Development Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Performance Testing
```bash
# Lighthouse performance audit
npm run lighthouse

# Bundle size analysis
npm run analyze

# Performance monitoring
npm run perf:monitor
```

## Test Coverage

### Critical Test Areas
- ✅ User Authentication (login/register/logout)
- ✅ Tournament Creation & Management
- ✅ Challenge System (create/accept/complete)
- ✅ Payment Integration (VNPAY)
- ✅ Admin Panel Functionality
- ✅ Real-time Features (notifications/updates)
- ✅ Mobile Responsiveness
- ✅ Data Validation & Security

### Test Scenarios

#### Authentication Flow
```javascript
describe('Authentication', () => {
  test('User can register successfully')
  test('User can login with valid credentials')
  test('User cannot login with invalid credentials')
  test('User can logout successfully')
  test('Protected routes require authentication')
})
```

#### Tournament Management
```javascript
describe('Tournaments', () => {
  test('User can create tournament')
  test('User can join tournament')
  test('Tournament brackets generate correctly')
  test('Tournament results are recorded')
  test('Admin can manage tournaments')
})
```

#### Payment Integration
```javascript
describe('Payment', () => {
  test('VNPAY integration works correctly')
  test('Payment verification succeeds')
  test('Failed payments are handled gracefully')
  test('Refund process works correctly')
})
```

## Automated Testing

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run E2E tests
        run: npm run test:e2e
```

### Quality Gates
- ✅ Test coverage > 80%
- ✅ All critical paths tested
- ✅ No failing tests
- ✅ Performance benchmarks met

## Manual Testing Checklist

### Pre-Release Testing
- [ ] User registration and login flow
- [ ] Tournament creation and management
- [ ] Challenge system functionality
- [ ] Payment integration (sandbox)
- [ ] Admin panel access and features
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Performance and load testing

### Post-Deployment Testing
- [ ] Application loads correctly in production
- [ ] All critical features work as expected
- [ ] Database connections are stable
- [ ] External integrations are functional
- [ ] Monitoring and alerting are active

## Performance Benchmarks

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Time to Interactive**: < 3s

### Load Testing
```bash
# Simulate concurrent users
npx artillery run load-test.yml

# Monitor during high traffic
npm run monitor:production
```

## Bug Reporting

### Bug Report Template
```markdown
**Bug Description**: Brief description of the issue
**Steps to Reproduce**: 
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: What should happen
**Actual Behavior**: What actually happened
**Environment**: Browser, OS, device
**Screenshots**: If applicable
**Priority**: High/Medium/Low
```

## Test Environment Setup

### Local Testing Environment
```bash
# Setup test database
npm run db:test:setup

# Run development server
npm run dev

# Run test suite
npm run test:full
```

### Staging Environment
- Mirror of production environment
- Safe testing of new features
- Integration testing with external services

---
*Last Updated: August 5, 2025*
