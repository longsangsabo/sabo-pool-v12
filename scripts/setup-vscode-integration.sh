#!/bin/bash

# 🛠️ VS CODE INTEGRATION SETUP
# Tự động setup VS Code để reference design system khi tạo file mới

echo "🔧 Setting up VS Code Design System Integration..."

# Tạo VS Code settings cho workspace
mkdir -p /workspaces/sabo-pool-v12/.vscode

# VS Code Settings
cat > /workspaces/sabo-pool-v12/.vscode/settings.json << 'EOF'
{
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.jsx": "javascriptreact"
  },
  "emmet.includeLanguages": {
    "typescriptreact": "html",
    "javascriptreact": "html"
  },
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/backup": true,
    "**/*_backup_*": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/backup": true,
    "**/*_backup_*": true
  }
}
EOF

# VS Code Snippets cho Design System
mkdir -p /workspaces/sabo-pool-v12/.vscode/snippets

# React Component Snippets
cat > /workspaces/sabo-pool-v12/.vscode/snippets/react-design-system.json << 'EOF'
{
  "Design System React Component": {
    "prefix": "dsreact",
    "body": [
      "import React from 'react';",
      "import { Typography, Button } from '@/packages/shared-ui';",
      "import '@/packages/shared-ui/src/styles/design-system.css';",
      "",
      "// 🎨 Design System Component - Auto-generated",
      "// 📖 Quick Guide: /docs/QUICK_START_GUIDE.md",
      "",
      "interface ${1:ComponentName}Props {",
      "  $2",
      "}",
      "",
      "export const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = ({",
      "  $3",
      "}) => {",
      "  return (",
      "    <div className=\"space-y-16 p-20\">",
      "      <Typography variant=\"heading\" size=\"lg\">",
      "        ${4:Component Title}",
      "      </Typography>",
      "      ",
      "      <Typography variant=\"body\" size=\"md\" color=\"muted\">",
      "        ${5:Component description}",
      "      </Typography>",
      "      ",
      "      <div className=\"flex gap-12\">",
      "        <Button variant=\"primary\" size=\"md\">",
      "          ${6:Primary Action}",
      "        </Button>",
      "      </div>",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:ComponentName};"
    ],
    "description": "Create a React component with Design System integration"
  },
  
  "Design System Page Layout": {
    "prefix": "dspage",
    "body": [
      "import React from 'react';",
      "import { Typography } from '@/packages/shared-ui';",
      "import '@/packages/shared-ui/src/styles/design-system.css';",
      "",
      "// 🎨 Design System Page - Auto-generated",
      "// 📖 Quick Guide: /docs/QUICK_START_GUIDE.md",
      "",
      "export const ${1:PageName}: React.FC = () => {",
      "  return (",
      "    <div className=\"container mx-auto p-24\">",
      "      <Typography variant=\"heading\" size=\"2xl\" className=\"mb-16\">",
      "        ${2:Page Title}",
      "      </Typography>",
      "      ",
      "      <div className=\"space-y-24\">",
      "        ${3:// Page content}",
      "      </div>",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:PageName};"
    ],
    "description": "Create a page layout with Design System structure"
  },

  "Design System Card": {
    "prefix": "dscard",
    "body": [
      "<div className=\"bg-white rounded-lg border border-gray-200 p-20 space-y-12\">",
      "  <Typography variant=\"heading\" size=\"lg\">",
      "    ${1:Card Title}",
      "  </Typography>",
      "  ",
      "  <Typography variant=\"body\" size=\"sm\" color=\"muted\">",
      "    ${2:Card description}",
      "  </Typography>",
      "  ",
      "  <Button variant=\"primary\" size=\"sm\">",
      "    ${3:Action}",
      "  </Button>",
      "</div>"
    ],
    "description": "Create a card component with Design System styling"
  },

  "Design System Form": {
    "prefix": "dsform",
    "body": [
      "<form className=\"space-y-20\">",
      "  <div className=\"space-y-8\">",
      "    <Typography variant=\"body\" size=\"sm\" weight=\"medium\">",
      "      ${1:Label}",
      "    </Typography>",
      "    <input className=\"w-full p-12 border border-gray-300 rounded-md\" />",
      "  </div>",
      "  ",
      "  <div className=\"flex gap-12\">",
      "    <Button variant=\"primary\" size=\"md\">Submit</Button>",
      "    <Button variant=\"secondary\" size=\"md\">Cancel</Button>",
      "  </div>",
      "</form>"
    ],
    "description": "Create a form with Design System styling"
  },

  "Design System Import": {
    "prefix": "dsimport",
    "body": [
      "import { Typography, Button, ProgressBar } from '@/packages/shared-ui';",
      "import '@/packages/shared-ui/src/styles/design-system.css';"
    ],
    "description": "Import Design System components"
  }
}
EOF

