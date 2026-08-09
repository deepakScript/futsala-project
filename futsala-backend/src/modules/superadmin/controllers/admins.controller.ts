import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminAdminsService } from '../services/admins.service';

export const listAdmins = asyncHandler(async (_req: Request, res: Response) => {
  const admins = await superAdminAdminsService.listAdmins();
  res.json({ admins });
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
