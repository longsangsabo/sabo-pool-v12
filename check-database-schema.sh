#!/bin/bash

# ============================================================================
# CHECK DATABASE SCHEMA USING SUPABASE REST API
# ============================================================================

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

SUPABASE_URL="${VITE_SUPABASE_URL}"
SERVICE_KEY="${VITE_SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "❌ Missing SUPABASE_URL or SERVICE_KEY in .env"
  exit 1
fi

echo "🔍 DATABASE SCHEMA ANALYSIS"
echo "Using Supabase URL: $SUPABASE_URL"
echo "====================================================="

# Function to check table structure
check_table_structure() {
  local table_name=$1
  echo ""
  echo "📋 CHECKING TABLE: $table_name"
  echo "-------------------"
  
  # Use Supabase RPC to get table structure
  local response=$(curl -s \
    -X POST \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '$table_name' AND table_schema = 'public' ORDER BY ordinal_position;\"}" \
    "$SUPABASE_URL/rest/v1/rpc/sql")
  
  if echo "$response" | grep -q "error"; then
    echo "❌ Error checking $table_name structure"
    echo "$response"
  else
    echo "✅ Table '$table_name' structure:"
    echo "$response" | jq -r '.[] | "\(.column_name) (\(.data_type)) \(if .is_nullable == "NO" then "NOT NULL" else "NULLABLE" end)"' 2>/dev/null || echo "$response"
  fi
}

# Function to check sample data
check_sample_data() {
  local table_name=$1
  echo ""
  echo "📊 SAMPLE DATA FROM: $table_name"
  echo "-------------------"
  
  local response=$(curl -s \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    "$SUPABASE_URL/rest/v1/$table_name?select=*&limit=2")
  
  if echo "$response" | grep -q "error"; then
    echo "❌ Error getting sample data from $table_name"
    echo "$response"
  else
    local count=$(echo "$response" | jq length 2>/dev/null || echo "unknown")
    if [ "$count" = "0" ]; then
      echo "ℹ️  Table '$table_name' is empty"
    else
      echo "✅ Found $count records in '$table_name'"
      echo "$response" | jq '.[0] // empty' 2>/dev/null || echo "$response"
    fi
  fi
}

# Check tournaments table
check_table_structure "tournaments"
check_sample_data "tournaments"

# Check tournament_results table
check_table_structure "tournament_results"
check_sample_data "tournament_results"

# Check tournament_matches table
check_table_structure "tournament_matches"

# Check tournament_participants table
check_table_structure "tournament_participants"

# Check for SABO tournaments specifically
echo ""
echo "🎯 SABO TOURNAMENTS CHECK"
echo "-------------------"

local sabo_response=$(curl -s \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/rest/v1/tournaments?select=id,name,tournament_type,status&tournament_type=in.(sabo,double_elimination)&order=created_at.desc&limit=5")

if echo "$sabo_response" | grep -q "error"; then
  echo "❌ Error checking SABO tournaments"
  echo "$sabo_response"
else
  local sabo_count=$(echo "$sabo_response" | jq length 2>/dev/null || echo "unknown")
  if [ "$sabo_count" = "0" ]; then
    echo "ℹ️  No SABO/double_elimination tournaments found"
  else
    echo "✅ Found $sabo_count SABO tournaments:"
    echo "$sabo_response" | jq -r '.[] | "\(.name) (\(.tournament_type)) - \(.status)"' 2>/dev/null || echo "$sabo_response"
  fi
fi

echo ""
echo "🎉 SCHEMA ANALYSIS COMPLETE!"
