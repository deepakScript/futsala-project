import { z } from 'zod';

// ─── Register Schema ──────────────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .min(1, 'Email cannot be blank')
    .email('Invalid email format'),
  fullName: z
    .string({ error: 'Full name is required' })
    .min(1, 'Full name cannot be blank')
    .trim(),
  phoneNumber: z
    .string({ error: 'Phone number is required' })
    .min(1, 'Phone number cannot be blank')
    .trim(),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

// ─── Login Schema ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .min(1, 'Email cannot be blank')
    .email('Invalid email format'),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password cannot be blank'),
});

// ─── Forgot Password Schema ───────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .min(1, 'Email cannot be blank')
    .email('Invalid email format'),
});

// ─── Reset Password Schema ────────────────────────────────────────────────────
export const resetPasswordSchema = z.object({
  token: z
    .string({ error: 'Token is required' })
    .min(1, 'Token cannot be blank'),
  newPassword: z
    .string({ error: 'New password is required' })
    .min(1, 'New password cannot be blank'),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
