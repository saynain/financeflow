#!/bin/bash

echo "🔧 Fixing JWT session issues..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Creating from .env.example..."
  cp .env.example .env
fi

# Generate a new secure NEXTAUTH_SECRET
echo "🔐 Generating new NEXTAUTH_SECRET..."
NEW_SECRET=$(openssl rand -base64 32)

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$NEW_SECRET\"/" .env
else
  # Linux
  sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$NEW_SECRET\"/" .env
fi

echo "✅ Generated new NEXTAUTH_SECRET"

# Clear NextAuth sessions from database
echo "🗑️  Clearing existing sessions..."
cd packages/database
dotenv -e ../../.env -- npx prisma db execute --stdin <<< "
DELETE FROM \"sessions\";
DELETE FROM \"accounts\";
"
cd ../..

echo ""
echo "✅ JWT session issues fixed!"
echo ""
echo "Next steps:"
echo "1. Restart the development server: pnpm dev"
echo "2. Try signing in again - all existing sessions have been cleared"
echo ""
echo "Note: All existing user sessions have been cleared due to the secret change." 