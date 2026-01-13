import { PrismaClient } from '@prisma/client'

try {
  const prisma = new PrismaClient()
  console.log('Successfully imported and instantiated PrismaClient!')
  process.exit(0)
} catch (error) {
  console.error('Failed to instantiate PrismaClient:', error)
  process.exit(1)
}
