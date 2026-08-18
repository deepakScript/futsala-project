import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminCustomerService } from '../services/customers.service';

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.venueOwner!.id;
  const { search, cursor, limit } = req.query as {
    search?: string;
    cursor?: string;
    limit?: string;
  };

  const result = await adminCustomerService.getCustomers({
    ownerId,
    search,
    cursor,
    limit: limit ? parseInt(limit, 10) : 10,
  });

  res.json(result);
});
