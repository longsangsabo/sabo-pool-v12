# 🎯 SABO POOL - BUSINESS REQUIREMENTS

## 📋 Executive Summary

SABO Pool là nền tảng quản lý giải đấu bi-da toàn diện, được thiết kế để đáp ứng nhu cầu của cộng đồng bi-da Việt Nam với các tính năng chuyên nghiệp và dễ sử dụng.

## 🎯 Business Objectives

### Primary Goals
1. **Digitalize Tournament Management**: Số hóa hoàn toàn quy trình tổ chức giải đấu
2. **Standardize Ranking System**: Thống nhất hệ thống xếp hạng toàn quốc
3. **Connect Pool Community**: Kết nối cộng đồng bi-da Việt Nam
4. **Generate Revenue**: Tạo ra nguồn thu bền vững cho nền tảng

### Success Metrics
- **User Adoption**: 10,000+ active monthly users trong năm đầu
- **Tournament Volume**: 500+ tournaments/month sau 6 tháng
- **Club Network**: 100+ verified clubs trên toàn quốc
- **Revenue Target**: $50,000 monthly recurring revenue

## 👥 Stakeholder Analysis

### Primary Stakeholders

#### 1. Pool Players (End Users)
**Needs & Pain Points:**
- 🎯 Tìm giải đấu phù hợp với trình độ
- 📊 Theo dõi tiến bộ và xếp hạng cá nhân
- 💰 Thanh toán phí tham gia tiện lợi
- 🏆 Minh bạch trong tính điểm và xếp hạng

**User Stories:**
```
As a pool player, I want to:
- Register for tournaments that match my skill level
- Track my ELO rating and tournament history
- Challenge other players for practice matches
- Receive notifications about upcoming events
- View transparent ranking calculations
```

#### 2. Club Owners (Business Users)
**Needs & Pain Points:**
- 🏢 Quản lý thành viên và sự kiện hiệu quả
- 💰 Tối ưu hóa doanh thu từ giải đấu
- 📈 Phân tích dữ liệu kinh doanh
- 🎯 Marketing và thu hút khách hàng

**User Stories:**
```
As a club owner, I want to:
- Host and manage tournaments at my venue
- Track member engagement and revenue
- Access analytics dashboard for business insights
- Manage table bookings and scheduling
- Promote my club to potential members
```

#### 3. Tournament Organizers
**Needs & Pain Points:**
- 📋 Tổ chức giải đấu chuyên nghiệp
- ⚡ Xử lý bracket và kết quả real-time
- 💸 Quản lý tiền thưởng và phí tham gia
- 📊 Báo cáo và thống kê chi tiết

**User Stories:**
```
As a tournament organizer, I want to:
- Create and configure tournament brackets
- Manage participant registration and payments
- Update match results in real-time
- Generate reports for sponsors and stakeholders
- Handle disputes and rule enforcement
```

### Secondary Stakeholders

#### 4. Sponsors & Partners
- 🎯 Exposure to target demographics
- 📊 ROI tracking and analytics
- 🎪 Brand association with tournaments

#### 5. Vietnamese Pool Federation
- 📈 Player development and ranking data
- 🏆 Official tournament recognition
- 📊 Sport analytics and insights

## 🎮 Functional Requirements

### 1. User Management System

#### 1.1 User Registration & Authentication
```typescript
interface UserRegistrationRequirements {
  personalInfo: {
    fullName: string;           // Required: Legal name
    username: string;           // Required: Unique identifier
    email: string;              // Required: Email verification
    phone: string;              // Required: SMS verification
    dateOfBirth: Date;          // Required: Age verification
    avatar?: File;              // Optional: Profile picture
  };
  
  verification: {
    emailVerification: boolean;  // Required: Email must be verified
    phoneVerification: boolean;  // Required: Phone must be verified
    identityVerification?: boolean; // Optional: For tournaments
  };
  
  preferences: {
    gameFormat: GameFormat[];    // Preferred game formats
    skillLevel: SkillLevel;      // Self-assessed skill
    location: Location;          // Primary playing location
    notifications: NotificationSettings;
  };
}
```

