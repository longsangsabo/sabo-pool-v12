# 🧪 TESTING & VALIDATION STRATEGY

## 1. SERVICE LAYER TESTING

### Unit Tests Example
```typescript
// File: /tests/services/tournamentService.test.ts
import { TournamentService } from '../../src/services/tournamentService';
import { mockSupabaseClient } from '../mocks/supabase';

describe('TournamentService', () => {
  let tournamentService: TournamentService;
  
  beforeEach(() => {
    tournamentService = new TournamentService(mockSupabaseClient);
  });

  describe('createTournament', () => {
    it('should create tournament with valid data', async () => {
      // Arrange
      const tournamentData = {
        name: 'Test Tournament',
        max_participants: 16,
        entry_fee: 50000,
        tournament_start: '2025-09-01T10:00:00Z'
      };
      const userId = 'user-123';

      // Mock database response
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'tournament-123', ...tournamentData },
              error: null
            })
          })
        })
      });

      // Act
      const result = await tournamentService.createTournament(tournamentData, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.tournament.name).toBe('Test Tournament');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tournaments');
    });

    it('should return error for invalid data', async () => {
      // Arrange
      const invalidData = {
        name: '', // Invalid: empty name
        max_participants: 0, // Invalid: zero participants
        entry_fee: -100 // Invalid: negative fee
      };

      // Act
      const result = await tournamentService.createTournament(invalidData, 'user-123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });
  });

  describe('registerForTournament', () => {
    it('should register user successfully', async () => {
      // Arrange
      const tournamentId = 'tournament-123';
      const userId = 'user-456';

      // Mock tournament data
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'tournaments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: tournamentId,
                    status: 'registration_open',
                    current_participants: 5,
                    max_participants: 16
                  },
                  error: null
                })
              })
            })
          };
        }
        // Mock registration insert
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'reg-123', tournament_id: tournamentId, user_id: userId },
                error: null
              })
            })
          })
        };
      });

      // Act
      const result = await tournamentService.registerForTournament(tournamentId, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.tournament_id).toBe(tournamentId);
    });
  });
});
```

### Integration Tests
```typescript
// File: /tests/integration/tournamentFlow.test.ts
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/testSetup';
import { TournamentService } from '../../src/services/tournamentService';
import { UserService } from '../../src/services/userService';

describe('Tournament Integration Flow', () => {
  let tournamentService: TournamentService;
  let userService: UserService;
  let testUser: any;

  beforeAll(async () => {
    await setupTestDatabase();
    tournamentService = new TournamentService(testSupabaseClient);
    userService = new UserService(testSupabaseClient);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await userService.createTestUser({
      email: 'test@example.com',
      password: 'test123'
    });
  });

  it('should handle complete tournament lifecycle', async () => {
    // 1. Create tournament
    const createResult = await tournamentService.createTournament({
      name: 'Integration Test Tournament',
      max_participants: 8,
      entry_fee: 50000,
      tournament_start: '2025-09-01T10:00:00Z'
    }, testUser.id);

    expect(createResult.success).toBe(true);
    const tournamentId = createResult.data.tournament.id;

    // 2. Register multiple users
    const users = await Promise.all([
      userService.createTestUser({ email: 'user1@test.com' }),
      userService.createTestUser({ email: 'user2@test.com' }),
      userService.createTestUser({ email: 'user3@test.com' }),
      userService.createTestUser({ email: 'user4@test.com' })
    ]);

    for (const user of users) {
      const regResult = await tournamentService.registerForTournament(tournamentId, user.id);
      expect(regResult.success).toBe(true);
    }

    // 3. Initialize bracket
    const bracketResult = await tournamentService.initializeTournamentBracket(
      tournamentId,
      users.map(u => u.id)
    );
    expect(bracketResult.success).toBe(true);

    // 4. Simulate matches
    const matches = await tournamentService.getTournamentMatches(tournamentId);
    expect(matches.success).toBe(true);
    expect(matches.data.length).toBeGreaterThan(0);

    // 5. Complete tournament
    const completeResult = await tournamentService.completeTournament(tournamentId);
    expect(completeResult.success).toBe(true);
  });
});
```

## 2. API TESTING

