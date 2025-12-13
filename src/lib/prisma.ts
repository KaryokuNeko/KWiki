/**
 * Prisma Client Singleton
 * Ensures a single instance of PrismaClient is used across the application
 * to avoid connection pool exhaustion during development (hot reload)
 */

import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: pg.Pool }

// Create connection pool for Prisma adapter
const pool = globalForPrisma.pool || new Pool({
  connectionString: process.env.DATABASE_URL
})

// Create Prisma adapter with the pool
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  adapter,
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}

export default prisma
