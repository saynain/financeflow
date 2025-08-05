# FinanceFlow

A modern, open-source budget and expense planning web application built with Next.js, TypeScript, and PostgreSQL.

## Features

- 📊 Beautiful dashboard with statistics and graphs
- 💼 Budget planning with category grouping
- 💳 Expense tracking
- 🏦 Savings goals management
- 🔒 Secure authentication
- 📱 Responsive design
- 🐳 Easy deployment with Docker

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- PNPM 8+
- Docker and Docker Compose (for database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/financeflow.git
cd financeflow
```


2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
# Option 1: Use the setup script (recommended)
./setup.sh
# or
pnpm setup

# Option 2: Manual setup
cp .env.example .env
# Generate a secure NEXTAUTH_SECRET
openssl rand -base64 32
# Update .env with the generated secret
```

4. Start the database
```bash
docker compose up -d
```

5. Run migrations
```bash
pnpm db:migrate
```

6. Start the development server
```bash
pnpm dev
```

Visit http://localhost:3000 to see the application.

## Troubleshooting

### NextAuth Secret Error
If you see `[next-auth][error][NO_SECRET]` errors, make sure you have a secure `NEXTAUTH_SECRET` in your `.env` file. You can generate one with:
```bash
openssl rand -base64 32
```

Or run the fix script:
```bash
./fix-env.sh
# or
pnpm fix-env
```

### Database Connection Issues
If you encounter database connection issues:
1. Make sure Docker is running
2. Check that the database containers are up: `docker compose ps`
3. Verify your `DATABASE_URL` in `.env` matches the Docker Compose configuration
4. If you get "Environment variable not found: DATABASE_URL" errors, run: `./fix-env.sh`

### Environment Variables
The application requires these environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secure random string for session encryption
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Optional, for Google OAuth

## Contributing

Contributions are welcome! Please read our [[Contributing Guide]] for details.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
