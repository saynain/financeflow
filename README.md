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
cp .env.example .env
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

## Contributing

Contributions are welcome! Please read our [[Contributing Guide]] for details.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
