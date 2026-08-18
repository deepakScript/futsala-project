import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminOwnersService } from '../services/owners.service';
import { parseCursorPagination } from '../utils/pagination';

export const listOwners = asyncHandler(async (req: Request, res: Response) => {
  const paginationParams = parseCursorPagination(req.query as Record<string, unknown>);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const result = await superAdminOwnersService.listOwners({ ...paginationParams, search });
  res.json({ owners: result.data, pagination: result.pagination });
});

export const createOwner = asyncHandler(async (req: Request, res: Response) => {
  const owner = await superAdminOwnersService.createOwner(req.body);
  res.status(201).json({ owner });
});

export const getOwner = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const owner = await superAdminOwnersService.getOwner(id);
  res.json({ owner });
});

export const patchOwner = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const owner = await superAdminOwnersService.updateOwner(id, req.body);
  res.json({ owner });
});

export const deleteOwner = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await superAdminOwnersService.deleteOwner(id);
  res.json({ success: true });
});

export const getOwnerPerformance = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const performance = await superAdminOwnersService.getOwnerPerformance(id);
  res.json({ performance });
});

