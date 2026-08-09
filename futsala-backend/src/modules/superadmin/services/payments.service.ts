import { superAdminPaymentsRepository } from '../repositories/payments.repository';

const COMMISSION_RATE = 0.1;
const PLATFORM_FEE_RATE = 0.02;

export class SuperAdminPaymentsService {
  async listPayments(params: { status?: string; method?: string }) {
    return superAdminPaymentsRepository.listAll(params);
  }

  async getPaymentStats() {
    const { totalPaid, totalRefunded } = await superAdminPaymentsRepository.getAggregatePaidRefunded();
    const totalCommission = totalPaid * PLATFORM_FEE_RATE;
    const netPlatformRevenue = totalCommission - totalRefunded * PLATFORM_FEE_RATE;

    return { totalRevenue: totalPaid, totalCommission, totalRefunded, netPlatformRevenue };
  }

  async getPayouts() {
    const venues = await superAdminPaymentsRepository.getVenuePayouts();

    return venues.map((venue) => {
      let grossRevenue = 0;
      venue.courts.forEach((court) => {
        court.bookings.forEach((booking) => {
          grossRevenue += booking.totalPrice;
        });
      });
      const commission = grossRevenue * COMMISSION_RATE;
      return {
        venueId: venue.id,
        venueName: venue.name,
        ownerName: venue.owner.fullName,
        ownerEmail: venue.owner.email,
        grossRevenue,
        commission,
        netPayout: grossRevenue - commission,
      };
    });
  }
}

export const superAdminPaymentsService = new SuperAdminPaymentsService();
