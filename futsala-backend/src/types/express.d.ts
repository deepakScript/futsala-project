import { AdminTokenPayload, SuperAdminTokenPayload } from '../utils/jwt';
import { JwtPayload } from 'jsonwebtoken';

export interface DecodedUser extends JwtPayload {
  userId: string;
  email?: string;
  role: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    /** Mobile app JWT user (Bearer / access token) */
    user?: DecodedUser;
    /** Venue owner panel session */
    venueOwner?: AdminTokenPayload;
    /** Platform super admin session */
    platformAdmin?: SuperAdminTokenPayload;
  }
}
