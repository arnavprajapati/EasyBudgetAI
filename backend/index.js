import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import cors from "cors";
import { setupTelegramWebhook } from "./Telegrambot.js";

dotenv.config();

await connectDb();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log("Missing redis url");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch(console.error);

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

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  console.log('📥 Request:', req.method, req.path);
  console.log('🍪 Cookies:', req.cookies);
  console.log('🌍 Origin:', req.headers.origin);
  console.log('📋 Headers:', req.headers.cookie);
  next();
});


import userRoutes from "./routes/user.js";
import telegramRoutes from "./routes/telegram.js";
import expenseRoutes from "./routes/expense.js";

app.use("/api/v1", userRoutes);
app.use("/api/v1/telegram", telegramRoutes);
app.use("/api/v1/expense", expenseRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  await setupTelegramWebhook(app);
});