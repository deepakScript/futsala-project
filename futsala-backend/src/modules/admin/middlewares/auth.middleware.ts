import { Request, Response, NextFunction } from 'express';
import { AdminTokenPayload, validateAccessToken } from '../../../utils/jwt';

const extractToken = (req: Request): string | undefined =>
  req.cookies?.token ||
  req.cookies?.accessToken ||
  (req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : undefined);

/**
 * Validates the 15-min access token:
 *  1. Verifies JWT signature + expiry.
 *  2. Confirms the token is whitelisted in Redis (access_token:{userId}).
 */
export const requireVenueOwner = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = await validateAccessToken<AdminTokenPayload & { id?: string }>(token);
  if (!decoded || decoded.role !== 'TENANT_ADMIN') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.venueOwner = decoded;
  next();
};

export const requireAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = await validateAccessToken<AdminTokenPayload & { id?: string }>(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.venueOwner = decoded;
  next();
};
