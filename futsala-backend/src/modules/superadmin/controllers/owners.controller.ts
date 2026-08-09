import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminOwnersService } from '../services/owners.service';

export const listOwners = asyncHandler(async (_req: Request, res: Response) => {
  const owners = await superAdminOwnersService.listOwners();
  res.json({ owners });
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

