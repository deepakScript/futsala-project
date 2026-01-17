import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const connectionString = `${process.env.DATABASE_URL}`
  console.log('Initializing Prisma with connection string:', connectionString ? connectionString.substring(0, 20) + '...' : 'MISSING');

  try {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
