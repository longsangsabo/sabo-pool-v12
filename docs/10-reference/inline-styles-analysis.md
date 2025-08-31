# Inline Styles Analysis Report

## Overview
This analysis identifies all inline styles for systematic cleanup and conversion to design tokens.

## Analysis Results

### 1. Total Inline Style Count
**Total Inline Styles**: 156 instances
### 2. File Distribution
| File | Inline Styles Count |
|------|-------------------|
| pages/SABOStyleTestPage.tsx | 19 |
| components/ui/sabo-avatar.tsx | 19 |
| components/RankColorReference.tsx | 13 |
| pages/RankTestPage.tsx | 11 |
| components/ui/dark-card-avatar.tsx | 10 |
| components/ui/card-avatar.tsx | 10 |
| pages/DashboardPage.tsx | 6 |
| components/ui/polaroid-frame.tsx | 5 |
| components/ui/optimized-image.tsx | 4 |
| components/analytics/AnalyticsDashboard.tsx | 4 |
| pages/Home.tsx | 3 |
| components/ui/sidebar.tsx | 3 |
| components/ui/rainbow-avatar.tsx | 3 |
| components/ui/mobile-image-cropper.tsx | 3 |
| components/PointsDisplay.tsx | 3 |
| pages/OptimizedMobileProfile.tsx | 2 |
| pages/Dashboard.tsx | 2 |
| components/ui/scrollable-table.tsx | 2 |
| components/ui/chart.tsx | 2 |
| components/tournament/BracketVisualization.tsx | 2 |

### 3. Style Pattern Categories
#### Animation Styles
- **Count**: 14 instances
- **Action**: Convert to CSS animations with design tokens

#### Dynamic Width/Height
- **Count**: 13 instances
- **Action**: Use design system spacing or CSS variables

#### Progress Bars
- **Count**: 11 instances
- **Action**: Create ProgressBar component with design tokens

#### Color Overrides
- **Count**: 2 instances
- **Action**: Replace with design token classes

**apps/sabo-user/src/pages/SABOStyleTestPage.tsx** (19 styles)
```bash
8:      style={{
15:        style={{
35:      <div style={{ marginBottom: '40px' }}>
```

**apps/sabo-user/src/components/ui/sabo-avatar.tsx** (19 styles)
```bash
879:      style={{ minWidth: '100px', minHeight: '100px' }}
904:        style={
951:                style={{ zIndex: 1 }}
```

**apps/sabo-user/src/components/RankColorReference.tsx** (13 styles)
```bash
9:      style={{
18:        style={{
30:        style={{
```

**apps/sabo-user/src/pages/RankTestPage.tsx** (11 styles)
```bash
25:    <div style={{ padding: '20px', background: '#f8f9fa' }}>
27:        style={{
46:      <div style={{ marginTop: '40px' }}>
```

**apps/sabo-user/src/components/ui/dark-card-avatar.tsx** (10 styles)
```bash
87:      style={{ cursor: onClick ? 'pointer' : 'default' }}
98:            style={{ cursor: onAvatarChange ? 'pointer' : 'default' }}
120:                  style={{
```

