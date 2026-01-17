import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('Attempting to connect to:', connectionString.substring(0, 20) + '...')
    const owner = await prisma.user.findFirst({
      where: { role: 'VENUE_OWNER' }
    })

    if (!owner) {
      console.log('No VENUE_OWNER found in database.')
      return
    }

    console.log(`Testing dashboard query for owner: ${owner.fullName} (${owner.id})`)

    const venues = await prisma.venue.findMany({
      where: { ownerId: owner.id },
      include: {
        courts: {
          include: {
            bookings: {
              where: { paymentStatus: 'PAID' },
            },
          },
        },
      },
    });

    console.log(`Found ${venues.length} venues.`)

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueTrendRaw = await prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        court: { venue: { ownerId: owner.id } },
        paymentStatus: 'PAID',
        bookingDate: { gte: sevenDaysAgo },
      },
      _sum: { totalPrice: true },
      orderBy: { bookingDate: 'asc' },
    });

    console.log('Revenue trend results:', revenueTrendRaw)

    const recentBookings = await prisma.booking.findMany({
      where: {
        court: { venue: { ownerId: owner.id } },
      },
      include: {
        user: { select: { fullName: true, email: true } },
        court: { select: { name: true, venue: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`Found ${recentBookings.length} recent bookings.`)

  } catch (error) {
    console.error('Connection failed:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
