import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DecodedUser } from '../../../types/express';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'your-default-secret-key';

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');
  const token =
    req.cookies?.token || req.cookies?.['auth-token'] || (authHeader && authHeader.split(' ')[1]);

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', (error as Error).message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
