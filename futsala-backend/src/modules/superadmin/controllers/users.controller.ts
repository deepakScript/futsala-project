import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminUsersService } from '../services/users.service';
import { parseCursorPagination } from '../utils/pagination';

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const paginationParams = parseCursorPagination(req.query as Record<string, unknown>);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const result = await superAdminUsersService.listCustomers({ ...paginationParams, search });
  res.json({ users: result.data, pagination: result.pagination });
});

export const listOwnersSimple = asyncHandler(async (_req: Request, res: Response) => {
  const { superAdminOwnersService } = await import('../services/owners.service');
  const owners = await superAdminOwnersService.listOwnersSimple();
  res.json({ owners });
});

export const patchUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const isVerified = req.body.isVerified ?? req.body.isActive;
  const user = await superAdminUsersService.updateStatus(id, isVerified);
  res.json(user);
});

export const getUserBookings = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const bookings = await superAdminUsersService.getUserBookings(id);
  res.json(bookings);
});

