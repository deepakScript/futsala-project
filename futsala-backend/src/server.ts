import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./config/db";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import futsalRoutes from "./routes/futsalRoutes";

dotenv.config();

const app: Application = express();

// middleware
app.use(cors({ origin: true, credentials: true }));
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



app.get("/", (_req: Request, res: Response) => {
  res.send("Futsal Booking Backend (TypeScript) is running 🚀");
});

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log("Server running on port ${PORT}"));