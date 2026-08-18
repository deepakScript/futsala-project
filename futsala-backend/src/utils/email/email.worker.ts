import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis";
import { sendMail, verifyEmailTransport } from "./emai.service";
import { EmailJobData } from "./email.queue";
import { logger } from "../logger";

export const emailWorker = new Worker<EmailJobData>(
  "email",

  async (job: Job<EmailJobData>) => {
    logger.info(`Processing email job ${job.id} for ${job.data.to}`);

    const result = await sendMail({
      to: job.data.to,
      subject: job.data.subject,
      html: job.data.html,
      text: job.data.text,
    });

    logger.info(
      `Email sent successfully. Job: ${job.id}, Message ID: ${result.messageId}`,
    );

    return {
      messageId: result.messageId,
    };
  },

  {
    connection: redis,

    concurrency: 5,

    limiter: {
      max: 100,
      duration: 60_000,
    },
  },
);

emailWorker.on("completed", (job) => {
  logger.info(`Email job completed: ${job.id}`);
});

emailWorker.on("failed", (job, error : any) => {
  logger.error(
    `Email job failed: ${job?.id}`,
    error,
  );
});

emailWorker.on("error", (error :any) => {
  logger.error("Email worker error:", error);
});

async function start() {
  try {
    await verifyEmailTransport();
    logger.info("Email worker initialized and listening for jobs");
  } catch (error: any) {
    logger.error("Email worker failed to start:", error);
  }
}

start();

