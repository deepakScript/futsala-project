import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().optional().default(''),

  JWT_SECRET: z.string().default('your-secret-key'),
  JWT_ACCESS_SECRET: z.string().default('your-default-secret-key'),
  JWT_REFRESH_SECRET: z.string().default('your-refresh-secret-key'),

  ADMIN_URL: z.string().default('http://localhost:3000'),
  SUPERADMIN_URL: z.string().default('http://localhost:3001'),
  FLUTTER_WEB_URL: z.string().optional().default(''),
  FRONTEND_URL: z.string().default('http://localhost:5000'),
  CLIENT_URL: z.string().default('http://localhost:3000'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  MAIL_HOST: z.string().optional().default(''),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USER: z.string().optional().default(''),
  MAIL_PASSWORD: z.string().optional().default(''),

  LOG_LEVEL: z.string().default('info'),
  KAFKA_BROKER: z.string().default('localhost:9092'),

  KHALTI_BASE_URL: z.string().default('https://a.khalti.com/api/v2'),
  KHALTI_SECRET_KEY: z.string().default('97fbe616f94b4b0cab1a443dfa116206'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_USERNAME: z.string().optional().default(''),
  REDIS_PASSWORD: z.string().optional().default(''),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables configuration');
}

export const env = _env.data;
export type Env = z.infer<typeof envSchema>;
export default env;
