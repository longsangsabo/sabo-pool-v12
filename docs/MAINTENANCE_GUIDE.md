# 🛠️ HƯỚNG DẪN BẢO TRÌ & VẬN HÀNH HỆ THỐNG

## 📊 1. MONITORING & HEALTH CHECKS

### Daily Health Check Script
```bash
#!/bin/bash
# File: /scripts/daily-health-check.sh

echo "🏥 SABO POOL ARENA - DAILY HEALTH CHECK"
echo "======================================"

# 1. Check Service Layer
echo "🔍 Checking Service Layer..."
node -e "
const { userService } = require('./src/services/userService');
const { tournamentService } = require('./src/services/tournamentService');

async function healthCheck() {
  try {
    // Test user service
    const userConnection = await userService.checkConnection();
    console.log('👤 User Service:', userConnection.success ? '✅ OK' : '❌ FAILED');
    
    // Test tournament service
    const tournaments = await tournamentService.getTournaments({ limit: 1 });
    console.log('🏆 Tournament Service:', tournaments.success ? '✅ OK' : '❌ FAILED');
    
    console.log('🎯 Service Layer: ✅ HEALTHY');
  } catch (error) {
    console.error('❌ Service Layer Error:', error.message);
    process.exit(1);
  }
}

healthCheck();
"

# 2. Check Database Performance
echo "📊 Checking Database Performance..."
echo "🔍 Slow queries (>1s):"
# Add query to check pg_stat_statements for slow queries

# 3. Check Error Rates
echo "📈 Error Rate Analysis:"
grep -c "ERROR" /var/log/app.log | tail -10

# 4. Check Active Users
echo "👥 Active Users (last 24h):"
# Query to count active users

echo "🎉 Health Check Complete!"
```

### Service Monitoring Functions
```typescript
// File: /utils/serviceMonitor.ts
export class ServiceMonitor {
  static async checkAllServices(): Promise<ServiceHealthReport> {
    const services = [
      'userService',
      'tournamentService', 
      'clubService',
      'challengeService',
      'notificationService'
    ];

    const results = await Promise.allSettled(
      services.map(async (serviceName) => {
        const service = await import(`../services/${serviceName}`);
        const startTime = Date.now();
        
        try {
          // Test basic functionality
          await service.healthCheck?.() || service.checkConnection?.();
          const responseTime = Date.now() - startTime;
          
          return {
            service: serviceName,
            status: 'healthy',
            responseTime,
            lastChecked: new Date().toISOString()
          };
        } catch (error) {
          return {
            service: serviceName,
            status: 'unhealthy',
            error: error.message,
            responseTime: Date.now() - startTime,
            lastChecked: new Date().toISOString()
          };
        }
      })
    );

    return {
      overall: results.every(r => r.status === 'fulfilled' && r.value.status === 'healthy'),
      services: results.map(r => r.status === 'fulfilled' ? r.value : r.reason),
      checkedAt: new Date().toISOString()
    };
  }

  static async generateHealthReport(): Promise<string> {
    const report = await this.checkAllServices();
    
    let output = '🏥 SERVICE HEALTH REPORT\n';
    output += '========================\n\n';
    output += `Overall Status: ${report.overall ? '✅ HEALTHY' : '❌ UNHEALTHY'}\n`;
    output += `Checked At: ${report.checkedAt}\n\n`;
    
    report.services.forEach(service => {
      output += `${service.status === 'healthy' ? '✅' : '❌'} ${service.service}\n`;
      output += `   Response Time: ${service.responseTime}ms\n`;
      if (service.error) {
        output += `   Error: ${service.error}\n`;
      }
      output += '\n';
    });

    return output;
  }
}
```

## 🔧 2. TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### Issue 1: Service Import Errors
```bash
# Problem: Cannot import service
# Error: Module not found

# Solution:
echo "🔍 Checking service imports..."
find src/services -name "*.ts" -exec echo "Checking {}" \; -exec node -c {} \;

# Fix common import issues:
# 1. Check file exists
# 2. Check export syntax
# 3. Check circular dependencies
```

#### Issue 2: Database Connection Issues  
```typescript
// File: /utils/dbTroubleshoot.ts
export const troubleshootDatabase = async () => {
  console.log('🔍 Database Troubleshooting...');
  
  // Test 1: Basic connection
  try {
    const result = await userService.checkConnection();
    console.log('📡 Connection:', result.success ? '✅' : '❌');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }

  // Test 2: Permission check
  try {
    const result = await userService.checkPermissions();
    console.log('🔐 Permissions:', result.success ? '✅' : '❌');
  } catch (error) {
    console.error('❌ Permission check failed:', error.message);
  }

  // Test 3: Performance check
  const startTime = Date.now();
  try {
    await tournamentService.getTournaments({ limit: 1 });
    const queryTime = Date.now() - startTime;
    console.log(`⚡ Query Performance: ${queryTime}ms`);
    
    if (queryTime > 1000) {
      console.warn('⚠️ Slow query detected - consider optimization');
    }
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  }
};
```