### API Endpoint Tests
```typescript
// File: /tests/api/tournaments.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { createAuthToken } from '../helpers/auth';

describe('Tournament API Endpoints', () => {
  let authToken: string;

  beforeEach(async () => {
    authToken = await createAuthToken({ userId: 'test-user' });
  });

  describe('POST /api/tournaments', () => {
    it('should create tournament successfully', async () => {
      const tournamentData = {
        name: 'API Test Tournament',
        max_participants: 16,
        entry_fee: 50000,
        tournament_start: '2025-09-01T10:00:00Z'
      };

      const response = await request(app)
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tournamentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tournament.name).toBe('API Test Tournament');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid
        max_participants: 0 // Invalid
      };

      const response = await request(app)
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should return 401 for unauthorized access', async () => {
      await request(app)
        .post('/api/tournaments')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('GET /api/tournaments/:id', () => {
    it('should get tournament by ID', async () => {
      // First create a tournament
      const createResponse = await request(app)
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Tournament',
          max_participants: 16,
          entry_fee: 50000
        });

      const tournamentId = createResponse.body.data.tournament.id;

      // Then get it
      const response = await request(app)
        .get(`/api/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(tournamentId);
    });
  });
});
```

## 3. E2E TESTING

### Playwright E2E Tests
```typescript
// File: /e2e/tournament-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Tournament Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'test123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create tournament successfully', async ({ page }) => {
    // Navigate to tournament creation
    await page.goto('/tournaments/create');
    await expect(page).toHaveURL('/tournaments/create');

    // Fill tournament form
    await page.fill('[data-testid="tournament-name"]', 'E2E Test Tournament');
    await page.selectOption('[data-testid="max-participants"]', '16');
    await page.fill('[data-testid="entry-fee"]', '50000');
    await page.fill('[data-testid="tournament-start"]', '2025-09-01T10:00');
    await page.fill('[data-testid="venue-address"]', 'Test Venue Address');

    // Submit form
    await page.click('[data-testid="create-tournament-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL(/\/tournaments\/[a-zA-Z0-9-]+/);

    // Verify tournament details are displayed
    await expect(page.locator('h1')).toContainText('E2E Test Tournament');
    await expect(page.locator('[data-testid="max-participants"]')).toContainText('16');
    await expect(page.locator('[data-testid="entry-fee"]')).toContainText('50,000');
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.goto('/tournaments/create');

    // Try to submit empty form
    await page.click('[data-testid="create-tournament-button"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Tournament name is required');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('/api/tournaments', route => route.abort());

    await page.goto('/tournaments/create');
    
    // Fill valid data
    await page.fill('[data-testid="tournament-name"]', 'Network Test Tournament');
    await page.selectOption('[data-testid="max-participants"]', '16');
    await page.fill('[data-testid="entry-fee"]', '50000');

    // Submit form
    await page.click('[data-testid="create-tournament-button"]');

    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
  });
});
```

## 4. PERFORMANCE TESTING

### Load Testing with Artillery
```yaml
# File: /tests/performance/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Normal load"
    - duration: 60
      arrivalRate: 20
      name: "Peak load"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Tournament Creation Flow"
    weight: 40
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "test123"
          capture:
            - json: "$.token"
              as: "authToken"
      - post:
          url: "/api/tournaments"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            name: "Load Test Tournament {{ $randomString() }}"
            max_participants: 16
            entry_fee: 50000
            tournament_start: "2025-09-01T10:00:00Z"

  - name: "Tournament List Viewing"
    weight: 60
    flow:
      - get:
          url: "/api/tournaments"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

### Performance Benchmarks
```typescript
// File: /tests/performance/benchmarks.test.ts
import { performance } from 'perf_hooks';
import { TournamentService } from '../../src/services/tournamentService';

describe('Performance Benchmarks', () => {
  let tournamentService: TournamentService;

  beforeAll(async () => {
    tournamentService = new TournamentService(testSupabaseClient);
  });

  test('tournament creation should complete within 500ms', async () => {
    const startTime = performance.now();
    
    const result = await tournamentService.createTournament({
      name: 'Performance Test Tournament',
      max_participants: 16,
      entry_fee: 50000
    }, 'test-user');
    
    const duration = performance.now() - startTime;
    
    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(500); // Should complete within 500ms
  });

  test('tournament list retrieval should complete within 200ms', async () => {
    const startTime = performance.now();
    
    const result = await tournamentService.getTournaments({ limit: 10 });
    
    const duration = performance.now() - startTime;
    
    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(200); // Should complete within 200ms
  });

  test('concurrent tournament registrations should handle 50 users', async () => {
    // Create tournament first
    const tournament = await tournamentService.createTournament({
      name: 'Concurrent Test Tournament',
      max_participants: 50,
      entry_fee: 50000
    }, 'test-user');

    const tournamentId = tournament.data.tournament.id;

    // Create 50 concurrent registrations
    const registrations = Array.from({ length: 50 }, (_, i) => 
      tournamentService.registerForTournament(tournamentId, `user-${i}`)
    );

    const startTime = performance.now();
    const results = await Promise.allSettled(registrations);
    const duration = performance.now() - startTime;

    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length;

    expect(successful).toBeGreaterThan(45); // At least 90% success rate
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
```

## 5. AUTOMATED TEST RUNNER

