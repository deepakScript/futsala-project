import Redis from 'ioredis'
import { logger } from '../utils/logger'

// Scoped child logger for all Redis-related logs
const redisLogger = logger.child({ name: 'redis' })

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,

  maxRetriesPerRequest: null,

  connectTimeout: 10_000,
  commandTimeout: 5_000,

  enableReadyCheck: true,

  retryStrategy(times) {
    const delay = Math.min(times * 200, 5_000);

    redisLogger.warn(
      {
        attempt: times,
        retryInMs: delay,
      },
      "Redis reconnecting"
    );

    return delay;
  },

  reconnectOnError(error) {
    if (error.message?.includes("READONLY")) {
      redisLogger.warn(
        {
          error: error.message,
        },
        "Redis returned READONLY, reconnecting"
      );

      return true;
    }

    return false;
  },

  keepAlive: 10_000,
});

redis.on("connect", () => {
  redisLogger.info("Redis connecting");
});

redis.on("ready", () => {
  redisLogger.info(
    {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
    },
    "Redis connection ready"
  );
});

redis.on("error", (error: NodeJS.ErrnoException) => {
  redisLogger.error(
    {
      err: error,
      message: error.message,
      code: error.code,
    },
    "Redis connection error"
  );
});

redis.on("close", () => {
  redisLogger.warn("Redis connection closed");
});

redis.on("reconnecting", (delay) => {
  redisLogger.warn(
    {
      retryInMs: delay,
    },
    "Redis reconnecting"
  );
});

redis.on("end", () => {
  redisLogger.warn("Redis connection ended");
});

async function closeRedis() {
  try {
    redisLogger.info("Closing Redis connection");

    await redis.quit();

    redisLogger.info("Redis connection closed gracefully");
  } catch (error) {
    const err = error as Error;
    redisLogger.error(
      {
        err,
        message: err.message,
      },
      "Failed to close Redis gracefully"
    );

    redis.disconnect();
  }
}

export { redis, closeRedis };