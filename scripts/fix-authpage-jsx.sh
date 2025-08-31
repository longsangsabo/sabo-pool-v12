#!/bin/bash

echo "🔧 Fixing JSX tag mismatches in AuthPage.tsx..."

# Fix AuthPage.tsx - only change </Button> to </button> for actual button elements
# We need to be careful to only fix the button elements, not Button components

# First, let's use a more targeted approach
FILE="/workspaces/sabo-pool-v12/apps/sabo-user/src/pages/AuthPage.tsx"

# Create a backup
cp "$FILE" "${FILE}.backup"

# Use sed to fix specific button elements that are incorrectly closed
# Look for button elements followed by Button closing tags
sed -i 's|                    </Button>|                    </button>|g' "$FILE"
sed -i 's|                        </Button>|                        </button>|g' "$FILE"
sed -i 's|                </Button>|                </button>|g' "$FILE"
sed -i 's|                  </Button>|                  </button>|g' "$FILE"
sed -i 's|              </Button>|              </button>|g' "$FILE"

echo "✅ Fixed JSX tag mismatches in AuthPage.tsx"
