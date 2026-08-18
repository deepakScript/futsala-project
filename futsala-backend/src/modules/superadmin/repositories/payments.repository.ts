import prisma from '../../../config/prismaClient';

export class SuperAdminPaymentsRepository {
  async listAll(params: { cursor?: string; limit: number; status?: string; method?: string }) {
    const where: Record<string, string> = {};
    if (params.status) where.status = params.status;
    if (params.method) where.paymentMethod = params.method;

    return prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            user: { select: { fullName: true, email: true } },
            court: { include: { venue: { select: { name: true } } } },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });
  }

  async getAggregatePaidRefunded() {
    const [totalPaid, totalRefunded] = await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'REFUNDED' } }),
    ]);
    return {
      totalPaid: totalPaid._sum.amount || 0,
      totalRefunded: totalRefunded._sum.amount || 0,
    };
  }

  async getVenuePayouts() {
    return prisma.venue.findMany({
      include: {
        courts: {
          include: {
            bookings: {
              where: { paymentStatus: 'PAID', status: 'COMPLETED' },
              include: { payment: true },
            },
          },
        },
        owner: { select: { fullName: true, email: true } },
      },
    });
  }
}

export const superAdminPaymentsRepository = new SuperAdminPaymentsRepository();
