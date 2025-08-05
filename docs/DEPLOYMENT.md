# 🚀 Deployment Guide

## Overview
Complete deployment guide for SABO Pool Arena application.

## Prerequisites
- Node.js 18+ installed
- Git access to repository  
- Netlify account configured
- Environment variables set

## Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Payment Integration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Admin Configuration
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

## Deployment Steps

### 1. Preparation
```bash
# Clone repository
git clone https://github.com/longsangsabo/sabo-pool-v11.git
cd sabo-pool-v11

# Install dependencies
npm install

# Build application
npm run build
```

### 2. Netlify Deployment
```bash
# Deploy to Netlify
netlify deploy --prod --dir=dist

# Verify deployment
netlify open
```

### 3. Database Migration
```bash
# Run any pending migrations
npm run db:migrate

# Seed initial data if needed
npm run db:seed
```

### 4. Post-Deployment Verification
- ✅ Check application loads correctly
- ✅ Test user authentication flow
- ✅ Verify payment integration (sandbox)
- ✅ Test admin panel access
- ✅ Validate tournament creation
- ✅ Check mobile responsiveness

## Monitoring & Health Checks

### Application Health
- Monitor response times < 2s
- Check error rates < 1%
- Verify uptime > 99.5%

### Database Performance
- Monitor query response times
- Check connection pool usage
- Verify backup schedules

## Rollback Procedures

### Emergency Rollback
```bash
# Rollback to previous deployment
netlify rollback

# Or deploy specific commit
netlify deploy --prod --dir=dist --alias=rollback-$(date +%Y%m%d)
```

### Database Rollback
```bash
# Restore from backup if needed
# (Follow Supabase backup restoration process)
```

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version and dependencies
2. **Environment Variables**: Verify all required vars are set
3. **Database Connection**: Check Supabase credentials
4. **Payment Issues**: Verify VNPAY configuration

### Support Contacts
- Technical: [Contact Information]
- Database: Supabase Support
- Hosting: Netlify Support
- Payment: VNPAY Support

---
*Last Updated: August 5, 2025*