#### Issue 3: Service Logic Errors
```typescript
// File: /utils/serviceDebugger.ts
export const debugService = async (serviceName: string, method: string, params: any[]) => {
  console.log(`🐛 Debugging ${serviceName}.${method}()`);
  
  try {
    const service = await import(`../services/${serviceName}`);
    const startTime = Date.now();
    
    console.log('📥 Input params:', JSON.stringify(params, null, 2));
    
    const result = await service[method](...params);
    
    console.log('📤 Result:', JSON.stringify(result, null, 2));
    console.log(`⏱️ Execution time: ${Date.now() - startTime}ms`);
    
    return result;
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('📍 Stack trace:', error.stack);
    throw error;
  }
};

// Usage example:
// await debugService('tournamentService', 'createTournament', [formData, userId]);
```

## 🔄 3. MAINTENANCE TASKS

### Weekly Maintenance Script
```bash
#!/bin/bash
# File: /scripts/weekly-maintenance.sh

echo "🧹 WEEKLY MAINTENANCE - SABO POOL ARENA"
echo "======================================="

# 1. Clean up old logs
echo "📝 Cleaning up old logs..."
find /var/log -name "*.log" -mtime +30 -delete
echo "✅ Log cleanup complete"

# 2. Update service dependencies
echo "📦 Checking service dependencies..."
npm audit --audit-level=high
echo "✅ Dependency check complete"

# 3. Database maintenance
echo "🗄️ Database maintenance..."
# Run VACUUM and ANALYZE on key tables
psql $DATABASE_URL -c "VACUUM ANALYZE tournaments;"
psql $DATABASE_URL -c "VACUUM ANALYZE tournament_matches;"
psql $DATABASE_URL -c "VACUUM ANALYZE profiles;"
echo "✅ Database maintenance complete"

# 4. Performance metrics
echo "📊 Generating performance report..."
node scripts/generate-performance-report.js
echo "✅ Performance report generated"

# 5. Service health check
echo "🏥 Running comprehensive health check..."
npm run health-check
echo "✅ Health check complete"

echo "🎉 Weekly maintenance completed successfully!"
```

### Service Updates & Patches
```typescript
// File: /scripts/service-updater.ts
export class ServiceUpdater {
  static async updateService(serviceName: string, newVersion: string) {
    console.log(`🔄 Updating ${serviceName} to version ${newVersion}`);
    
    try {
      // 1. Backup current service
      await this.backupService(serviceName);
      
      // 2. Test new service in staging
      await this.testServiceInStaging(serviceName, newVersion);
      
      // 3. Gradual rollout
      await this.gradualRollout(serviceName, newVersion);
      
      // 4. Monitor for issues
      await this.monitorRollout(serviceName);
      
      console.log(`✅ ${serviceName} updated successfully`);
    } catch (error) {
      console.error(`❌ Failed to update ${serviceName}:`, error);
      await this.rollbackService(serviceName);
    }
  }

  static async backupService(serviceName: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `./backups/${serviceName}-${timestamp}.ts`;
    
    // Copy current service file
    await fs.copyFile(`./src/services/${serviceName}.ts`, backupPath);
    console.log(`💾 Backup created: ${backupPath}`);
  }

  static async rollbackService(serviceName: string) {
    console.log(`🔙 Rolling back ${serviceName}...`);
    
    // Find latest backup
    const backups = await fs.readdir('./backups');
    const latestBackup = backups
      .filter(f => f.startsWith(serviceName))
      .sort()
      .pop();
    
    if (latestBackup) {
      await fs.copyFile(`./backups/${latestBackup}`, `./src/services/${serviceName}.ts`);
      console.log(`✅ Rollback completed using ${latestBackup}`);
    }
  }
}
```

## 📈 4. PERFORMANCE OPTIMIZATION

