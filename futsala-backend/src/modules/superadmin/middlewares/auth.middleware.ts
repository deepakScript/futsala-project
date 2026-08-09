import { Request, Response, NextFunction } from 'express';
import { SuperAdminTokenPayload, verifyToken } from '../../../utils/jwt';

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.['auth-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = verifyToken<SuperAdminTokenPayload>(token);
  if (!decoded || decoded.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.platformAdmin = decoded;
  next();
};
