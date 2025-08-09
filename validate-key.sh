#!/bin/bash

echo "🔍 ===== VALIDATE SUPABASE API KEY ====="

# 1. Kiểm tra key hiện tại
echo "📋 Current API key from .env:"
CURRENT_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d'=' -f2)
echo "   First 30 chars: ${CURRENT_KEY:0:30}..."

# 2. Decode JWT để xem expiry
echo ""
echo "🔍 Decoding JWT token..."
JWT_PAYLOAD=$(echo $CURRENT_KEY | cut -d'.' -f2)
# Add padding if needed
while [ $((${#JWT_PAYLOAD} % 4)) -ne 0 ]; do
    JWT_PAYLOAD="${JWT_PAYLOAD}="
done

# Decode base64
DECODED=$(echo $JWT_PAYLOAD | base64 -d 2>/dev/null || echo "Failed to decode")
echo "   Decoded payload: $DECODED"

# 3. Test key với curl
echo ""
echo "🧪 Testing API key with Supabase..."
SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d'=' -f2)
echo "   URL: $SUPABASE_URL"

# Test với REST API
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: $CURRENT_KEY" \
  -H "Authorization: Bearer $CURRENT_KEY" \
  "$SUPABASE_URL/rest/v1/profiles?select=user_id&limit=1")

echo "   HTTP Response Code: $RESPONSE"

if [ "$RESPONSE" = "200" ]; then
    echo "✅ API key is VALID"
elif [ "$RESPONSE" = "401" ]; then
    echo "❌ API key is INVALID or EXPIRED"
    echo ""
    echo "🔧 SOLUTIONS:"
    echo "1. Go to https://supabase.com/dashboard/project/exlqvlbawytbglioqfbc/settings/api"
    echo "2. Copy the 'anon public' key"
    echo "3. Update .env file with new key"
    echo "4. Restart dev server"
elif [ "$RESPONSE" = "404" ]; then
    echo "❌ Supabase URL might be wrong or project not found"
else
    echo "⚠️  Unexpected response: $RESPONSE"
fi

echo ""
echo "📝 Current environment status:"
echo "   VITE_SUPABASE_URL: $SUPABASE_URL"
echo "   Key status: $([ "$RESPONSE" = "200" ] && echo "✅ Valid" || echo "❌ Invalid")"

# 4. Suggest next steps
echo ""
echo "💡 NEXT STEPS:"
echo "1. If key is invalid, get new key from Supabase dashboard"
echo "2. Update both .env and client.ts with same key"
echo "3. Clear cache: rm -rf node_modules/.vite"
echo "4. Restart: npm run dev"
