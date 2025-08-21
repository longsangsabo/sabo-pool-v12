#!/bin/bash

echo "🔧 ===== FIX ENVIRONMENT CONFIGURATION ====="

# 1. Backup current .env
cp .env .env.backup
echo "📁 Backed up .env to .env.backup"

# 2. Check if environment variables are properly formatted
echo "🔍 Checking .env format..."
grep -E "^[A-Z_]+=.+" .env > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ .env format is valid"
else
    echo "❌ .env format is invalid"
fi

# 3. Verify Supabase connection with current credentials
echo "🔗 Testing Supabase URL..."
SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d '=' -f2)
echo "   URL: $SUPABASE_URL"

# 4. Show first 30 chars of API key for verification
SUPABASE_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d '=' -f2)
echo "🗝️  API Key (first 30 chars): ${SUPABASE_KEY:0:30}..."

# 5. Create a new .env with proper formatting
echo "🛠️  Creating properly formatted .env..."
cat > .env << 'EOF'
# Supabase Configuration for Development
VITE_SUPABASE_URL=https://exlqvlbawytbglioqfbc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA

# VNPay Configuration
VITE_VNPAY_TMN_CODE=7F93DNAA
VITE_VNPAY_HASH_SECRET=VLWJOLNJNRHPXLWTDIXWCXSYMQSDDGNM
VITE_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VITE_VNPAY_RETURN_URL=https://your-domain.com/payment/return
VITE_VNPAY_VERSION=2.1.0
VITE_VNPAY_COMMAND=pay
VITE_VNPAY_CURRENCY=VND
VITE_VNPAY_LOCALE=vn

# Environment Type
NODE_ENV=development
EOF

echo "✅ New .env created with proper formatting"

# 6. Clear Vite cache
echo "🗑️  Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf dist

echo "🎯 ENVIRONMENT FIX COMPLETED!"
echo ""
echo "📝 Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Check browser console for environment debug info"
echo "3. Try logging in again"
echo "4. If still issues, check Supabase dashboard for API key validity"
