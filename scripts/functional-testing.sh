#!/bin/bash

# 🧪 FUNCTIONAL TESTING SCRIPT
# Test core functionality after each migration phase

echo "🧪 FUNCTIONAL TESTING SUITE"
echo "=========================="

# Function to test if service exists and is importable
test_service() {
    local service_name=$1
    local service_path="/workspaces/sabo-pool-v12/packages/shared-business/src"
    
    if [ -f "$service_path/$service_name.ts" ]; then
        echo "✅ $service_name exists"
        
        # Check if service exports main class
        if grep -q "export.*class.*$service_name" "$service_path/$service_name.ts"; then
            echo "✅ $service_name exports main class"
        else
            echo "❌ $service_name missing main class export"
        fi
        
        # Check if service has key methods
        case $service_name in
            "user/UserService")
                if grep -q "signIn\|signUp\|signOut" "$service_path/$service_name.ts"; then
                    echo "✅ UserService has auth methods"
                else
                    echo "❌ UserService missing auth methods"
                fi
                ;;
            "tournament/TournamentService")
                if grep -q "createTournament\|joinTournament" "$service_path/$service_name.ts"; then
                    echo "✅ TournamentService has core methods"
                else
                    echo "❌ TournamentService missing core methods"
                fi
                ;;
            "payment/PaymentService")
                if grep -q "processPayment\|getWalletBalance" "$service_path/$service_name.ts"; then
                    echo "✅ PaymentService has core methods"
                else
                    echo "❌ PaymentService missing core methods"
                fi
                ;;
        esac
    else
        echo "❌ $service_name not found"
    fi
    echo ""
}

# Test Week 1: Auth & User Services
echo "📅 WEEK 1 SERVICES:"
test_service "user/UserService"

# Test Week 2: Tournament & Payment Services  
echo "📅 WEEK 2 SERVICES:"
test_service "tournament/TournamentService"
test_service "payment/PaymentService"

# Test Week 3: Club, Challenge, Ranking Services
echo "📅 WEEK 3 SERVICES:"
test_service "club/ClubService"
test_service "challenge/ChallengeService"
test_service "ranking/RankingService"

# Test Mobile Services
echo "📱 MOBILE SERVICES:"
test_service "mobile/OfflineDataService"
test_service "mobile/NotificationService"
test_service "mobile/WebSocketService"

echo "🔍 MIGRATION PROGRESS CHECK:"

# Count files still using direct supabase
total_supabase=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Files with direct supabase calls: $total_supabase"

# Count components using services
total_services=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*.tsx" | xargs grep -l "from.*shared-business" 2>/dev/null | wc -l)
echo "Components using services: $total_services"

echo ""
echo "📊 MIGRATION STATUS:"

if [ $total_supabase -eq 0 ]; then
    echo "🎉 MIGRATION COMPLETE! Ready for mobile development!"
elif [ $total_supabase -le 30 ]; then
    echo "📈 Week 3/4 progress - Final cleanup phase"
elif [ $total_supabase -le 80 ]; then
    echo "📈 Week 2/3 progress - Club/Challenge migration needed"
elif [ $total_supabase -le 130 ]; then
    echo "📈 Week 1/2 progress - Tournament/Payment migration needed"
else
    echo "🔄 Just started - Auth/User migration needed"
fi

echo ""
echo "⚠️  Remember: Only claim completion when verification returns 0!"
echo "   Verification command: find /workspaces/sabo-pool-v12/apps/sabo-user/src -name \"*.ts\" -o -name \"*.tsx\" | xargs grep -l \"supabase\.\" | wc -l"
