import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AdminTokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface SuperAdminTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const signAdminToken = (payload: AdminTokenPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

export const signSuperAdminToken = (payload: SuperAdminTokenPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
};

export const cookieOptions = {
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "lax"
    | "none"
    | "strict",
};
