import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./config/db";
import morgan from "morgan";
import userRoutes from "./modules/users/routes";
import adminRoutes from "./modules/admin/routes";
import superadminRoutes from "./modules/superadmin/routes";
import { startBookingConsumer } from "./utils/kafka/consumers/bookingConsumer";

dotenv.config();

const app: Application = express();

const allowedOrigins = [
  process.env.ADMIN_URL || "http://localhost:3000",
  process.env.SUPERADMIN_URL || "http://localhost:3001",
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database Connected!", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Mobile app (customers) — futsala_app
app.use("/api/v1", userRoutes);

// Venue owner panel — futsala-admin
app.use("/api/admin", adminRoutes);

// Platform super admin — futsala_superadmin
app.use("/api/superadmin", superadminRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send("Futsala Central Backend is running");
});

app.use((err: Error & { status?: number }, _req: Request, res: Response) => {
  console.error("Express Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err : undefined,
  });
});

const PORT = process.env.PORT ?? 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // Start Kafka consumers
    await startBookingConsumer();
  });
} else {
  // Assuming production might have a different listen pattern, but let's start it here too
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await startBookingConsumer();
  });
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

export default app;
