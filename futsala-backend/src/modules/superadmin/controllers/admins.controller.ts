import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminAdminsService } from '../services/admins.service';
import { parseCursorPagination } from '../utils/pagination';

export const listAdmins = asyncHandler(async (req: Request, res: Response) => {
  const paginationParams = parseCursorPagination(req.query as Record<string, unknown>);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const result = await superAdminAdminsService.listAdmins({ ...paginationParams, search });
  res.json({ admins: result.data, pagination: result.pagination });
});

export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const admin = await superAdminAdminsService.createAdmin(req.body);
  res.status(201).json({ admin });
});

export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const admin = await superAdminAdminsService.updateAdmin(id, req.body);
  res.json({ admin });
});

export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await superAdminAdminsService.deleteAdmin(id);
  res.json({ message: 'Admin deleted successfully' });
});
