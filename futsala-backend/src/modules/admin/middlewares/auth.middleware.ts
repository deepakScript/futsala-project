import { Request, Response, NextFunction } from 'express';
import { AdminTokenPayload, verifyToken } from '../../../utils/jwt';

export const requireVenueOwner = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = verifyToken<AdminTokenPayload>(token);
  if (!decoded || decoded.role !== 'VENUE_OWNER') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.venueOwner = decoded;
  next();
};

export const requireAdminUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = verifyToken<AdminTokenPayload>(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.venueOwner = decoded;
  next();
};
