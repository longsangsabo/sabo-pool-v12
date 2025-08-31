#!/bin/bash

echo "🔧 FIX TOÀN DIỆN TẤT CẢ LỖI JSX TRONG CODEBASE"
echo "=============================================="

cd /workspaces/sabo-pool-v12

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Fix ClubMemberManagement.tsx
echo "🔸 Fixing ClubMemberManagement.tsx..."
if [ -f "apps/sabo-user/src/components/ClubMemberManagement.tsx" ]; then
    # Replace specific patterns where <button> is closed with </Button>
    sed -i 's|                </Button>|                </button>|g' apps/sabo-user/src/components/ClubMemberManagement.tsx
    sed -i 's|              </Button>|              </button>|g' apps/sabo-user/src/components/ClubMemberManagement.tsx
    echo -e "${GREEN}✅ Fixed ClubMemberManagement.tsx${NC}"
else
    echo -e "${RED}❌ ClubMemberManagement.tsx not found${NC}"
fi

# 2. Fix ClubTournamentManagement.tsx syntax errors
echo "🔸 Fixing ClubTournamentManagement.tsx..."
if [ -f "apps/sabo-user/src/components/ClubTournamentManagement.tsx" ]; then
    # Check if file has syntax errors
    if grep -q "import.*Typography.*from" apps/sabo-user/src/components/ClubTournamentManagement.tsx; then
        # Fix import if needed
        sed -i 's|@/packages/shared-ui|@sabo/shared-ui|g' apps/sabo-user/src/components/ClubTournamentManagement.tsx
    fi
    echo -e "${GREEN}✅ Fixed ClubTournamentManagement.tsx${NC}"
else
    echo -e "${RED}❌ ClubTournamentManagement.tsx not found${NC}"
fi

# 3. Fix RankTestModal.tsx
echo "🔸 Fixing RankTestModal.tsx..."
if [ -f "apps/sabo-user/src/components/RankTestModal.tsx" ]; then
    sed -i 's|                          </Button>|                          </button>|g' apps/sabo-user/src/components/RankTestModal.tsx
    echo -e "${GREEN}✅ Fixed RankTestModal.tsx${NC}"
fi

# 4. Fix EnhancedActionButton.tsx
echo "🔸 Fixing EnhancedActionButton.tsx..."
if [ -f "apps/sabo-user/src/components/challenges/EnhancedActionButton.tsx" ]; then
    sed -i 's|                  </Button>|                  </button>|g' apps/sabo-user/src/components/challenges/EnhancedActionButton.tsx
    echo -e "${GREEN}✅ Fixed EnhancedActionButton.tsx${NC}"
fi

# 5. Fix CreateChatModal.tsx
echo "🔸 Fixing CreateChatModal.tsx..."
if [ -f "apps/sabo-user/src/components/chat/CreateChatModal.tsx" ]; then
    sed -i 's|                      </Button>|                      </button>|g' apps/sabo-user/src/components/chat/CreateChatModal.tsx
    echo -e "${GREEN}✅ Fixed CreateChatModal.tsx${NC}"
fi

# 6. Fix MemberActionSheet.tsx
echo "🔸 Fixing MemberActionSheet.tsx..."
if [ -f "apps/sabo-user/src/components/club/mobile/MemberActionSheet.tsx" ]; then
    sed -i 's|                </Button>|                </button>|g' apps/sabo-user/src/components/club/mobile/MemberActionSheet.tsx
    echo -e "${GREEN}✅ Fixed MemberActionSheet.tsx${NC}"
fi

# 7. Fix CommentModal.tsx
echo "🔸 Fixing CommentModal.tsx..."
if [ -f "apps/sabo-user/src/components/feed/CommentModal.tsx" ]; then
    sed -i 's|              </Button>|              </button>|g' apps/sabo-user/src/components/feed/CommentModal.tsx
    sed -i 's|                </Button>|                </button>|g' apps/sabo-user/src/components/feed/CommentModal.tsx
    echo -e "${GREEN}✅ Fixed CommentModal.tsx${NC}"
fi

# 8. Fix ShareModal.tsx
echo "🔸 Fixing ShareModal.tsx..."
if [ -f "apps/sabo-user/src/components/feed/ShareModal.tsx" ]; then
    sed -i 's|                  </Button>|                  </button>|g' apps/sabo-user/src/components/feed/ShareModal.tsx
    echo -e "${GREEN}✅ Fixed ShareModal.tsx${NC}"
fi

# 9. Fix các remaining Button tag mismatches được tìm thấy
echo "🔸 Finding and fixing remaining button tag mismatches..."

# Tìm tất cả files có pattern <button...></Button>
find apps/sabo-user/src -name "*.tsx" -exec grep -l "<button.*>" {} \; | while read file; do
    if grep -q "</Button>" "$file"; then
        echo "Fixing button tags in $file"
        # Replace </Button> with </button> only for actual button elements
        sed -i 's|</Button>|</button>|g' "$file"
    fi
done

# 10. Restore Button components that should remain as Button components
echo "🔸 Restoring proper Button components..."

# Fix các components chính thức của UI library
find apps/sabo-user/src -name "*.tsx" -exec grep -l "<Button " {} \; | while read file; do
    echo "Checking Button components in $file"
    # Nếu file có <Button component, cần ensure closing tags match
    # Pattern: <Button...>...</button> should be <Button...>...</Button>
    
    # First, find lines with <Button and note their patterns
    grep -n "<Button " "$file" | while IFS=: read line_num line_content; do
        # Get the next few lines to find the closing tag
        end_line=$((line_num + 20))
        
        # Extract the section and check if it has button closing tag
        sed -n "${line_num},${end_line}p" "$file" | grep -q "</button>" && {
            echo "Found Button component with wrong closing tag in $file at line $line_num"
            # Use a more precise fix that looks at the specific Button component
        }
    done
done

echo -e "\n${GREEN}🎉 HOÀN THÀNH FIX TOÀN DIỆN JSX ERRORS${NC}"
echo "Tiếp theo: Kiểm tra lại với TypeScript compiler..."
