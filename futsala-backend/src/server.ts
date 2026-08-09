import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pool from './config/db';
import userRoutes from './modules/users/routes';
import adminRoutes from './modules/admin/routes';
import superadminRoutes from './modules/superadmin/routes';
import { startBookingConsumer } from './utils/kafka/consumers/bookingConsumer';
import { logger, httpLogger } from './utils/logger';
import { globalErrorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();

const allowedOrigins = [
  process.env.ADMIN_URL || 'http://localhost:3000',
  process.env.SUPERADMIN_URL || 'http://localhost:3001',
  process.env.FLUTTER_WEB_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || allowedOrigins[0]);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.get('/test-db', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database Connected!', time: result.rows[0] });
  } catch (err) {
    logger.error({ err }, 'Database connection failed');
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Mobile app (customers) — futsala_app
app.use('/api/v1', userRoutes);

// Venue owner panel — futsala-admin
app.use('/api/admin', adminRoutes);

// Platform super admin — futsala_superadmin
app.use('/api/superadmin', superadminRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send('Futsala Central Backend is running');
});

app.use(globalErrorHandler);

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  try {
    await startBookingConsumer();
    logger.info('Booking consumer started successfully');
  } catch (kafkaErr) {
    logger.error({ kafkaErr }, 'Failed to start booking consumer');
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection at Promise');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception caught');
});

export default app;
