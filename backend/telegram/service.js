import dotenv from "dotenv";
import bot from "./bot.js";

// Register all message/callback routes
import "./router.js";

dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL;

export async function startBotService() {
    console.log("🤖 Starting Telegram Bot Service...");

    const express = (await import('express')).default;
    const app = express();
    app.use(express.json());

    // Connect Database
    try {
        const connectDb = (await import('../config/db.js')).default;
        await connectDb();
        console.log("✅ Database connected");
    } catch (error) {
        console.error("❌ DB connection failed:", error.message);
        process.exit(1);
    }

    // Connect Redis
    try {
        const { connectRedis } = await import('../config/redis.js');
        await connectRedis();
        console.log("✅ Redis connected");
    } catch (error) {
        console.log("⚠️ Redis connection failed (optional)");
    }

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'running',
            service: 'telegram-bot',
            mode: process.env.APP_MODE || 'telegram-bot',
            timestamp: new Date().toISOString()
        });
    });

    // Telegram webhook endpoint
    app.post('/webhook', (req, res) => {
        try {
            console.log("📨 Webhook received");
            bot.processUpdate(req.body);
            res.sendStatus(200);
        } catch (error) {
            console.error("❌ Webhook processing error:", error);
            res.sendStatus(500);
        }
    });

    const PORT = process.env.PORT || 10000;

    app.listen(PORT, async () => {
        console.log(`🤖 Telegram Bot Service running on port ${PORT}`);
        console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);

        if (WEBHOOK_URL) {
            // Delay webhook setup to let the server fully initialize
            setTimeout(async () => {
                try {
                    const webhookUrl = `${WEBHOOK_URL}/webhook`;
                    console.log("🔧 Setting up webhook to:", webhookUrl);

                    await bot.deleteWebHook({ drop_pending_updates: true });
                    console.log("🗑️ Old webhook deleted");

                    await new Promise(resolve => setTimeout(resolve, 2000));

                    await bot.setWebHook(webhookUrl, {
                        drop_pending_updates: true,
                        allowed_updates: ["message", "callback_query"]
                    });
                    console.log("✅ Webhook set successfully!");

                    const info = await bot.getWebHookInfo();
                    console.log("📊 Webhook Status:");
                    console.log("   URL:", info.url);
                    console.log("   Pending:", info.pending_update_count);

                    if (!info.last_error_date) {
                        console.log("✅ Bot is ready!");
                    } else {
                        const errorDate = new Date(info.last_error_date * 1000);
                        console.warn("⚠️ Last error:", errorDate.toLocaleString());
                    }
                } catch (error) {
                    console.error("❌ Webhook setup failed:", error.message);
                }
            }, 3000);
        } else {
            console.error("❌ WEBHOOK_URL not set!");
        }
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('🛑 SIGTERM received. Shutting down...');
        try {
            await bot.deleteWebHook();
            console.log("✅ Webhook removed");
        } catch (error) {
            console.error("Error removing webhook:", error);
        }
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        console.log('\n🛑 SIGINT received. Shutting down...');
        try {
            await bot.deleteWebHook();
        } catch (error) {
            console.error("Error removing webhook:", error);
        }
        process.exit(0);
    });
}

