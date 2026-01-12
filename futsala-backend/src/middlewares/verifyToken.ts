import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'your-default-secret-key';


// Define the type of decoded token payload
interface DecodedUser extends JwtPayload {
  userId: string;
  email?: string;
  role: string;
}

// Extend Express Request type to include `user`
declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedUser;
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`[verifyToken] Headers:`, JSON.stringify(req.headers, null, 2));
  
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.warn(`[verifyToken] No token found in Authorization header`);
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    req.user = decoded; // attach user info to req
    next();
  } catch (error) {
    console.error("Error verifying token:", (error as Error).message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
