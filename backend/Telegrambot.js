import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { saveExpensesFromTelegram } from "./controllers/expense.js";
import { verifyTelegramOTPFromBot } from "./controllers/telegram.js";
import { formatExpenseResponse } from "./config/expenseParser.js";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is missing");
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });


const handleStart = async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const { User } = await import("./models/User.js");
        const user = await User.findOne({ telegramUserId });

        if (user) {
            const linkedMessage = `
✅ <b>Account Already Linked</b>

Your Telegram account is already linked to SmartKhata.

📧 <b>Email:</b> ${user.email}
👤 <b>Name:</b> ${user.name}
📱 <b>Telegram:</b> @${user.telegramUsername || "N/A"}
🔗 <b>Linked on:</b> ${user.telegramLinkedAt ? new Date(user.telegramLinkedAt).toLocaleDateString("en-IN") : "N/A"}

💡 <b>Quick Commands:</b>
• Send transactions like: <code>50 chai</code>, <code>200 auto</code>
• Send income like: <code>5000 salary mila</code>, <code>500 refund</code>
• <code>/help</code> - View all commands
• <code>/status</code> - Check account status
• <code>/today</code> - Today's transactions
• <code>/summary</code> - Monthly summary
• <code>/balance</code> - Current month balance

<i>You're all set! Start tracking your money.</i>
`;
            await bot.sendMessage(chatId, linkedMessage, { parse_mode: "HTML" });
        } else {
            const welcomeMessage = `
👋 <b>Welcome to SmartKhata!</b>

🔗 <b>Link Your Account:</b>
1. Go to the SmartKhata website
2. Navigate to Settings → Telegram Integration
3. Generate an OTP
4. Come back here and send the OTP to link your account

💡 <b>Once linked, you can:</b>
• Track expenses by simply messaging them
• Receive instant confirmations
• View your spending patterns

📝 <b>Example messages:</b>
• "50 chai"
• "200 uber"
• "500 grocery shopping"
• "1000 salary mila" (for income)

Need help? Type /help
`;
            await bot.sendMessage(chatId, welcomeMessage, { parse_mode: "HTML" });
        }
    } catch (error) {
        console.error("Error in /start handler:", error);
        const welcomeMessage = `
👋 <b>Welcome to SmartKhata!</b>

🔗 <b>Link Your Account:</b>
1. Go to the SmartKhata website
2. Navigate to Settings → Telegram Integration
3. Generate an OTP
4. Come back here and send the OTP to link your account

💡 <b>Once linked, you can:</b>
• Track expenses by simply messaging them
• Receive instant confirmations
• View your spending patterns

📝 <b>Example messages:</b>
• "50 chai"
• "200 uber"
• "500 grocery shopping"
• "1000 salary mila" (for income)

Need help? Type /help
`;
        await bot.sendMessage(chatId, welcomeMessage, { parse_mode: "HTML" });
    }
};

