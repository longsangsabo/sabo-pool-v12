# 📱 SABO Pool Mobile App - Quick Start Guide

## 🚀 Quick Build Commands

### For New Developers - One Command Setup:
```bash
# Clone và setup mobile app trong 30 giây
git clone https://github.com/longsangsabo/sabo-pool-v12.git
cd sabo-pool-v12/apps/sabo_flutter
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.3-stable.tar.xz
tar xf flutter_linux_3.24.3-stable.tar.xz -C ../..
export PATH="$PATH:$(pwd)/../../flutter/bin"
sudo apt update && sudo apt install -y cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libstdc++-12-dev
flutter doctor
flutter pub get
flutter build web
flutter run -d web-server --web-port=8080
```

### 🎯 Lệnh Build Ngắn Gọn:
```bash
# Build và chạy mobile app
cd apps/sabo_flutter
export PATH="$PATH:../../flutter/bin"
flutter build web && flutter run -d web-server --web-port=8080
```

## 📋 Chi Tiết Setup

### 1. Prerequisites (Chỉ cần làm 1 lần):
```bash
# Install system dependencies
sudo apt update && sudo apt install -y \
    cmake ninja-build pkg-config libgtk-3-dev \
    liblzma-dev libstdc++-12-dev curl git

# Download Flutter SDK
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.3-stable.tar.xz
tar xf flutter_linux_3.24.3-stable.tar.xz -C ../..

# Add Flutter to PATH (thêm vào ~/.bashrc để permanent)
export PATH="$PATH:$(pwd)/../../flutter/bin"
echo 'export PATH="$PATH:/workspaces/sabo-pool-v12/flutter/bin"' >> ~/.bashrc
```

### 2. Flutter Setup Verification:
```bash
flutter doctor -v
flutter pub get
```

### 3. Development Server:
```bash
# Development mode với hot reload
flutter run -d web-server --web-port=8080

# Production build
flutter build web --release
```

## 🏗️ Project Structure

```
apps/sabo_flutter/
├── lib/
│   ├── main.dart                    # App entry point + GoRouter
│   ├── screens/                     # All screen components
│   │   ├── auth_screen.dart        # Complete auth system
│   │   ├── home_screen.dart        # Home page with auth buttons
│   │   ├── profile_screen_optimized.dart
│   │   ├── tournament_screen.dart
│   │   ├── club_screen.dart
│   │   └── challenges_screen.dart
│   ├── components/                  # Reusable UI components
│   │   ├── profile/
│   │   │   ├── mobile_card_avatar.dart
│   │   │   ├── profile_tabs_mobile.dart
│   │   │   └── ProfileTabs.dart
│   │   └── ui/
│   │       └── Avatar.dart
│   └── types/                       # Type definitions
│       └── unified_profile.dart
├── assets/
│   └── images/                      # App assets
├── pubspec.yaml                     # Dependencies & config
└── build/web/                       # Web build output
```

## 🎯 Key Features Implemented

### ✅ Phase 1: Authentication System (COMPLETE)
- **Login/Register** với SĐT hoặc Email
- **Forgot/Reset Password** flow
- **Social Login** placeholders (Google/Facebook)
- **Form Validation** & error handling
- **GoRouter Navigation** type-safe routing
- **Material Design 3** mobile-first UI

### ✅ Profile System (OPTIMIZED)
- **Mobile Card Avatar** component
- **Profile Tabs** (Activities, Personal, Rank, SPA, Club)
- **Responsive Layout** mobile-optimized
- **Animation System** smooth transitions

### ✅ Navigation & UI
- **Bottom Navigation** native mobile experience
- **Native Animations** Flutter Material animations
- **Haptic Feedback** for better UX
- **Dark Theme** optimized for mobile

## 🔧 Development Commands

```bash
# Hot reload development
flutter run -d web-server --web-port=8080

# Production build
flutter build web --release

# Run on different platforms
flutter run -d chrome          # Desktop Chrome
flutter run -d web-server      # Development server
flutter run -d edge            # Desktop Edge

# Debug and analysis
flutter analyze                # Code analysis
flutter test                   # Run tests
flutter doctor                 # Check setup

# Clean and refresh
flutter clean && flutter pub get
```

## 🌐 URLs & Access

- **Development Server**: http://localhost:8080
- **Built Web App**: `build/web/index.html`
- **GitHub Repository**: https://github.com/longsangsabo/sabo-pool-v12

## 📱 Authentication Flow

### Routes Available:
- `/` - Main app (home with navigation)
- `/auth/login` - Login screen
- `/auth/register` - Register screen
- `/auth/forgot-password` - Forgot password
- `/auth/reset-password` - Reset password

### Test Scenarios:
1. **Login Flow**: SĐT/Email + Password validation
2. **Register Flow**: Full name + SĐT/Email + Password confirmation
3. **Forgot Password**: Email verification flow
4. **Social Login**: Google/Facebook placeholders

## 🚀 Performance & Production

### Build Optimization:
```bash
# Full production build với tree-shaking
flutter build web --release --web-renderer html

# Build with custom base href (for deployment)
flutter build web --base-href "/mobile/"

# PWA build
flutter build web --pwa-strategy offline-first
```

### Deployment Ready:
- ✅ **Web Build**: Optimized production bundle
- ✅ **PWA Support**: Progressive Web App ready
- ✅ **Responsive**: Mobile-first design
- ✅ **Cross-browser**: Chrome, Firefox, Safari, Edge
- ✅ **Performance**: Tree-shaking enabled

## 🔍 Troubleshooting

### Common Issues:

1. **Flutter command not found**:
   ```bash
   export PATH="$PATH:/workspaces/sabo-pool-v12/flutter/bin"
   ```

2. **Dependencies missing**:
   ```bash
   sudo apt install cmake ninja-build pkg-config libgtk-3-dev
   ```

3. **Port already in use**:
   ```bash
   flutter run -d web-server --web-port=8081
   ```

4. **Build cache issues**:
   ```bash
   flutter clean && flutter pub get && flutter build web
   ```

## 📞 Support

- **GitHub Issues**: [Create Issue](https://github.com/longsangsabo/sabo-pool-v12/issues)
- **Documentation**: Check `docs/` folder
- **Flutter Docs**: https://docs.flutter.dev

---

## 🎯 Next Development Phases

### Phase 2: Core Pages Enhancement
- Tournament listing & details
- Club management system
- Challenge system
- Real-time notifications

### Phase 3: Advanced Features
- WebSocket integration
- Push notifications
- Offline support
- Performance optimization

### Phase 4: Production Deployment
- CI/CD pipeline
- Testing automation
- Monitoring & analytics
- Performance benchmarks

---

**Build Time**: ~30 seconds | **Hot Reload**: <1 second | **Production Ready**: ✅
