export * from '@prisma/client'
export { PrismaClient } from '@prisma/client'

import { PrismaClient } from '@prisma/client'

// Load environment variables from the root .env file
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env from the root directory
config({ path: resolve(__dirname, '../../.env') })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
