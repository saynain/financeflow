#!/bin/bash

echo "🚀 Setting up FinanceFlow development environment..."

# Check if pnpm is installed
if ! command -v pnpm &>/dev/null; then
  echo "❌ pnpm is not installed. Please install it first:"
  echo "npm install -g pnpm"
  exit 1
fi

# Check if Docker is running
if ! docker info &>/dev/null; then
  echo "❌ Docker is not running. Please start Docker Desktop."
  exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env file from .env.example"
  
  # Generate a secure NEXTAUTH_SECRET if not already set
  if ! grep -q "NEXTAUTH_SECRET=" .env || grep -q "your-secret-key-here" .env; then
    SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$SECRET\"/" .env
    else
      # Linux
      sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$SECRET\"/" .env
    fi
    echo "✅ Generated secure NEXTAUTH_SECRET"
  fi
  
  echo "⚠️  Please update the .env file with your Google OAuth credentials (optional)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start databases
echo "🐳 Starting databases..."
docker-compose up -d

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 5

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with proper values"
echo "2. Run 'pnpm dev' to start the development server"
echo ""
echo "Happy coding! 🎉"
