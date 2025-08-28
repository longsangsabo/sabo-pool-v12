#!/usr/bin/env python3

import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SERVICE_KEY = os.getenv('VITE_SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_KEY:
    print("❌ Missing SUPABASE_URL or SERVICE_KEY in .env")
    exit(1)

def make_request(endpoint, method='GET', data=None):
    """Make request to Supabase API"""
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json'
    }
    
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ API Error: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return None

def check_table_data(table_name, select_fields="*", limit=2):
    """Check sample data from table"""
    print(f"\n📊 SAMPLE DATA FROM: {table_name.upper()}")
    print("-" * 50)
    
    endpoint = f"{table_name}?select={select_fields}&limit={limit}"
    data = make_request(endpoint)
    
    if data is None:
        print(f"❌ Could not fetch data from {table_name}")
        return None
    
    if len(data) == 0:
        print(f"ℹ️  Table '{table_name}' is empty")
        return None
    
    print(f"✅ Found {len(data)} records in '{table_name}':")
    for i, record in enumerate(data):
        print(f"\nRecord {i+1}:")
        for key, value in record.items():
            # Truncate long values
            if isinstance(value, str) and len(value) > 50:
                display_value = value[:50] + "..."
            else:
                display_value = value
            print(f"  {key}: {display_value}")
    
    return data

def check_tournaments_columns():
    """Check what columns exist in tournaments table"""
    print("\n📋 CHECKING TOURNAMENTS TABLE COLUMNS")
    print("-" * 50)
    
    # Get sample data to see actual columns
    data = make_request("tournaments?limit=1")
    
    if data and len(data) > 0:
        columns = list(data[0].keys())
        print(f"✅ Found {len(columns)} columns in tournaments table:")
        for i, col in enumerate(columns, 1):
            print(f"{i:2d}. {col}")
        
        # Check for specific columns we need
        critical_columns = ['id', 'name', 'tournament_type', 'status', 'winner_id']
        print(f"\n🔍 Critical columns check:")
        for col in critical_columns:
            status = "✅" if col in columns else "❌"
            print(f"{status} {col}")
        
        return columns
    else:
        print("❌ Could not fetch tournaments data")
        return None

def check_tournament_results_columns():
    """Check tournament_results table structure"""
    print("\n📋 CHECKING TOURNAMENT_RESULTS TABLE")
    print("-" * 50)
    
    # Try to get sample data
    data = make_request("tournament_results?limit=1")
    
    if data is not None:
        if len(data) > 0:
            columns = list(data[0].keys())
            print(f"✅ Found {len(columns)} columns in tournament_results table:")
            for i, col in enumerate(columns, 1):
                print(f"{i:2d}. {col}")
        else:
            print("ℹ️  tournament_results table exists but is empty")
            print("Table structure will be checked when data is inserted")
    else:
        print("❌ tournament_results table may not exist or is not accessible")

def check_sabo_tournaments():
    """Check for SABO tournaments"""
    print("\n🎯 SABO TOURNAMENTS CHECK")
    print("-" * 50)
    
    # Check for SABO and double_elimination tournaments
    endpoint = "tournaments?select=id,name,tournament_type,status,created_at&tournament_type=in.(sabo,double_elimination)&order=created_at.desc&limit=5"
    data = make_request(endpoint)
    
    if data is None:
        print("❌ Could not fetch SABO tournaments")
        return
    
    if len(data) == 0:
        print("ℹ️  No SABO/double_elimination tournaments found")
        return
    
    print(f"✅ Found {len(data)} SABO tournaments:")
    for i, tournament in enumerate(data, 1):
        print(f"{i}. {tournament['name']} ({tournament['tournament_type']}) - {tournament['status']}")

def main():
    print("🔍 DATABASE SCHEMA ANALYSIS")
    print(f"Using Supabase URL: {SUPABASE_URL}")
    print("=" * 60)
    
    # Check tournaments table
    tournaments_columns = check_tournaments_columns()
    check_table_data("tournaments", "id,name,tournament_type,status,created_at", 2)
    
    # Check tournament_results table
    check_tournament_results_columns()
    
    # Check for SABO tournaments
    check_sabo_tournaments()
    
    # Check tournament_matches for final matches
    print("\n📋 CHECKING FINAL MATCHES (Round 300)")
    print("-" * 50)
    endpoint = "tournament_matches?select=id,tournament_id,round_number,status,winner_id&round_number=eq.300&limit=5"
    matches_data = make_request(endpoint)
    
    if matches_data is None:
        print("❌ Could not fetch tournament_matches data")
    elif len(matches_data) == 0:
        print("ℹ️  No Round 300 (final) matches found")
    else:
        print(f"✅ Found {len(matches_data)} final matches:")
        for match in matches_data:
            print(f"  Match {match['id']}: Tournament {match['tournament_id']} - {match['status']}")
    
    print("\n🎉 SCHEMA ANALYSIS COMPLETE!")
    
    # Summary
    print("\n📋 SUMMARY FOR TRIGGER SCRIPT:")
    print("-" * 50)
    if tournaments_columns:
        has_winner_id = 'winner_id' in tournaments_columns
        print(f"tournaments.winner_id exists: {'✅ YES' if has_winner_id else '❌ NO'}")
        
        # Create corrected SQL for script
        if not has_winner_id:
            print("\n🔧 CORRECTED SQL FOR TOURNAMENTS TABLE:")
            print("SELECT id, name, tournament_type, status, created_at")
            print("FROM tournaments")
            print("WHERE tournament_type IN ('sabo', 'double_elimination')")
            print("ORDER BY created_at DESC LIMIT 5;")

if __name__ == "__main__":
    main()
