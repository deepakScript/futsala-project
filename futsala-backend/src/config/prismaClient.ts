import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Handle connection errors gracefully
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to Neon PostgreSQL');
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error.message);
    // Don't exit process, allow retries
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Disconnected from database');
});

export default prisma;