# CSS Snippets
cat > /workspaces/sabo-pool-v12/.vscode/snippets/css-design-system.json << 'EOF'
{
  "Design System CSS Component": {
    "prefix": "dscss",
    "body": [
      "/* 🎨 Design System CSS - Auto-generated */",
      "/* 📖 Quick Guide: /docs/QUICK_START_GUIDE.md */",
      "",
      "@import '@/packages/shared-ui/src/styles/design-system.css';",
      "",
      ".${1:component-name} {",
      "  /* 🎯 Use design token spacing */",
      "  padding: var(--space-20);",
      "  margin-bottom: var(--space-16);",
      "  ",
      "  /* 🎯 Use semantic colors */",
      "  background-color: var(--color-surface-primary);",
      "  border: 1px solid var(--color-border-subtle);",
      "  border-radius: var(--radius-md);",
      "  ",
      "  /* 🎯 Use typography tokens */",
      "  font-family: var(--font-family-body);",
      "  font-size: var(--font-size-body-md);",
      "  line-height: var(--line-height-body-md);",
      "  color: var(--color-text-primary);",
      "}"
    ],
    "description": "Create CSS with Design System tokens"
  },

  "Design System Spacing": {
    "prefix": "dsspace",
    "body": [
      "/* 8px Grid Spacing */",
      "margin: var(--space-${1:16});",
      "padding: var(--space-${2:12});"
    ],
    "description": "Add Design System spacing"
  },

  "Design System Typography": {
    "prefix": "dstypo",
    "body": [
      "/* Design System Typography */",
      "font-family: var(--font-family-${1:body});",
      "font-size: var(--font-size-${2:body}-${3:md});",
      "font-weight: var(--font-weight-${4:normal});",
      "line-height: var(--line-height-${2:body}-${3:md});",
      "color: var(--color-text-${5:primary});"
    ],
    "description": "Add Design System typography"
  },

  "Design System Colors": {
    "prefix": "dscolor",
    "body": [
      "/* Design System Colors */",
      "color: var(--color-${1:text}-${2:primary});",
      "background-color: var(--color-${3:surface}-${4:primary});",
      "border-color: var(--color-${5:border}-${6:subtle});"
    ],
    "description": "Add Design System colors"
  }
}
EOF

# Tasks.json for quick commands
cat > /workspaces/sabo-pool-v12/.vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Design System: Show Quick Guide",
      "type": "shell",
      "command": "bash",
      "args": [
        "/workspaces/sabo-pool-v12/scripts/auto-reference-design-system.sh",
        "--guide"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Design System: Create React Template",
      "type": "shell",
      "command": "bash",
      "args": [
        "/workspaces/sabo-pool-v12/scripts/auto-reference-design-system.sh",
        "${input:filePath}",
        "template"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Design System: Open Documentation",
      "type": "shell",
      "command": "code",
      "args": [
        "/workspaces/sabo-pool-v12/docs/QUICK_START_GUIDE.md"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "silent",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "filePath",
      "description": "Enter the file path for the new component",
      "default": "src/components/NewComponent.tsx",
      "type": "promptString"
    }
  ]
}
EOF

echo "✅ VS Code integration setup complete!"
echo ""
echo "🎯 Available Features:"
echo "  📝 Code Snippets:"
echo "    - 'dsreact' - Create React component with design system"
echo "    - 'dspage' - Create page layout with design system"
echo "    - 'dscard' - Create card component"
echo "    - 'dsform' - Create form with design system"
echo "    - 'dsimport' - Import design system components"
echo "    - 'dscss' - Create CSS with design tokens"
echo ""
echo "  🔧 VS Code Tasks:"
echo "    - Ctrl+Shift+P → 'Tasks: Run Task' → 'Design System: Show Quick Guide'"
echo "    - Ctrl+Shift+P → 'Tasks: Run Task' → 'Design System: Create React Template'"
echo "    - Ctrl+Shift+P → 'Tasks: Run Task' → 'Design System: Open Documentation'"
echo ""
echo "  ⚡ Quick Access:"
echo "    - Type 'dsreact' in .tsx file and press Tab"
echo "    - Type 'dscard' for quick card component"
echo "    - Type 'dscss' in .css file for design system CSS"
echo ""
