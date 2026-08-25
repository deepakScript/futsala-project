import { Request, Response, NextFunction } from 'express';
import { SuperAdminTokenPayload, validateAccessToken } from '../../../utils/jwt';

const extractToken = (req: Request): string | undefined =>
  req.cookies?.['auth-token'] ||
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
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = await validateAccessToken<SuperAdminTokenPayload>(token);
  if (!decoded || (decoded.role !== 'TENANT_ADMIN' && decoded.role !== 'SUPERADMIN')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.platformAdmin = decoded;
  next();
};