#### 1.2 Profile Management
- **Complete Profile**: Name, avatar, bio, playing history
- **Privacy Settings**: Visibility controls for profile information
- **Achievement System**: Badges, milestones, and accomplishments
- **Social Features**: Following, friend lists, activity feed

### 2. Tournament Management System

#### 2.1 Tournament Creation
```typescript
interface TournamentCreationRequirements {
  basicInfo: {
    name: string;                    // Required: Tournament name
    description: string;             // Required: Tournament description
    type: TournamentType;            // Required: Format type
    gameFormat: GameFormat;          // Required: 8-ball, 9-ball, etc.
    venue: Venue;                    // Required: Playing location
  };
  
  configuration: {
    maxParticipants: number;         // Required: 4-64 players
    entryFee: number;               // Required: In VND
    prizePool: number;              // Calculated: Total prizes
    prizeDistribution: PrizeStructure; // Required: How prizes split
    registrationPeriod: DateRange;   // Required: When to register
    tournamentPeriod: DateRange;     // Required: When to play
  };
  
  rules: {
    gameRules: GameRules;           // Required: Official rules
    customRules?: string;           // Optional: Additional rules
    disputeResolution: DisputePolicy; // Required: How to handle disputes
    penaltyPolicy: PenaltyPolicy;   // Required: Penalty structure
  };
  
  eligibility: {
    rankRequirement?: RankRange;     // Optional: Rank restrictions
    ageRequirement?: AgeRange;       // Optional: Age restrictions
    membershipRequired?: boolean;    // Optional: Club member only
    genderRestriction?: Gender;      // Optional: Gender specific
  };
}
```

#### 2.2 Tournament Formats

**Single Elimination**
- Standard bracket elimination
- Winner advances, loser eliminated
- Minimum 4, maximum 64 participants

**Double Elimination**
- Winners and losers brackets
- Second chance for eliminated players
- Grand final with bracket reset possibility

**SABO Format (Signature Format)**
- Custom 10-player tournament structure
- Unique advancement rules
- Optimized for club-level competition

**Round Robin**
- Everyone plays everyone
- Points-based ranking system
- Best for skill assessment

#### 2.3 Bracket Management
```typescript
interface BracketManagementRequirements {
  generation: {
    automaticSeeding: boolean;       // Auto-seed by ELO
    manualSeeding: boolean;          // Manual seed override
    randomSeeding: boolean;          // Random bracket generation
    byeHandling: ByeStrategy;        // How to handle odd numbers
  };
  
  visualization: {
    realTimeUpdates: boolean;        // Live bracket updates
    mobileOptimized: boolean;        // Mobile-friendly display
    printableFormat: boolean;        // PDF export capability
    embedCode: string;               // Embeddable widget
  };
  
  management: {
    scoreSubmission: ScoreSubmissionRules;
    advancementRules: AdvancementLogic;
    disputeHandling: DisputeResolution;
    adminOverrides: AdminControls;
  };
}
```

### 3. Player Ranking System

#### 3.1 ELO Rating System
```typescript
interface ELORatingRequirements {
  calculation: {
    startingElo: 1000;              // All players start at 1000
    kFactor: 32;                    // Standard K-factor
    minimumElo: 800;                // Floor rating
    maximumElo: 2000;               // Ceiling rating (theoretical)
  };
  
  factors: {
    opponentStrength: boolean;       // Stronger opponent = more gain
    matchImportance: boolean;        // Tournament vs casual
    recentActivity: boolean;         // Activity-based adjustments
    uncertainty: boolean;            // New player uncertainty
  };
  
  display: {
    currentRating: number;           // Current ELO
    peakRating: number;             // Highest achieved
    ratingHistory: EloHistory[];     // Rating over time
    confidence: number;              // Rating confidence level
  };
}
```

