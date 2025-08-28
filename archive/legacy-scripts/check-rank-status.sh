#!/bin/bash

# ================================================================================
# RANK SYSTEM STATUS CHECKER SCRIPT
# ================================================================================

echo "🚀 RANK SYSTEM STATUS CHECKER"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we have access to database
echo "🔍 Checking database access..."

# Method 1: Try with psql if available
if command -v psql &> /dev/null; then
    echo "✅ psql found, attempting direct database connection..."
    
    # Try to read database URL from .env
    if [ -f .env ]; then
        echo "📄 Loading .env file..."
        source .env
        
        if [ ! -z "$DATABASE_URL" ]; then
            echo "🔗 Using DATABASE_URL from .env"
            echo ""
            echo "📊 Running quick rank system check..."
            psql "$DATABASE_URL" -f quick-rank-check.sql
            
            echo ""
            echo "📋 Running detailed rank system status..."
            psql "$DATABASE_URL" -f check-rank-system-status.sql
        else
            echo "❌ DATABASE_URL not found in .env"
        fi
    else
        echo "❌ .env file not found"
    fi
else
    echo "❌ psql not available"
fi

echo ""
echo "💡 Alternative methods:"
echo "   1. Copy SQL content and run in Supabase SQL Editor"
echo "   2. Use Supabase CLI: supabase db push"
echo "   3. Run via Node.js script with Supabase client"

echo ""
echo "📁 Available SQL files:"
echo "   • quick-rank-check.sql - Fast overview"
echo "   • check-rank-system-status.sql - Detailed analysis"
echo "   • comprehensive-rank-system-restoration.sql - Full restoration"

echo ""
echo "🏁 Status check completed!"
