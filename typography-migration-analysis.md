# Typography Migration Analysis Report

## Overview
Systematic analysis of typography patterns for migration to design system scales.

## Current Typography Usage

### 1. Total Typography Instances
**Total Text Classes**: 6764 instances

### 2. Top Typography Patterns
| Pattern | Count | Migration Target |
|---------|-------|------------------|
| `text-sm text-muted-foreground` | 64 | text-body-small |
| `text-muted-foreground` | 41 | Review needed |
| `text-center` | 38 | Review needed |
| `text-xs text-muted-foreground` | 35 | text-caption |
| `text-sm font-medium` | 28 | text-body-small |
| `text-xs` | 22 | text-caption |
| `p-4 text-center` | 16 | Review needed |
| `text-2xl font-bold` | 13 | text-heading |
| `text-sm` | 12 | text-body-small |
| `text-center py-12` | 11 | Review needed |
| `text-center py-8` | 10 | Review needed |
| `text-neutral-500` | 8 | Review needed |
| `text-2xl font-bold text-foreground` | 8 | text-heading |
| `font-semibold text-success-600` | 8 | Review needed |
| `text-xs mt-1` | 7 | text-caption |
| `ml-1 text-xs` | 7 | text-caption |
| `text-xs text-neutral-500` | 6 | text-caption |
| `text-success-600` | 6 | Review needed |
| `text-sm text-neutral-600 dark:text-gray-400` | 6 | text-body-small |
| `text-sm opacity-75` | 6 | text-body-small |

### 3. Font Weight Distribution
#### Current Font Weights
- **font-medium**: 36 instances
- **text-sm font-medium**: 28 instances
- **font-semibold**: 16 instances
- **text-2xl font-bold**: 13 instances
- **text-2xl font-bold text-foreground**: 8 instances
- **font-semibold text-success-600**: 8 instances
- **text-lg font-semibold**: 6 instances
- **text-lg font-semibold mb-2**: 6 instances
- **text-2xl font-bold text-success-600**: 6 instances
- **font-medium flex items-center gap-2**: 6 instances

### 4. Color Combinations
#### Text Color Usage
- **text-muted-**: 994 instances
- **text-neutral-600**: 413 instances
- **text-neutral-500**: 245 instances
- **text-primary-600**: 190 instances
- **text-neutral-900**: 189 instances
- **text-success-600**: 181 instances
- **text-gray-400**: 171 instances
- **text-warning-600**: 117 instances
- **text-neutral-700**: 111 instances
- **text-error-600**: 104 instances

### 5. File Impact Analysis
#### Files with Most Typography Usage
- **components/tournament/TournamentManagementHub.tsx**: 108 typography classes
- **components/tournament/EnhancedTournamentDetailsModal.tsx**: 97 typography classes
- **components/sabo/SaboInfoDialog.tsx**: 82 typography classes
- **pages/mobile/profile/components/SpaHistoryTab.tsx**: 72 typography classes
- **components/challenges/ScoreSubmissionCard.tsx**: 68 typography classes
- **components/modals/ImprovedCreateChallengeModal.tsx**: 67 typography classes
- **components/ClubTournamentManagement.tsx**: 66 typography classes
- **config/StandardComponents.tsx**: 64 typography classes
- **components/tournament/EnhancedTournamentForm.tsx**: 60 typography classes
- **pages/ClubDetailPage.tsx**: 55 typography classes
- **pages/Season2Page.tsx**: 54 typography classes
- **pages/SimpleClubHomePage.tsx**: 53 typography classes
- **pages/SimpleClubAboutPage.tsx**: 53 typography classes
- **components/tournament/OptimizedTournamentCard.tsx**: 53 typography classes
- **components/challenges/EnhancedChallengeCard.tsx**: 51 typography classes

## Migration Strategy

### Phase 1: Size Migration (Priority)
1. `text-xs` → `text-caption` (Most common)
2. `text-sm` → `text-body-small` (High usage)
3. `text-base` → `text-body` (Default)
4. `text-lg` → `text-body-large` (Medium)
5. `text-xl/2xl` → `text-title/heading` (Headers)

### Phase 2: Weight & Color Consolidation
1. Standardize font weights to design system
2. Migrate color patterns to design tokens
3. Combine typography + color into semantic classes
