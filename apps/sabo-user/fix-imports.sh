#!/bin/bash

echo "Fixing import paths in user app..."

# Navigate to the user app src directory
cd "/workspaces/sabo-pool-v12/apps/sabo-user/src"

# Fix relative imports that should be absolute
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e "s|from '\./components/|from '@/components/|g" \
  -e "s|from '\./hooks/|from '@/hooks/|g" \
  -e "s|from '\./utils/|from '@/utils/|g" \
  -e "s|from '\./lib/|from '@/lib/|g" \
  -e "s|from '\./types/|from '@/types/|g" \
  -e "s|from '\./contexts/|from '@/contexts/|g" \
  -e "s|from '\./services/|from '@/services/|g" \
  -e "s|from '\./constants/|from '@/constants/|g" \
  -e "s|from '\./config/|from '@/config/|g" \
  -e "s|from '\./integrations/|from '@/integrations/|g" \
  -e "s|from '\./styles/|from '@/styles/|g"

# Fix imports that are missing the @ prefix but should have it
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e "s|from 'components/|from '@/components/|g" \
  -e "s|from 'hooks/|from '@/hooks/|g" \
  -e "s|from 'utils/|from '@/utils/|g" \
  -e "s|from 'lib/|from '@/lib/|g" \
  -e "s|from 'types/|from '@/types/|g" \
  -e "s|from 'contexts/|from '@/contexts/|g" \
  -e "s|from 'services/|from '@/services/|g" \
  -e "s|from 'constants/|from '@/constants/|g" \
  -e "s|from 'config/|from '@/config/|g" \
  -e "s|from 'integrations/|from '@/integrations/|g" \
  -e "s|from 'styles/|from '@/styles/|g"

# Fix double relative imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e "s|from '\.\./\.\./components/|from '@/components/|g" \
  -e "s|from '\.\./\.\./hooks/|from '@/hooks/|g" \
  -e "s|from '\.\./\.\./utils/|from '@/utils/|g" \
  -e "s|from '\.\./\.\./lib/|from '@/lib/|g" \
  -e "s|from '\.\./\.\./types/|from '@/types/|g" \
  -e "s|from '\.\./\.\./contexts/|from '@/contexts/|g" \
  -e "s|from '\.\./\.\./services/|from '@/services/|g" \
  -e "s|from '\.\./\.\./constants/|from '@/constants/|g" \
  -e "s|from '\.\./\.\./config/|from '@/config/|g" \
  -e "s|from '\.\./\.\./integrations/|from '@/integrations/|g"

# Fix triple relative imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e "s|from '\.\./\.\./\.\./components/|from '@/components/|g" \
  -e "s|from '\.\./\.\./\.\./hooks/|from '@/hooks/|g" \
  -e "s|from '\.\./\.\./\.\./utils/|from '@/utils/|g" \
  -e "s|from '\.\./\.\./\.\./lib/|from '@/lib/|g" \
  -e "s|from '\.\./\.\./\.\./types/|from '@/types/|g" \
  -e "s|from '\.\./\.\./\.\./contexts/|from '@/contexts/|g" \
  -e "s|from '\.\./\.\./\.\./services/|from '@/services/|g" \
  -e "s|from '\.\./\.\./\.\./constants/|from '@/constants/|g" \
  -e "s|from '\.\./\.\./\.\./config/|from '@/config/|g" \
  -e "s|from '\.\./\.\./\.\./integrations/|from '@/integrations/|g"

echo "Import path fixing completed!"
