#!/bin/bash

echo "🔧 ===== UPDATE SUPABASE API KEY ====="
echo ""

# Get current values
CURRENT_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d'=' -f2)
echo "📍 Current Supabase URL: $CURRENT_URL"
echo ""

# Prompt for new key
echo "🗝️  Please paste the new 'anon public' key from Supabase dashboard:"
echo "   (Go to: https://supabase.com/dashboard/project/exlqvlbawytbglioqfbc/settings/api)"
echo ""
read -p "New API Key: " NEW_KEY

if [ -z "$NEW_KEY" ]; then
    echo "❌ No key provided. Exiting."
    exit 1
fi

echo ""
echo "📋 Validating new key format..."

# Basic validation
if [[ $NEW_KEY == eyJ* ]]; then
    echo "✅ Key format looks correct (starts with eyJ)"
else
    echo "⚠️  Warning: Key doesn't start with 'eyJ' - might be incorrect"
    read -p "Continue anyway? (y/N): " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        echo "❌ Aborted."
        exit 1
    fi
fi

echo ""
echo "🔄 Updating configuration files..."

# 1. Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up .env"

# 2. Update .env file
cat > .env << EOF
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

echo "✅ Updated .env file"

# 3. Update client.ts fallback
sed -i "s/eyJ[^']*/'"$NEW_KEY"'/g" src/integrations/supabase/client.ts
echo "✅ Updated client.ts fallback key"

# 4. Clear cache
rm -rf node_modules/.vite
rm -rf dist
echo "✅ Cleared Vite cache"

echo ""
echo "🧪 Testing new API key..."

# Test new key
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: $NEW_KEY" \
  -H "Authorization: Bearer $NEW_KEY" \
  "$CURRENT_URL/rest/v1/profiles?select=count&head=true")

echo "   HTTP Response: $RESPONSE"

if [ "$RESPONSE" = "200" ]; then
    echo "✅ NEW API KEY IS VALID!"
    echo ""
    echo "🎉 SUCCESS! You can now:"
    echo "1. npm run dev"
    echo "2. Try logging in"
    echo "3. Check that authentication works"
elif [ "$RESPONSE" = "401" ]; then
    echo "❌ New API key is still invalid"
    echo "   Please double-check you copied the correct 'anon public' key"
    echo "   from Supabase dashboard"
else
    echo "⚠️  Unexpected response: $RESPONSE"
    echo "   Key might be valid but there could be other issues"
fi

echo ""
echo "📝 Configuration updated:"
echo "   URL: $CURRENT_URL"
echo "   Key: ${NEW_KEY:0:30}..."
echo "   Status: $([ "$RESPONSE" = "200" ] && echo "✅ Valid" || echo "❌ Check again")"
