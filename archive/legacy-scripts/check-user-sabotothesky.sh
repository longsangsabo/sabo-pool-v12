#!/bin/bash
# ================================================================================
# KIỂM TRA USER sabotothesky@gmail.com BẰNG CURL
# ================================================================================

echo "🔍 KIỂM TRA USER: sabotothesky@gmail.com"
echo "========================================"

# Supabase credentials
SUPABASE_URL="https://gprrhjtnyzzgkixzvhyj.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnJoanRueXp6Z2tpeHp2aHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNjQ5OTE3NywiZXhwIjoyMDIyMDc1MTc3fQ.rJqR2R1DqGKa8sDKUw7QGX0bKOAEYwxNYu_UWA9fKiY"

USER_EMAIL="sabotothesky@gmail.com"

echo ""
echo "🔄 Trying to connect to Supabase..."

# Test connection first
if ! ping -c 1 gprrhjtnyzzgkixzvhyj.supabase.co &> /dev/null; then
    echo "❌ Cannot reach Supabase server"
    echo "🌐 Checking network connectivity..."
    
    # Try with public DNS
    if ! ping -c 1 8.8.8.8 &> /dev/null; then
        echo "❌ No internet connection"
        exit 1
    else
        echo "✅ Internet connection OK, but Supabase unreachable"
        echo "💡 This might be a temporary network issue or DNS problem"
        
        # Try alternative method - show what we would check
        echo ""
        echo "📋 WHAT WE WOULD CHECK FOR USER $USER_EMAIL:"
        echo "=============================================="
        echo "1. 👤 Auth user info (ID, email, created_at, confirmed)"
        echo "2. 📋 Profile (display_name, verified_rank, updated_at)"
        echo "3. 📝 Rank requests (status, requested_rank, approved_at)"
        echo "4. 💰 SPA transactions (points, transaction_type, description)"
        echo "5. 👛 Wallet (points_balance)"
        echo "6. 🔔 Notifications (rank_approval notifications)"
        echo "7. 🏢 Club membership (status, role, club_name)"
        echo ""
        echo "🎯 COMMON ISSUES AFTER RANK REGISTRATION:"
        echo "=========================================="
        echo "❓ Issue 1: Rank request stuck in 'pending' status"
        echo "   → Solution: Admin needs to approve in club management"
        echo ""
        echo "❓ Issue 2: Rank approved but profile not updated"
        echo "   → Solution: Run manual_approve_rank_request function"
        echo ""
        echo "❓ Issue 3: No SPA reward after approval"
        echo "   → Solution: Check if SPA transaction was created"
        echo ""
        echo "❓ Issue 4: No notification received"
        echo "   → Solution: Check notifications table for rank_approval type"
        echo ""
        echo "❓ Issue 5: Not added to club after approval"
        echo "   → Solution: Check club_members table"
        echo ""
        echo "🔧 MANUAL ACTIONS TO HELP USER:"
        echo "=============================="
        echo "1. Go to Supabase Dashboard SQL Editor"
        echo "2. Find user: SELECT * FROM auth.users WHERE email = '$USER_EMAIL';"
        echo "3. Check latest rank request: SELECT * FROM rank_requests WHERE user_id = 'USER_ID' ORDER BY created_at DESC LIMIT 1;"
        echo "4. If pending: Admin approve via frontend"
        echo "5. If approved but no updates: Run manual_approve_rank_request function"
        echo ""
        exit 1
    fi
fi

echo "✅ Network connection OK"
echo ""

# Try to fetch user info via REST API
echo "1. 👤 Fetching user profile..."

# Query profiles table to find user by display name or other identifier
# Since we can't easily query auth.users via REST API, let's check profiles
USER_PROFILES=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/profiles?select=*" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json")

if [ $? -eq 0 ] && [ "$USER_PROFILES" != "null" ]; then
    echo "✅ Successfully connected to Supabase"
    echo "📊 Profiles data received (checking for our user...)"
    
    # Save to temp file for processing
    echo "$USER_PROFILES" > /tmp/profiles.json
    
    # Try to find user with email-like display name
    echo ""
    echo "🔍 Looking for sabotothesky user in profiles..."
    echo "$USER_PROFILES" | grep -i "sabotothesky" || echo "❌ No profile found with 'sabotothesky' in display name"
    
else
    echo "❌ Failed to connect to Supabase REST API"
    echo "Response: $USER_PROFILES"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "=============="
echo "1. Check if user exists in Supabase Dashboard"
echo "2. Look for recent rank requests"
echo "3. Verify approval workflow"
echo "4. Check for any errors in function logs"
echo ""