### CI/CD Test Pipeline
```bash
#!/bin/bash
# File: /scripts/run-all-tests.sh

echo "🧪 RUNNING COMPREHENSIVE TEST SUITE"
echo "===================================="

# 1. Lint and format check
echo "🔍 Running linting..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi

# 2. Unit tests
echo "🧪 Running unit tests..."
npm run test:unit -- --coverage
if [ $? -ne 0 ]; then
  echo "❌ Unit tests failed"
  exit 1
fi

# 3. Integration tests
echo "🔗 Running integration tests..."
npm run test:integration
if [ $? -ne 0 ]; then
  echo "❌ Integration tests failed"
  exit 1
fi

# 4. API tests
echo "🌐 Running API tests..."
npm run test:api
if [ $? -ne 0 ]; then
  echo "❌ API tests failed"
  exit 1
fi

# 5. E2E tests
echo "🎭 Running E2E tests..."
npm run test:e2e
if [ $? -ne 0 ]; then
  echo "❌ E2E tests failed"
  exit 1
fi

# 6. Performance tests
echo "⚡ Running performance tests..."
npm run test:performance
if [ $? -ne 0 ]; then
  echo "⚠️ Performance tests failed (non-blocking)"
fi

# 7. Security audit
echo "🔒 Running security audit..."
npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "⚠️ Security vulnerabilities found"
fi

echo "✅ All tests completed successfully!"
echo "📊 Generating test report..."
npm run test:report

echo "🎉 Test suite execution complete!"
```

### Test Report Generator
```typescript
// File: /scripts/generate-test-report.ts
import fs from 'fs/promises';
import path from 'path';

interface TestResults {
  unit: TestSuite;
  integration: TestSuite;
  api: TestSuite;
  e2e: TestSuite;
  performance: TestSuite;
}

export async function generateTestReport(): Promise<void> {
  console.log('📊 Generating comprehensive test report...');

  const results = await collectTestResults();
  const report = await generateHTMLReport(results);
  
  await fs.writeFile('./test-reports/index.html', report);
  console.log('✅ Test report generated: ./test-reports/index.html');
}

async function collectTestResults(): Promise<TestResults> {
  const testDirs = ['unit', 'integration', 'api', 'e2e', 'performance'];
  const results: any = {};

  for (const dir of testDirs) {
    try {
      const reportPath = `./test-results/${dir}/report.json`;
      const reportData = await fs.readFile(reportPath, 'utf8');
      results[dir] = JSON.parse(reportData);
    } catch (error) {
      console.warn(`⚠️ Could not read ${dir} test results`);
      results[dir] = { tests: 0, passed: 0, failed: 0, skipped: 0 };
    }
  }

  return results;
}

async function generateHTMLReport(results: TestResults): Promise<string> {
  const totalTests = Object.values(results).reduce((sum, suite) => sum + suite.tests, 0);
  const totalPassed = Object.values(results).reduce((sum, suite) => sum + suite.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, suite) => sum + suite.failed, 0);
  const passRate = ((totalPassed / totalTests) * 100).toFixed(2);

  return `
<!DOCTYPE html>
<html>
<head>
    <title>SABO Pool Arena - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .test-suite { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .badge { padding: 2px 8px; border-radius: 12px; color: white; font-size: 12px; }
        .badge.passed { background: green; }
        .badge.failed { background: red; }
        .badge.warning { background: orange; }
    </style>
</head>
<body>
    <h1>🧪 SABO Pool Arena - Test Report</h1>
    
    <div class="summary">
        <h2>📊 Summary</h2>
        <p><strong>Total Tests:</strong> ${totalTests}</p>
        <p><strong>Passed:</strong> <span class="passed">${totalPassed}</span></p>
        <p><strong>Failed:</strong> <span class="failed">${totalFailed}</span></p>
        <p><strong>Pass Rate:</strong> ${passRate}%</p>
        <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
    </div>

    ${Object.entries(results).map(([suiteName, suite]) => `
    <div class="test-suite">
        <h3>${suiteName.toUpperCase()} Tests 
            ${suite.failed === 0 ? 
              '<span class="badge passed">PASSED</span>' : 
              '<span class="badge failed">FAILED</span>'
            }
        </h3>
        <p>Tests: ${suite.tests} | Passed: ${suite.passed} | Failed: ${suite.failed}</p>
        <div style="background: #f0f0f0; height: 20px; border-radius: 10px;">
            <div style="background: green; height: 100%; width: ${(suite.passed/suite.tests)*100}%; border-radius: 10px;"></div>
        </div>
    </div>
    `).join('')}

    <footer style="margin-top: 40px; text-align: center; color: #666;">
        <p>Generated by SABO Pool Arena Test Suite</p>
    </footer>
</body>
</html>
  `;
}
```

## 🎯 TEST STRATEGY SUMMARY:

```
UNIT TESTS (Isolated)
├── Service methods
├── Business logic
├── Utility functions
└── Component logic

INTEGRATION TESTS (Service + DB)
├── Service interactions
├── Database operations
├── Cross-service workflows
└── Real data scenarios

API TESTS (HTTP Endpoints)
├── Request/response validation
├── Authentication/authorization
├── Error handling
├── Rate limiting

E2E TESTS (Full User Journey)
├── Complete workflows
├── UI interactions
├── Browser compatibility
└── User experience

PERFORMANCE TESTS (Load/Stress)
├── Response times
├── Concurrent users
├── Memory usage
└── Database performance
```
