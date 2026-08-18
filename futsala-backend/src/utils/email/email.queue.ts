import { Queue } from 'bullmq';
import { redis } from '../../config/redis';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const emailQueue = new Queue<EmailJobData>("email", {
  connection: redis,

  defaultJobOptions: {
    attempts: 5,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: {
      age: 24 * 60 * 60,
      count: 1000,
    },

    removeOnFail: {
      age: 7 * 24 * 60 * 60,
      count: 5000,
    },
  },
});