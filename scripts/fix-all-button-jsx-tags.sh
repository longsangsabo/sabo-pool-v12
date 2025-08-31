#!/bin/bash

echo "🔧 Fixing all Button JSX tag mismatches..."

# Find all files with button tag mismatches and fix them
find apps/sabo-user/src -name "*.tsx" -type f -exec grep -l "<button.*</Button>" {} \; | while read file; do
    echo "Fixing: $file"
    # Replace </Button> with </button> when preceded by <button>
    sed -i 's|</Button>|</button>|g' "$file"
done

find apps/sabo-user/src -name "*.tsx" -type f -exec grep -l "<Button.*</button>" {} \; | while read file; do
    echo "Fixing: $file"
    # Replace </button> with </Button> when preceded by <Button>
    sed -i 's|</button>|</Button>|g' "$file"
done

# Run a comprehensive search and replace for common patterns
echo "🔍 Running comprehensive Button tag fixes..."

# Pattern 1: <button ... > ... </Button>
find apps/sabo-user/src -name "*.tsx" -exec sed -i '/^[[:space:]]*<button[^>]*>/,/^[[:space:]]*<\/Button>/ s|</Button>|</button>|g' {} \;

# Pattern 2: <Button ... > ... </button>
find apps/sabo-user/src -name "*.tsx" -exec sed -i '/^[[:space:]]*<Button[^>]*>/,/^[[:space:]]*<\/button>/ s|</button>|</Button>|g' {} \;

echo "✅ All Button JSX tag fixes completed!"

# Check for remaining mismatches
echo "🔍 Checking for remaining Button/button mismatches..."
remaining=$(find apps/sabo-user/src -name "*.tsx" -exec grep -l "<button.*</Button>\|<Button.*</button>" {} \; 2>/dev/null | wc -l)
if [ "$remaining" -eq 0 ]; then
    echo "No remaining mismatches found!"
else
    echo "⚠️  Still found $remaining files with mismatches"
    find apps/sabo-user/src -name "*.tsx" -exec grep -l "<button.*</Button>\|<Button.*</button>" {} \; 2>/dev/null
fi
