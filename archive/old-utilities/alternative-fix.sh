#!/bin/bash

echo "🔍 ===== ALTERNATIVE: TRY PRODUCTION KEY ====="
echo ""
echo "Nếu bạn không thể access Supabase dashboard, có thể copy key từ production..."
echo ""

# Check if we can find production config
echo "📋 Searching for production keys in common locations..."

# Check Vercel/Netlify deployment files
if [ -f "vercel.json" ]; then
    echo "🔍 Found vercel.json - check environment variables in Vercel dashboard"
fi

if [ -f "netlify.toml" ]; then
    echo "🔍 Found netlify.toml - check environment variables in Netlify dashboard"
fi

# Check for other env files
for file in .env.production .env.prod .env.local; do
    if [ -f "$file" ]; then
        echo "📄 Found $file:"
        grep -E "SUPABASE|VITE_SUPABASE" "$file" || echo "   No Supabase keys found"
        echo ""
    fi
done

echo "💡 ALTERNATIVE SOLUTIONS:"
echo ""
echo "1. 🌐 Get from production website:"
echo "   - Open browser DevTools on production site"
echo "   - Check localStorage or console for Supabase config"
echo "   - Look for window.SUPABASE_* variables"
echo ""
echo "2. 📱 Check deployment platform:"
echo "   - Vercel: https://vercel.com/dashboard → Environment Variables"
echo "   - Netlify: https://app.netlify.com → Site settings → Environment variables"  
echo "   - Railway: https://railway.app → Variables"
echo ""
echo "3. 🔄 Contact team admin:"
echo "   - Request access to Supabase project"
echo "   - Get fresh API keys from team member"
echo ""
echo "4. 🧪 Try alternative Supabase project:"
echo "   - Create new Supabase project temporarily"
echo "   - Use for development while waiting for access"
echo ""

# Create temporary env with placeholder
echo "5. 🔧 Generate temporary development config:"
read -p "Create temporary placeholder config? (y/N): " CREATE_TEMP

if [[ $CREATE_TEMP =~ ^[Yy]$ ]]; then
    cp .env .env.broken.backup
    
    cat > .env.temp << EOF
# TEMPORARY CONFIG - REPLACE WITH REAL KEYS!
VITE_SUPABASE_URL=https://exlqvlbawytbglioqfbc.supabase.co
VITE_SUPABASE_ANON_KEY=PLACEHOLDER_KEY_REPLACE_ME

# VNPay Configuration  
VITE_VNPAY_TMN_CODE=7F93DNAA
VITE_VNPAY_HASH_SECRET=VLWJOLNJNRHPXLWTDIXWCXSYMQSDDGNM
VITE_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VITE_VNPAY_RETURN_URL=https://your-domain.com/payment/return
VITE_VNPAY_VERSION=2.1.0
VITE_VNPAY_COMMAND=pay
VITE_VNPAY_CURRENCY=VND
VITE_VNPAY_LOCALE=vn

NODE_ENV=development
EOF
    
    echo "✅ Created .env.temp with placeholder"
    echo "⚠️  This will NOT work for authentication!"
    echo "   Only use for UI development without backend"
fi

echo ""
echo "📞 NEED HELP?"
echo "   Contact your team admin or Supabase project owner"
echo "   They can provide valid API keys or grant access"