#### 3.2 Rank System
```typescript
interface RankSystemRequirements {
  ranks: [
    { code: 'K', name: 'Rookie',     eloRange: [800, 899],   color: '#8B5A00' },
    { code: 'I', name: 'Novice',     eloRange: [900, 949],   color: '#CD7F32' },
    { code: 'H', name: 'Amateur',    eloRange: [950, 999],   color: '#C0C0C0' },
    { code: 'G', name: 'Semi-Pro',   eloRange: [1000, 1049], color: '#FFD700' },
    { code: 'F', name: 'Advanced',   eloRange: [1050, 1099], color: '#32CD32' },
    { code: 'E', name: 'Expert',     eloRange: [1100, 1149], color: '#00CED1' },
    { code: 'D', name: 'Master',     eloRange: [1150, 1199], color: '#4169E1' },
    { code: 'C', name: 'Grandmaster', eloRange: [1200, 1299], color: '#8A2BE2' },
    { code: 'B', name: 'Legend',     eloRange: [1300, 1399], color: '#FF4500' },
    { code: 'A', name: 'Champion',   eloRange: [1400, 1499], color: '#DC143C' },
    { code: 'S', name: 'Legendary',  eloRange: [1500, 9999], color: '#FFD700' }
  ];
  
  promotion: {
    automatic: boolean;              // Auto-promote based on ELO
    stabilityPeriod: number;         // Days to maintain ELO
    demotionProtection: boolean;     // Prevent immediate demotion
  };
}
```

#### 3.3 SPA Points (Season Performance Awards)
```typescript
interface SPAPointsRequirements {
  earning: {
    tournamentParticipation: number; // Base points for joining
    tournamentPlacement: PlacementPoints; // Points by finish position
    challengeWins: number;           // Points for challenge victories
    activityBonus: number;           // Points for regular play
    achievementBonus: AchievementPoints; // Special achievement points
  };
  
  usage: {
    seasonalReset: boolean;          // Reset each season
    carryOver: number;               // Percentage carried over
    redemption: RedemptionOptions;   // What can be bought
    expiration: ExpirationPolicy;    // When points expire
  };
  
  rewards: {
    merchandise: MerchandiseOptions;
    privileges: PrivilegeOptions;
    tournament: TournamentRewards;
    physical: PhysicalRewards;
  };
}
```

### 4. Payment System Integration

#### 4.1 VNPAY Integration Requirements
```typescript
interface PaymentRequirements {
  supportedMethods: [
    'VNPAYQR',          // QR Code payment
    'VNBANK',           // Internet Banking
    'INTCARD',          // International cards
    'VISA',             // Visa cards
    'MASTERCARD',       // Mastercard
    'ATM'               // ATM cards
  ];
  
  transactions: {
    tournamentFees: boolean;         // Entry fee payments
    membershipFees: boolean;         // Club membership
    merchandise: boolean;            // SPA point redemption
    tips: boolean;                   // Player tips/donations
  };
  
  security: {
    encryption: 'SHA256';            // Hash algorithm
    ipnVerification: boolean;        // Instant Payment Notification
    fraudDetection: boolean;         // Fraud monitoring
    refundSupport: boolean;          // Refund capability
  };
  
  reporting: {
    transactionHistory: boolean;     // Complete transaction log
    reconciliation: boolean;         // Daily reconciliation
    taxation: boolean;               // Tax reporting
    analytics: boolean;              // Payment analytics
  };
}
```

### 5. Club Management System

#### 5.1 Club Registration
```typescript
interface ClubRegistrationRequirements {
  businessInfo: {
    clubName: string;                // Required: Official club name
    businessLicense: string;         // Required: Government license
    taxId: string;                   // Required: Tax identification
    address: Address;                // Required: Physical location
    contactInfo: ContactInfo;        // Required: Phone, email
  };
  
  facilities: {
    numberOfTables: number;          // Required: Total tables
    tableTypes: TableType[];         // Required: 8ft, 9ft, etc.
    amenities: Amenity[];           // Optional: Parking, cafe, etc.
    photos: Photo[];                // Required: Facility photos
    operatingHours: Schedule;        // Required: Open hours
  };
  
  verification: {
    documentVerification: boolean;   // Government documents
    siteInspection?: boolean;       // Physical verification
    insuranceProof: boolean;        // Liability insurance
    safetyCompliance: boolean;      // Safety standards
  };
}
```

