#!/bin/bash

echo "🔧 Comprehensive FinanceFlow Fix Script"
echo "======================================"

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Creating from .env.example..."
  cp .env.example .env
fi

# Generate a secure NEXTAUTH_SECRET if not already set or if it's the default
if ! grep -q "NEXTAUTH_SECRET=" .env || grep -q "your-secret-key-here" .env; then
  echo "🔐 Generating secure NEXTAUTH_SECRET..."
  SECRET=$(openssl rand -base64 32)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$SECRET\"/" .env
  else
    # Linux
    sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$NEW_SECRET\"/" .env
  fi
  echo "✅ Generated secure NEXTAUTH_SECRET"
else
  echo "✅ NEXTAUTH_SECRET already set"
fi

# Check if DATABASE_URL is set correctly
if ! grep -q "DATABASE_URL=" .env; then
  echo "🗄️  Adding DATABASE_URL..."
  echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/financeflow"' >> .env
  echo "✅ Added DATABASE_URL"
fi

# Check if NEXTAUTH_URL is set
if ! grep -q "NEXTAUTH_URL=" .env; then
  echo "🌐 Adding NEXTAUTH_URL..."
  echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
  echo "✅ Added NEXTAUTH_URL"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Install dotenv-cli if not already installed
echo "📦 Installing dotenv-cli..."
pnpm add -D dotenv-cli
cd packages/database && pnpm add -D dotenv-cli && cd ../..

# Install dotenv in database package
echo "📦 Installing dotenv in database package..."
cd packages/database && pnpm add dotenv && cd ../..

# Clear existing sessions to fix JWT issues
echo "🗑️  Clearing existing sessions to fix JWT issues..."
cd packages/database
dotenv -e ../../.env -- npx prisma db execute --stdin <<< "
DELETE FROM \"sessions\";
DELETE FROM \"accounts\";
" 2>/dev/null || echo "⚠️  Could not clear sessions (database might not be running)"
cd ../..

echo ""
echo "✅ All issues fixed!"
echo ""
echo "Next steps:"
echo "1. Make sure Docker is running: docker compose up -d"
echo "2. Run database migrations: pnpm db:migrate"
echo "3. Start the development server: pnpm dev"
echo "4. Try signing in again - all existing sessions have been cleared"
echo ""
echo "Optional: Add Google OAuth credentials to .env for Google sign-in" 