import { Request, Response } from "express";
import prisma from "../../../config/prismaClient";

export const listPayments = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const method = req.query.method as string | undefined;

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (method) where.paymentMethod = method;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            user: { select: { fullName: true, email: true } },
            court: {
              include: { venue: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ payments });
  } catch (error) {
    console.error("Fetch Payments Error:", error);
    return res.status(500).json({ error: "Failed to fetch payments" });
  }
};

export const getPaymentStats = async (_req: Request, res: Response) => {
  try {
    const [totalPaid, totalRefunded] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID" },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "REFUNDED" },
      }),
    ]);

    const totalRevenue = totalPaid._sum.amount || 0;
    const totalRefundedAmt = totalRefunded._sum.amount || 0;
    const totalCommission = totalRevenue * 0.02;
    const netPlatformRevenue = totalCommission - totalRefundedAmt * 0.02;

    return res.json({
      totalRevenue,
      totalCommission,
      totalRefunded: totalRefundedAmt,
      netPlatformRevenue,
    });
  } catch (error) {
    console.error("Payment Stats Error:", error);
    return res.status(500).json({ error: "Failed to fetch payment statistics" });
  }
};

export const getPayouts = async (_req: Request, res: Response) => {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        courts: {
          include: {
            bookings: {
              where: {
                paymentStatus: "PAID",
                status: "COMPLETED",
              },
              include: { payment: true },
            },
          },
        },
        owner: { select: { fullName: true, email: true } },
      },
    });

    const payoutData = venues.map((venue) => {
      let grossRevenue = 0;
      venue.courts.forEach((court) => {
        court.bookings.forEach((booking) => {
          grossRevenue += booking.totalPrice;
        });
      });

      const commission = grossRevenue * 0.1;
      const netPayout = grossRevenue - commission;

      return {
        venueId: venue.id,
        venueName: venue.name,
        ownerName: venue.owner.fullName,
        ownerEmail: venue.owner.email,
        grossRevenue,
        commission,
        netPayout,
      };
    });

    return res.json({ payouts: payoutData });
  } catch (error) {
    console.error("Payouts Error:", error);
    return res.status(500).json({ error: "Failed to fetch payout data" });
  }
};
