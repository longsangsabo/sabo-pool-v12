# 🎱 SABO ARENA - SYSTEM OVERVIEW

## 📋 What is SABO Arena?

**SABO Arena** là nền tảng quản lý giải đấu bi-da hiện đại với 5 tính năng chính:

1. **🏆 Tournament System** - Quản lý giải đấu với SABO Double Elimination
2. **⚔️ Challenge System** - Thách đấu 1v1 với hệ thống ELO
3. **📊 Ranking System** - Hệ thống xếp hạng ELO + SPA Points  
4. **💰 Payment Integration** - Thanh toán VNPay cho tournament fees
5. **📱 Real-time Updates** - Cập nhật trực tiếp kết quả và thông báo

---

## 🏗️ Architecture

```
sabo-pool-v12/
├── apps/sabo-user/     # User Platform (8080) - Tournament, Challenge, Ranking
├── apps/sabo-admin/    # Admin Interface (8081) - Management, Analytics  
├── packages/shared-*   # Shared business logic và components
└── supabase/          # Database, Auth, Real-time subscriptions
```

**Tech Stack**: React 18 + TypeScript + Supabase + VNPay + Tailwind CSS

---

## 🎯 Core Features

### 1. Tournament Management
- **SABO Double Elimination**: 3-branch tournament system (Winner/Loser A/Loser B)
- **Game Formats**: 8-Ball, 9-Ball, 10-Ball với race configurations
- **Registration**: Online registration với VNPay payment
- **Live Brackets**: Real-time tournament progression

### 2. Challenge System  
- **1v1 Challenges**: Players challenge each other at clubs
- **Bet Points**: 100-650 points với different race formats
- **Club Verification**: Mandatory verification by club managers
- **ELO Calculation**: K-factor based on bet points (12-32)

### 3. Ranking & Points
- **ELO System**: Dynamic rating system for skill assessment
- **SPA Points**: Season Performance Awards for tournaments
- **Rank Tiers**: K → K+ → I → I+ → H → H+ → G → G+ → F → F+ → E → E+
- **Leaderboards**: Club, season, và overall rankings

### 4. Payment Integration
- **VNPay Gateway**: Secure payment for tournament registration
- **Wallet System**: SPA points wallet management
- **Transaction Logs**: Complete payment history

### 5. Real-time Features
- **Live Updates**: Tournament brackets và challenge results
- **Notifications**: Real-time notifications for challenges/tournaments
- **WebSocket**: Live data synchronization

---

## 👥 User Roles

### Players
- Register for tournaments
- Create/accept challenges  
- View rankings và leaderboards
- Manage profile và wallet

### Club Managers  
- Verify challenge results
- Manage club members
- View club statistics

### Admins
- Tournament management
- User administration
- System analytics
- Content moderation

---

## 📱 Applications

### User Platform (Port 8080)
- **Target**: Mobile-first responsive design
- **Auth**: Anonymous với optional signup
- **Features**: Tournament registration, challenges, rankings, profile
- **Theme**: Light/Dark mode support

### Admin Interface (Port 8081)
- **Target**: Desktop-optimized interface
- **Auth**: Service role authentication required
- **Features**: User management, tournament admin, analytics
- **Navigation**: Comprehensive admin dashboard

---

## 🔄 Typical User Flow

1. **Registration**: User signs up/login anonymously
2. **Profile Setup**: Complete profile với rank information  
3. **Tournament**: Browse và register for tournaments với payment
4. **Challenges**: Create challenges với other players
5. **Club Play**: Play matches at registered clubs
6. **Verification**: Club managers verify results
7. **Rankings**: View updated ELO và SPA points
8. **Leaderboards**: Track performance và compare with others

---

## 🎖️ Achievement System

### Tournament Rewards (SPA Points)
| Position | K Rank | I Rank | H Rank | G Rank | F Rank | E Rank |
|----------|--------|--------|--------|--------|--------|--------|
| 🥇 Champion | 900 | 1,000 | 1,100 | 1,200 | 1,350 | 1,500 |
| 🥈 Runner-up | 700 | 800 | 850 | 900 | 1,000 | 1,100 |
| 🥉 Third | 500 | 600 | 650 | 700 | 800 | 900 |
| 📈 Participation | 100 | 100 | 100 | 100 | 110 | 120 |

### Challenge Betting
| Bet Points | Race Format | K-Factor | Duration |
|------------|-------------|----------|----------|
| 600-650 | Race 22 | 32 | ~2 hours |
| 500-550 | Race 18 | 28 | ~1.5 hours |
| 400-450 | Race 16 | 24 | ~1.5 hours |
| 300-350 | Race 14 | 20 | ~1 hour |
| 200-250 | Race 12 | 16 | ~1 hour |
| 100-150 | Race 10 | 12 | ~45 mins |

---

## 🔧 For Developers

### Quick Start
```bash
# Install dependencies
pnpm install

# Start user platform  
cd apps/sabo-user && npm run dev  # → http://localhost:8080

# Start admin interface
cd apps/sabo-admin && npm run dev  # → http://localhost:8081
```

### Key Business Logic
- **Tournament Logic**: `packages/shared-business/src/tournament/`
- **Challenge Logic**: `packages/shared-business/src/challenge/`  
- **ELO Calculation**: `packages/shared-business/src/ranking/`
- **SPA Points**: `packages/shared-business/src/spa/`
- **Payment**: `packages/shared-business/src/payment/`

### Database
- **Provider**: Supabase PostgreSQL
- **Auth**: JWT-based với Row Level Security
- **Real-time**: WebSocket subscriptions
- **Migrations**: Complete schema trong `/supabase/migrations/`

---

**Status**: ✅ Production Ready  
**Last Updated**: August 31, 2025  
**Version**: v12.0
