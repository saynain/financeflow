#!/bin/bash

# This script runs Prisma commands with the .env file from the root directory
# Usage: ./run-with-env.sh <command>
# Example: ./run-with-env.sh "prisma migrate dev"

if [ -z "$1" ]; then
  echo "Usage: $0 <command>"
  echo "Example: $0 'prisma migrate dev'"
  exit 1
fi

# Check if dotenv-cli is available
if ! command -v dotenv &>/dev/null; then
  echo "Installing dotenv-cli..."
  pnpm add -D dotenv-cli
fi

# Run the command with the root .env file
dotenv -e ../../.env -- $@ 