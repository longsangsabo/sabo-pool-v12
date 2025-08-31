#!/bin/bash

# SABO Pool Mobile - Pre-Production Checklist
# Run this before production deployment

echo "🔍 SABO Pool Arena - Production Readiness Check"
echo "=============================================="

# Check 1: Environment Files
echo "📁 Checking environment files..."
if [ -f ".env.production" ]; then
    echo "✅ .env.production exists"
else
    echo "⚠️  .env.production not found - using .env"
fi

# Check 2: App Configuration
echo "📱 Checking app configuration..."
if [ -f "app.json" ]; then
    echo "✅ app.json exists"
    
    # Check bundle identifiers
    if grep -q "com.sabopool.arena" app.json; then
        echo "✅ Bundle identifiers configured"
    else
        echo "❌ Bundle identifiers need update"
    fi
else
    echo "❌ app.json missing"
fi

# Check 3: EAS Configuration
echo "🛠️  Checking EAS configuration..."
if [ -f "eas.json" ]; then
    echo "✅ eas.json exists"
else
    echo "❌ eas.json missing"
fi

# Check 4: Build Dependencies
echo "📦 Checking dependencies..."
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    
    # Check for essential dependencies
    if grep -q "expo" package.json; then
        echo "✅ Expo dependency found"
    else
        echo "❌ Expo dependency missing"
    fi
else
    echo "❌ package.json missing"
fi

# Check 5: Assets
echo "🎨 Checking assets..."
if [ -d "assets" ]; then
    echo "✅ Assets directory exists"
    
    if [ -f "assets/icon.png" ]; then
        echo "✅ App icon found"
    else
        echo "⚠️  App icon missing"
    fi
    
    if [ -f "assets/splash.png" ]; then
        echo "✅ Splash screen found"
    else
        echo "⚠️  Splash screen missing"
    fi
else
    echo "⚠️  Assets directory missing"
fi

# Check 6: TypeScript Compilation
echo "🔧 Testing TypeScript compilation..."
if pnpm run type-check; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
fi

echo ""
echo "📋 PRODUCTION CHECKLIST SUMMARY:"
echo "================================"
echo "Before deploying to production, ensure:"
echo "1. ✅ All environment variables are set correctly"
echo "2. ✅ Bundle identifiers match your app store listings"
echo "3. ✅ App icons and splash screens are production-ready"
echo "4. ✅ TypeScript compilation passes"
echo "5. ✅ You have valid Apple Developer and Google Play accounts"
echo "6. ✅ App store listings are created and approved"
echo ""
echo "🚀 If all checks pass, run: ./deploy.sh production"