#### 5.2 Club Features
- **Member Management**: Registration, payments, access control
- **Tournament Hosting**: Create and manage club tournaments
- **Table Booking**: Online reservation system
- **Revenue Analytics**: Financial reporting and insights
- **Staff Management**: Employee access and permissions
- **Marketing Tools**: Promotion and member acquisition

### 6. Real-time Features

#### 6.1 Live Updates
```typescript
interface RealTimeRequirements {
  tournamentUpdates: {
    bracketUpdates: boolean;         // Live bracket changes
    scoreUpdates: boolean;           // Match score updates
    playerAdvancement: boolean;      // Tournament progression
    announcements: boolean;          // Tournament announcements
  };
  
  notifications: {
    matchReminders: boolean;         // Upcoming match alerts
    challengeRequests: boolean;      // New challenge notifications
    rankingChanges: boolean;         // ELO/rank updates
    systemMessages: boolean;         // Important announcements
  };
  
  chat: {
    tournamentChat: boolean;         // Tournament discussion
    privateMessages: boolean;        // Player-to-player messaging
    clubChat: boolean;              // Club member discussions
    moderation: boolean;            // Content moderation
  };
}
```

## 🔒 Non-Functional Requirements

### 1. Performance Requirements

#### 1.1 Response Time
- **Page Load**: <3 seconds on 3G connection
- **API Response**: <500ms for standard requests
- **Real-time Updates**: <100ms latency
- **Database Queries**: <200ms for complex queries

#### 1.2 Scalability
- **Concurrent Users**: Support 1,000+ simultaneous users
- **Tournament Load**: Handle 100+ concurrent tournaments
- **Database Growth**: Scale to 1M+ user profiles
- **Storage**: Handle 100GB+ of images and documents

### 2. Security Requirements

#### 2.1 Data Protection
```typescript
interface SecurityRequirements {
  authentication: {
    multiFactorAuth: boolean;        // SMS + Email verification
    sessionManagement: boolean;      // Secure session handling
    passwordPolicy: PasswordPolicy;  // Strong password requirements
    bruteForceProtection: boolean;   // Login attempt limiting
  };
  
  dataProtection: {
    encryption: 'AES-256';           // Data encryption standard
    backupEncryption: boolean;       // Encrypted backups
    gdprCompliance: boolean;         // GDPR compliance
    dataAnonymization: boolean;      // User data anonymization
  };
  
  apiSecurity: {
    rateLimiting: boolean;           // API rate limiting
    inputValidation: boolean;        // Input sanitization
    sqlInjectionProtection: boolean; // SQL injection prevention
    xssProtection: boolean;          // XSS attack prevention
  };
}
```

#### 2.2 Financial Security
- **PCI DSS Compliance**: Payment card data security
- **Fraud Detection**: Suspicious transaction monitoring
- **Audit Trail**: Complete transaction logging
- **Dispute Resolution**: Secure dispute handling process

### 3. Reliability Requirements

#### 3.1 Availability
- **Uptime**: 99.9% availability (8.77 hours downtime/year)
- **Maintenance Windows**: Scheduled maintenance during low usage
- **Disaster Recovery**: <4 hour recovery time objective
- **Backup**: Daily automated backups with 30-day retention

#### 3.2 Error Handling
- **Graceful Degradation**: System continues operating with limited features
- **Error Logging**: Comprehensive error tracking and reporting
- **User Feedback**: Clear error messages for users
- **Automatic Recovery**: Self-healing capabilities where possible

### 4. Usability Requirements

#### 4.1 User Experience
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Language Support**: Vietnamese and English interfaces
- **Loading States**: Clear feedback during operations

#### 4.2 Learning Curve
- **New User Onboarding**: <10 minutes to complete first tournament registration
- **Feature Discovery**: Intuitive navigation and feature discovery
- **Help System**: Built-in help and tutorial system
- **Support**: Multi-channel customer support

## 💼 Business Rules

### 1. Tournament Rules

