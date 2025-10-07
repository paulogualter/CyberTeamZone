#!/bin/bash

# Vercel build script
echo "Starting Vercel build..."

# Check if hooks directory exists
if [ ! -d "hooks" ]; then
    echo "ERROR: hooks directory not found!"
    exit 1
fi

# Check if all required hooks exist
required_hooks=("useSubscriptionStatus.ts" "useUserStatus.ts" "useUserEscudos.ts" "usePopupNotifications.ts")

for hook in "${required_hooks[@]}"; do
    if [ ! -f "hooks/$hook" ]; then
        echo "ERROR: hooks/$hook not found!"
        exit 1
    fi
    echo "✓ Found hooks/$hook"
done

echo "All hooks found. Running npm run build..."
npm run build
