import { Request, Response, NextFunction } from "express";

/**
 * Middleware factory that enforces role-based access control.
 *
 * @param allowedRoles - Array of roles permitted to access the route.
 *   - 'VENUE_OWNER'  → Admin panel
 *   - 'ADMIN'        → Superadmin panel
 *
 * @example
 *   router.use(verifyToken, requireRole(['VENUE_OWNER']));
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized: no user attached to request" });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        message: `Forbidden: requires one of [${allowedRoles.join(", ")}] role`,
      });
      return;
    }

    next();
  };
};