const handleHelp = async (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
ℹ️ <b>SmartKhata Bot - Help</b>

<b>📝 How to Log Expenses:</b>
Just message your expenses naturally!

<b>Examples:</b>
• "100 chai" → ₹100 for tea
• "500 uber to office" → ₹500 for transport
• "2000 grocery shopping" → ₹2000 for groceries
• "50 auto, 200 lunch" → Multiple expenses

<b>💰 Tracking Income:</b>
• "5000 salary mila" → ₹5000 income
• "1000 friend se liya" → ₹1000 received

<b>📊 Categories (Auto-detected):</b>
• Food & Dining 🍽️
• Travel & Transport 🚗
• Shopping & Entertainment 🛍️
• Housing / Rent 🏠
• Bills & Utilities 📱
• Personal & Transfers 💸
• Salary & Income 💼
• Refunds & Returns ↩️

<b>🔧 Commands:</b>
/start - Get started
/help - Show this help
/status - Check link status

<b>🔗 Not Linked Yet?</b>
Visit SmartKhata website to link your account!
`;
    await bot.sendMessage(chatId, helpMessage, { parse_mode: "HTML" });
};

const handleStatus = async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const { User } = await import("./models/User.js");
        const user = await User.findOne({ telegramUserId });

        if (!user) {
            await bot.sendMessage(
                chatId,
                `❌ <b>Not Linked</b>

Your Telegram account is not linked to SmartKhata yet.

<b>To link your account:</b>
1. Visit SmartKhata website
2. Go to Settings → Telegram
3. Generate OTP and send it here

After linking, you can track expenses directly via Telegram!`,
                { parse_mode: "HTML" }
            );
        } else {
            await bot.sendMessage(
                chatId,
                `✅ <b>Account Linked!</b>

📧 <b>Email:</b> ${user.email}
👤 <b>Name:</b> ${user.name}
📱 <b>Telegram:</b> @${user.telegramUsername || "N/A"}
🔗 <b>Linked:</b> ${user.telegramLinkedAt ? new Date(user.telegramLinkedAt).toLocaleDateString("en-IN") : "N/A"}

You can now track expenses by simply sending messages!

<b>Example:</b> "100 chai" or "500 uber"`,
                { parse_mode: "HTML" }
            );
        }
    } catch (error) {
        console.error("Error checking status:", error);
        await bot.sendMessage(chatId, "❌ Something went wrong. Please try again.", { parse_mode: "HTML" });
    }
};

const handleOTP = async (msg) => {
    const chatId = msg.chat.id;
    const otp = msg.text.trim();
    const telegramUserId = msg.from.id.toString();
    const telegramUsername = msg.from.username;

    try {
        const result = await verifyTelegramOTPFromBot(otp, telegramUserId, telegramUsername);
        await bot.sendMessage(chatId, result.message, { parse_mode: "HTML" });

        if (result.success) {
            setTimeout(async () => {
                await bot.sendMessage(
                    chatId,
                    `📝 <b>Start tracking your expenses now!</b>

Just send me messages like:
• "50 chai"
• "200 uber"
• "1000 grocery"

I'll automatically categorize and save them! 🎉`,
                    { parse_mode: "HTML" }
                );
            }, 2000);
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        await bot.sendMessage(chatId, "❌ Something went wrong. Please try again or generate a new OTP.", {
            parse_mode: "HTML",
        });
    }
};

const handleExpenseMessage = async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    const telegramUserId = msg.from.id.toString();

    if (!messageText || typeof messageText !== "string" || messageText.trim().length === 0) {
        return;
    }

    try {
        const result = await saveExpensesFromTelegram(telegramUserId, messageText);

        if (!result.success) {
            if (result.message) {
                await bot.sendMessage(chatId, result.message, { parse_mode: "HTML" });
            }
            return;
        }

        const parsedData = { transactions: result.transactions };
        const responseMessage = formatExpenseResponse(parsedData);

        if (responseMessage) {
            await bot.sendMessage(chatId, responseMessage, { parse_mode: "HTML" });
        }
    } catch (error) {
        console.error("Error processing message:", error);
        await bot.sendMessage(chatId, "❌ Something went wrong while processing your expense. Please try again.", {
            parse_mode: "HTML",
        });
    }
};

