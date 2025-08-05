# 📊 Monitoring & Analytics Guide

## Overview
Comprehensive monitoring setup for SABO Pool Arena application performance, health, and user analytics.

## Application Monitoring

### Performance Monitoring
```javascript
// Performance tracking setup
const performanceMonitor = {
  // Core Web Vitals
  trackCoreWebVitals: true,
  
  // Custom metrics
  trackCustomMetrics: {
    tournamentCreationTime: true,
    challengeResponseTime: true,
    paymentProcessingTime: true,
    adminDashboardLoad: true
  },
  
  // Alert thresholds
  thresholds: {
    pageLoadTime: 3000, // ms
    apiResponseTime: 1000, // ms
    errorRate: 0.01, // 1%
    availability: 0.995 // 99.5%
  }
}
```

### Health Check Endpoints
```bash
# Application health
GET /api/health
# Expected: { status: "healthy", timestamp: "..." }

# Database health  
GET /api/health/database
# Expected: { status: "connected", latency: "..." }

# External services health
GET /api/health/external
# Expected: { vnpay: "connected", supabase: "connected" }
```

## Error Tracking & Logging

### Error Monitoring Setup
```javascript
// Error tracking configuration
const errorTracking = {
  // Automatic error capture
  captureUnhandledRejections: true,
  captureUnhandledExceptions: true,
  
  // User context
  includeUserContext: true,
  includeBreadcrumbs: true,
  
  // Filter sensitive data
  beforeSend: (event) => {
    // Remove sensitive information
    return sanitizeEvent(event);
  }
}
```

### Log Levels
- **ERROR**: Critical issues requiring immediate attention
- **WARN**: Potential issues that should be monitored
- **INFO**: General application flow information
- **DEBUG**: Detailed debugging information (dev only)

## Analytics & User Behavior

### User Analytics
```javascript
// Analytics tracking
const analytics = {
  // User engagement
  trackPageViews: true,
  trackUserSessions: true,
  trackFeatureUsage: true,
  
  // Business metrics
  trackTournamentCreation: true,
  trackChallengeCompletion: true,
  trackPaymentSuccess: true,
  trackUserRetention: true
}
```

### Key Metrics to Track
- **Daily Active Users (DAU)**
- **Tournament Creation Rate**
- **Challenge Completion Rate** 
- **Payment Success Rate**
- **User Retention (1d, 7d, 30d)**
- **Feature Adoption Rate**
- **Support Ticket Volume**

## Performance Dashboards

### Application Performance Dashboard
```yaml
Dashboard: Application Health
Metrics:
  - Response Time (P50, P95, P99)
  - Request Volume
  - Error Rate
  - Availability
  - Memory Usage
  - CPU Usage
  - Database Performance

Alerts:
  - Response time > 3s
  - Error rate > 1%
  - Availability < 99.5%
  - Memory usage > 80%
```

### Business Metrics Dashboard
```yaml
Dashboard: Business Intelligence
Metrics:
  - User Registration Trends
  - Tournament Activity
  - Payment Volume
  - Feature Usage
  - User Engagement
  - Retention Cohorts

Reports:
  - Daily summary
  - Weekly trends
  - Monthly business review
```

## Alerting & Notifications

### Critical Alerts (Immediate)
- Application down (< 99% availability)
- Database connection failures
- Payment system errors
- High error rates (> 5%)
- Security incidents

### Warning Alerts (Monitor)
- Slow response times (> 2s)
- High memory usage (> 70%)
- Unusual traffic patterns
- Failed background jobs
- External service degradation

### Alert Channels
```yaml
Critical:
  - SMS to on-call engineer
  - Slack #critical-alerts
  - Email to team leads

Warning:
  - Slack #monitoring
  - Email digest (hourly)

Info:
  - Dashboard updates
  - Weekly reports
```

## Infrastructure Monitoring

### Server Metrics
- **CPU Usage**: Target < 70% average
- **Memory Usage**: Target < 80% average  
- **Disk Usage**: Target < 85% capacity
- **Network I/O**: Monitor for spikes
- **Load Average**: Target < 2.0

### Database Monitoring
```sql
-- Key database metrics to monitor
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## Security Monitoring

### Security Events to Track
- Failed login attempts
- Suspicious API usage patterns
- Unauthorized access attempts
- Data export/download activities
- Admin action logs
- Payment fraud indicators

### Security Alerts
```yaml
High Priority:
  - Multiple failed login attempts
  - Unauthorized admin access
  - Data breach indicators
  - Payment fraud patterns

Medium Priority:
  - Unusual API usage
  - Geographic anomalies
  - Privilege escalation attempts
```

## Monitoring Tools Setup

### Application Monitoring
```bash
# Setup application monitoring
npm install @sentry/react @sentry/node

# Configure analytics
npm install @analytics/google-analytics

# Performance monitoring
npm install web-vitals lighthouse
```

### Infrastructure Monitoring
```yaml
# Docker monitoring setup
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    
  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
```

## Response Procedures

### Incident Response
1. **Detection**: Monitor alerts and dashboards
2. **Assessment**: Determine severity and impact
3. **Response**: Follow escalation procedures
4. **Resolution**: Fix issue and restore service
5. **Post-mortem**: Document and prevent recurrence

### On-call Procedures
```markdown
**Level 1**: Development team (business hours)
**Level 2**: Senior engineers (24/7)
**Level 3**: System administrators (24/7)
**Level 4**: External vendor support

**Response Times**:
- Critical: 15 minutes
- High: 1 hour
- Medium: 4 hours
- Low: Next business day
```

---
*Last Updated: August 5, 2025*