#### 1.1 Eligibility Rules
```typescript
interface TournamentEligibilityRules {
  ageRestrictions: {
    minimumAge: 16;                  // Minimum age for tournaments
    parentalConsent: boolean;        // Required for under 18
    ageVerification: boolean;        // ID verification required
  };
  
  rankingRestrictions: {
    sameRankTournaments: boolean;    // Rank-specific tournaments
    rankRangeLimit: number;          // Max rank difference (2 levels)
    skillDivisions: boolean;         // Separate skill divisions
  };
  
  membershipRules: {
    clubMemberPriority: boolean;     // Club members get priority
    memberDiscount: number;          // Membership discount percentage
    guestFeeMultiplier: number;      // Non-member fee multiplier
  };
}
```

#### 1.2 Payment Rules
- **Entry Fees**: Must be paid before tournament start
- **Refund Policy**: 100% refund 48+ hours before, 50% refund 24-48 hours, no refund <24 hours
- **Prize Distribution**: Automatic distribution within 24 hours of tournament completion
- **Transaction Fees**: Platform fee 3% of entry fees

### 2. Ranking Rules

#### 2.1 ELO Calculation Rules
```typescript
interface ELOCalculationRules {
  matchTypes: {
    tournament: { weight: 1.0 };     // Full weight for tournaments
    challenge: { weight: 0.8 };      // Reduced weight for challenges
    practice: { weight: 0.0 };       // No rating change for practice
  };
  
  adjustments: {
    newPlayerBonus: 50;              // Extra K-factor for first 10 games
    inactivityPenalty: 0.02;         // 2% decay per month inactive
    upsetBonus: 1.5;                // Bonus multiplier for major upsets
  };
  
  protections: {
    minimumGames: 10;                // Games before official rating
    provisionalPeriod: 30;           // Days of provisional rating
    ratingFloor: 800;                // Minimum possible rating
  };
}
```

### 3. Club Rules

#### 3.1 Verification Requirements
- **Business License**: Valid government business registration
- **Insurance**: Liability insurance minimum $1M coverage
- **Facility Standards**: Minimum 4 regulation tables
- **Staff Training**: At least one certified tournament director

#### 3.2 Revenue Sharing
- **Tournament Hosting**: Club retains 70%, platform takes 30%
- **Membership Fees**: Club retains 100%
- **Merchandise Sales**: Club retains 85%, platform takes 15%
- **Table Booking**: Club retains 95%, platform takes 5%

## 📊 Reporting Requirements

### 1. User Analytics
- **Player Performance**: ELO progression, tournament results
- **Engagement Metrics**: Session duration, feature usage
- **Retention Analysis**: User lifecycle and churn prediction
- **Skill Development**: Learning curves and improvement rates

### 2. Business Analytics
- **Revenue Reports**: Platform fees, subscription revenue
- **Tournament Analytics**: Success rates, popular formats
- **Club Performance**: Revenue per club, member growth
- **Market Analysis**: Geographic distribution, demographic insights

### 3. Operational Reports
- **System Health**: Performance metrics, error rates
- **Security Reports**: Authentication attempts, security incidents
- **Support Metrics**: Ticket volume, resolution times
- **Compliance Reports**: Financial auditing, regulatory compliance

## 🔄 Integration Requirements

### 1. External Integrations

#### 1.1 Payment Processors
- **VNPAY**: Primary payment processor for Vietnamese market
- **Stripe**: International payment processing (future)
- **Banking APIs**: Direct bank transfer integration

#### 1.2 Communication Services
- **SMS Gateway**: OTP verification and notifications
- **Email Service**: Transactional and marketing emails
- **Push Notifications**: Mobile app notifications

#### 1.3 Analytics & Monitoring
- **Google Analytics**: Web analytics and user behavior
- **Sentry**: Error tracking and performance monitoring
- **Mixpanel**: Product analytics and user journeys

### 2. Data Export/Import
- **Player Data Export**: GDPR compliance data export
- **Tournament Import**: Legacy tournament data migration
- **Financial Export**: Accounting system integration
- **Backup Systems**: Automated backup and restore

---

**Document Version**: 1.0.0  
**Last Updated**: August 30, 2025  
**Review Cycle**: Monthly  
**Approval Status**: Approved by Product Team

> "Clear business requirements are the foundation of successful software delivery"