const handleToday = async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const { User } = await import("./models/User.js");
        const { Expense } = await import("./models/Expense.js");

        const user = await User.findOne({ telegramUserId });

        if (!user) {
            await bot.sendMessage(chatId, "❌ Your account is not linked. Please use /start to link your account.", {
                parse_mode: "HTML",
            });
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const transactions = await Expense.find({
            userId: user._id,
            date: { $gte: today, $lt: tomorrow },
        }).sort({ createdAt: -1 });

        if (transactions.length === 0) {
            await bot.sendMessage(chatId, "📭 <b>No transactions today</b>\n\nStart tracking by sending messages like:\n• <code>50 chai</code>\n• <code>200 uber</code>", {
                parse_mode: "HTML",
            });
            return;
        }

        const credits = transactions.filter(t => t.type === "credit");
        const debits = transactions.filter(t => t.type === "debit");

        const totalCredit = credits.reduce((sum, t) => sum + t.amount, 0);
        const totalDebit = debits.reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalCredit - totalDebit;

        let message = `📅 <b>Today's Transactions</b>\n`;
        message += `<i>${today.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</i>\n\n`;

        if (credits.length > 0) {
            message += `💰 <b>INCOME:</b>\n`;
            credits.forEach((t, i) => {
                message += `${i + 1}. +₹${t.amount} - ${t.description}\n   <i>${t.category}</i>\n`;
            });
            message += `\n`;
        }

        if (debits.length > 0) {
            message += `💸 <b>EXPENSES:</b>\n`;
            debits.forEach((t, i) => {
                message += `${i + 1}. -₹${t.amount} - ${t.description}\n   <i>${t.category}</i>\n`;
            });
            message += `\n`;
        }

        message += `━━━━━━━━━━━━━━━\n`;
        if (credits.length > 0) message += `💚 <b>Total Income:</b> +₹${totalCredit}\n`;
        if (debits.length > 0) message += `❤️ <b>Total Expenses:</b> -₹${totalDebit}\n`;
        message += `📊 <b>Net:</b> ${netBalance >= 0 ? "+" : ""}₹${netBalance}`;

        await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error in /today:", error);
        await bot.sendMessage(chatId, "❌ Error fetching today's transactions. Please try again.", {
            parse_mode: "HTML",
        });
    }
};

const handleSummary = async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const { User } = await import("./models/User.js");
        const { Expense } = await import("./models/Expense.js");

        const user = await User.findOne({ telegramUserId });

        if (!user) {
            await bot.sendMessage(chatId, "❌ Your account is not linked. Please use /start to link your account.", {
                parse_mode: "HTML",
            });
            return;
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactions = await Expense.find({
            userId: user._id,
            date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        if (transactions.length === 0) {
            await bot.sendMessage(chatId, "📭 <b>No transactions this month</b>\n\nStart tracking your expenses!", {
                parse_mode: "HTML",
            });
            return;
        }

        const credits = transactions.filter(t => t.type === "credit");
        const debits = transactions.filter(t => t.type === "debit");

        const totalCredit = credits.reduce((sum, t) => sum + t.amount, 0);
        const totalDebit = debits.reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalCredit - totalDebit;

        const categoryTotals = {};
        debits.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const monthName = startOfMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

        let message = `📊 <b>Monthly Summary</b>\n`;
        message += `<i>${monthName}</i>\n\n`;

        message += `💰 <b>Total Income:</b> +₹${totalCredit}\n`;
        message += `💸 <b>Total Expenses:</b> -₹${totalDebit}\n`;
        message += `📈 <b>Net Balance:</b> ${netBalance >= 0 ? "+" : ""}₹${netBalance}\n\n`;

        if (Object.keys(categoryTotals).length > 0) {
            message += `🏷️ <b>Expense Breakdown:</b>\n`;
            const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
            sortedCategories.forEach(([category, amount]) => {
                const percentage = ((amount / totalDebit) * 100).toFixed(1);
                message += `• ${category}: ₹${amount} (${percentage}%)\n`;
            });
            message += `\n`;
        }

        message += `📝 <b>Total Transactions:</b> ${transactions.length}`;

        await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error in /summary:", error);
        await bot.sendMessage(chatId, "❌ Error fetching summary. Please try again.", {
            parse_mode: "HTML",
        });
    }
};

const handleBalance = async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const { User } = await import("./models/User.js");
        const { Expense } = await import("./models/Expense.js");

        const user = await User.findOne({ telegramUserId });

        if (!user) {
            await bot.sendMessage(chatId, "❌ Your account is not linked. Please use /start to link your account.", {
                parse_mode: "HTML",
            });
            return;
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const transactions = await Expense.find({
            userId: user._id,
            date: { $gte: startOfMonth },
        });

        const totalCredit = transactions.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0);
        const totalDebit = transactions.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalCredit - totalDebit;

        const monthName = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

        let message = `💰 <b>Current Month Balance</b>\n`;
        message += `<i>${monthName}</i>\n\n`;
        message += `💚 <b>Income:</b> +₹${totalCredit}\n`;
        message += `❤️ <b>Expenses:</b> -₹${totalDebit}\n`;
        message += `━━━━━━━━━━━━━━━\n`;
        message += `📊 <b>Balance:</b> ${netBalance >= 0 ? "+" : ""}₹${netBalance}`;

        if (netBalance < 0) {
            message += `\n\n⚠️ <i>You're in deficit this month!</i>`;
        } else if (netBalance > 0) {
            message += `\n\n✅ <i>Great! You're saving this month!</i>`;
        }

        await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error in /balance:", error);
        await bot.sendMessage(chatId, "❌ Error fetching balance. Please try again.", {
            parse_mode: "HTML",
        });
    }
};


