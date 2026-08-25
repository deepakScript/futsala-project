import { superAdminPaymentsRepository } from '../repositories/payments.repository';
import { buildCursorPage, CursorPaginationParams } from '../utils/pagination';

const COMMISSION_RATE = 0.02;
const PLATFORM_FEE_RATE = 0.02;

export class SuperAdminPaymentsService {
  async listPayments(params: CursorPaginationParams & { status?: string; method?: string }) {
    const payments = await superAdminPaymentsRepository.listAll(params);
    return buildCursorPage(payments, params.limit);
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
          grossRevenue += Number(booking.totalPrice);
        });
      });
      const commission = grossRevenue * COMMISSION_RATE;
      const owner = venue.tenant?.users?.[0];
      return {
        venueId: venue.id,
        venueName: venue.name,
        ownerName: owner?.fullName || venue.tenant?.name || 'Unknown',
        ownerEmail: owner?.email || 'N/A',
        grossRevenue,
        commission,
        netPayout: grossRevenue - commission,
      };
    });
  }
}

export const superAdminPaymentsService = new SuperAdminPaymentsService();