### Service Performance Monitoring
```typescript
// File: /utils/performanceMonitor.ts
export class PerformanceMonitor {
  private static metrics: Map<string, ServiceMetrics> = new Map();

  static startTimer(operationId: string): string {
    const id = `${operationId}-${Date.now()}`;
    this.metrics.set(id, {
      startTime: performance.now(),
      operation: operationId
    });
    return id;
  }

  static endTimer(timerId: string): number {
    const metric = this.metrics.get(timerId);
    if (!metric) return 0;

    const duration = performance.now() - metric.startTime;
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${metric.operation} took ${duration.toFixed(2)}ms`);
    }

    this.metrics.delete(timerId);
    return duration;
  }

  static async profileService<T>(
    operation: string, 
    serviceMethod: () => Promise<T>
  ): Promise<T> {
    const timerId = this.startTimer(operation);
    
    try {
      const result = await serviceMethod();
      const duration = this.endTimer(timerId);
      
      console.log(`⚡ ${operation}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      this.endTimer(timerId);
      throw error;
    }
  }
}

// Usage in services:
export const createTournament = async (data: TournamentData) => {
  return PerformanceMonitor.profileService(
    'tournamentService.createTournament',
    () => tournamentApiService.createTournament(data)
  );
};
```

### Cache Management
```typescript
// File: /utils/cacheManager.ts
export class CacheManager {
  private static cache: Map<string, CacheEntry> = new Map();
  private static readonly TTL = 5 * 60 * 1000; // 5 minutes

  static set(key: string, value: any, ttl: number = this.TTL): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  static invalidate(pattern: string): void {
    for (const [key] of this.cache.entries()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  static getStats(): CacheStats {
    const total = this.cache.size;
    const expired = Array.from(this.cache.values())
      .filter(entry => Date.now() > entry.expires).length;
    
    return {
      total,
      active: total - expired,
      expired,
      hitRate: this.calculateHitRate()
    };
  }

  static clearExpired(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}
```

## 🚨 5. ALERT SYSTEM

### Error Detection & Notification
```typescript
// File: /utils/alertSystem.ts
export class AlertSystem {
  static async checkSystemHealth(): Promise<void> {
    const healthReport = await ServiceMonitor.checkAllServices();
    
    if (!healthReport.overall) {
      await this.sendAlert('SYSTEM_UNHEALTHY', {
        message: 'One or more services are unhealthy',
        services: healthReport.services.filter(s => s.status === 'unhealthy'),
        timestamp: new Date().toISOString()
      });
    }

    // Check performance metrics
    const perfMetrics = PerformanceMonitor.getMetrics();
    if (perfMetrics.averageResponseTime > 2000) {
      await this.sendAlert('PERFORMANCE_DEGRADED', {
        message: 'System performance is degraded',
        averageResponseTime: perfMetrics.averageResponseTime,
        timestamp: new Date().toISOString()
      });
    }
  }

  static async sendAlert(type: AlertType, data: AlertData): Promise<void> {
    console.error(`🚨 ALERT [${type}]:`, data);
    
    // Send to monitoring service
    // await fetch('/api/alerts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type, data })
    // });
    
    // Send notification to admin
    await notificationService.sendAdminNotification({
      title: `System Alert: ${type}`,
      message: data.message,
      priority: 'high',
      data
    });
  }
}

// Run health checks every 5 minutes
setInterval(() => {
  AlertSystem.checkSystemHealth();
}, 5 * 60 * 1000);
```

## 📚 6. DOCUMENTATION MAINTENANCE

### Auto-Generate Service Documentation
```typescript
// File: /scripts/generate-docs.ts
export const generateServiceDocs = async () => {
  console.log('📚 Generating service documentation...');
  
  const servicesDir = './src/services';
  const docsDir = './docs/services';
  
  const serviceFiles = await fs.readdir(servicesDir);
  
  for (const file of serviceFiles) {
    if (file.endsWith('.ts')) {
      const serviceName = file.replace('.ts', '');
      const serviceCode = await fs.readFile(`${servicesDir}/${file}`, 'utf8');
      
      // Extract methods and their documentation
      const methods = this.extractMethods(serviceCode);
      
      // Generate markdown documentation
      const documentation = this.generateMarkdown(serviceName, methods);
      
      await fs.writeFile(`${docsDir}/${serviceName}.md`, documentation);
      console.log(`✅ Generated docs for ${serviceName}`);
    }
  }
  
  console.log('📚 Documentation generation complete!');
};
```

## 🎯 TÓM TẮT MAINTENANCE WORKFLOW:

```
DAILY:
├── Health checks (automated)
├── Error log review  
├── Performance monitoring
└── Alert system monitoring

WEEKLY:
├── Full system health audit
├── Database maintenance
├── Dependency updates
├── Performance report
└── Cache cleanup

MONTHLY:
├── Service updates/patches
├── Security audit
├── Documentation review
├── Backup verification
└── Capacity planning
```