bot.on("message", async (msg) => {
    const messageText = msg.text;
    if (!messageText) return;

    if (messageText.startsWith("/start")) return handleStart(msg);
    if (messageText.startsWith("/help")) return handleHelp(msg);
    if (messageText.startsWith("/status")) return handleStatus(msg);
    if (messageText.startsWith("/today")) return handleToday(msg);
    if (messageText.startsWith("/summary")) return handleSummary(msg);
    if (messageText.startsWith("/balance")) return handleBalance(msg);
    if (/^\d{6}$/.test(messageText)) return handleOTP(msg);

    return handleExpenseMessage(msg);
});


bot.on("webhook_error", (error) => {
    console.error("Webhook error:", error);
});


export async function setupTelegramWebhook(app) {
    if (!WEBHOOK_URL) {
        console.error("❌ WEBHOOK_URL is missing. Telegram webhook not configured.");
        console.log("ℹ️  Please set WEBHOOK_URL environment variable");
        console.log("ℹ️  Example: WEBHOOK_URL=https://yourdomain.com");
        return;
    }

    try {
        const webhookPath = `/api/v1/telegram-webhook`;
        const fullWebhookUrl = `${WEBHOOK_URL}${webhookPath}`;

        console.log("🔧 Setting up Telegram webhook...");
        console.log("📍 Target URL:", fullWebhookUrl);

        app.post(webhookPath, (req, res) => {
            try {
                bot.processUpdate(req.body);
                res.sendStatus(200);
            } catch (error) {
                console.error("Error processing update:", error);
                res.sendStatus(500);
            }
        });
        console.log("✅ Express webhook endpoint registered");

        try {
            const deleteResponse = await fetch(
                `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook?drop_pending_updates=true`
            );
            const deleteData = await deleteResponse.json();

            if (deleteData.ok) {
                console.log("🗑️  Old webhook deleted successfully");
            } else {
                console.log("ℹ️  No old webhook or error deleting:", deleteData.description);
            }
        } catch (deleteError) {
            console.log("ℹ️  Error deleting old webhook:", deleteError.message);
        }

        const setResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: fullWebhookUrl,
                drop_pending_updates: true,
                allowed_updates: ["message", "callback_query"],
            }),
        });

        const setData = await setResponse.json();

        if (setData.ok) {
            console.log("✅ Webhook set successfully!");
        } else {
            console.error("❌ Failed to set webhook:", setData.description);
            return;
        }

        const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
        const webhookInfo = await infoResponse.json();

        if (webhookInfo.ok) {
            const info = webhookInfo.result;
            console.log("📊 Webhook Status:");
            console.log("   URL:", info.url);
            console.log("   Pending updates:", info.pending_update_count);
            console.log("   Max connections:", info.max_connections);

            if (info.last_error_date) {
                const errorDate = new Date(info.last_error_date * 1000);
                console.warn("⚠️  Last error date:", errorDate.toLocaleString());
                console.warn("⚠️  Last error message:", info.last_error_message);
            } else {
                console.log("✅ No webhook errors - bot is ready!");
            }
        }
    } catch (error) {
        console.error("❌ Failed to setup Telegram webhook:", error.message);
        console.error("Stack:", error.stack);
    }
}

export default bot;