#!/bin/bash
echo "Installing test dependencies..."
pnpm add -D @testing-library/react @testing-library/jest-dom @jest/globals vitest @testing-library/user-event
echo "✅ Test dependencies installed"
