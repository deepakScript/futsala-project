import { adminCustomerRepository } from '../repositories/customers.repository';

export class AdminCustomerService {
  async getCustomers(params: {
    ownerId: string;
    search?: string;
    cursor?: string;
    limit?: number;
  }) {
    return adminCustomerRepository.findCustomersForOwner(params);
  }
}

export const adminCustomerService = new AdminCustomerService();
