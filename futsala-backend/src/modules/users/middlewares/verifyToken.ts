import { Request, Response, NextFunction } from 'express';
import { DecodedUser } from '../../../types/express';
import { validateAccessToken } from '../../../utils/jwt';

/**
 * Verifies the 15-minute access token:
 *  1. Checks JWT signature & expiry.
 *  2. Confirms the token is whitelisted in Redis (access_token:{userId}).
 *     Once expired or after logout, the Redis key is gone → automatically rejected.
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.header('Authorization');
  const token =
    req.cookies?.token ||
    req.cookies?.accessToken ||
    req.cookies?.['auth-token'] ||
    (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined);

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const decoded = await validateAccessToken<DecodedUser>(token);
  if (!decoded) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  req.user = decoded;
  next();
};
