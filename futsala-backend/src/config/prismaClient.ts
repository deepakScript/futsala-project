import { PrismaClient } from '@prisma/client';
import env from './env.config';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

// Handle connection errors gracefully
prisma
  .$connect()
  .then(() => {
    console.log('✅ Connected to Neon PostgreSQL (Prisma)');
  })
  .catch((error: any) => {
    console.error('❌ Failed to connect to database (Prisma):', error.message);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Disconnected from database');
});

export default prisma;
