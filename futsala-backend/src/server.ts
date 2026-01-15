import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./config/db";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import futsalRoutes from "./routes/futsalRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import userRoutes from "./routes/userRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import reviewRoutes from "./routes/reviewRoutes";

dotenv.config();

const app: Application = express();

// middleware
app.use(cors({
  origin: "*", // your Flutter web dev URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // if you’re sending cookies or auth headers
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


// connect db
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database Connected!", time: result.rows[0] });
    console.log(process.env.DATABASE_URL);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// test route
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/futsal", futsalRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);



app.get("/", (_req: Request, res: Response) => {
  res.send("Futsal Booking Backend (TypeScript) is running 🚀");
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Express Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err : undefined
  });
});

const PORT = process.env.PORT ?? 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Global unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Global uncaught exception handler
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

export default app;
