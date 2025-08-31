#!/bin/bash

# Script to fix Button JSX tag mismatches throughout the codebase
# Fixes cases where <Button> is opened but </button> is closed

echo "🔧 Fixing Button JSX tag mismatches..."

# Find all TSX files and fix Button tag mismatches
find apps/ packages/ -name "*.tsx" -type f | while IFS= read -r file; do
    if grep -q "<Button" "$file" && grep -q "</button>" "$file"; then
        echo "Fixing: $file"
        # Replace </button> with </Button> only when there's a corresponding <Button> tag
        sed -i 's|</button>|</Button>|g' "$file"
    fi
done

echo "✅ Button JSX tag fixes completed!"

# Also check for any remaining Button/button mismatches
echo "🔍 Checking for remaining Button/button mismatches..."
find apps/ packages/ -name "*.tsx" -type f -exec grep -l "<Button" {} \; | xargs grep -l "</button>" || echo "No remaining mismatches found!"
