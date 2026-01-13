import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { redisClient, connectRedis } from "./config/redis.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/user.js";
import telegramRoutes from "./routes/telegram.js";
import expenseRoutes from "./routes/expense.js";

dotenv.config();

const isTelegramBotMode = process.env.APP_MODE === 'telegram-bot';

if (isTelegramBotMode) {
  console.log("🤖 APP_MODE=telegram-bot detected");
  console.log("🔄 Starting Telegram Bot Service...");

  const { startBotService } = await import("./Telegrambot.js");
  await startBotService();


} else {
  await connectDb();
  await connectRedis();

  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  const allowedOrigins = [
    "https://www.smartkhata.me",
    "https://smartkhata.me",
    "http://localhost:5173",
    "http://localhost:5000"
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-csrf-token", "Authorization"],
    exposedHeaders: ["set-cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  app.get("/api/v1/health", (req, res) => {
    res.json({
      status: "ok",
      service: "main-backend",
      mode: process.env.APP_MODE || "backend",
      timestamp: new Date().toISOString()
    });
  });


  app.use("/api/v1", userRoutes);
  app.use("/api/v1/telegram", telegramRoutes);
  app.use("/api/v1/expense", expenseRoutes);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, async () => {
    console.log(`🚀 Main Backend running on port ${PORT}`);
    console.log(`📌 Mode: ${process.env.APP_MODE || 'backend'}`);
    console.log(`ℹ️  Telegram bot running as separate service`);
  });
}