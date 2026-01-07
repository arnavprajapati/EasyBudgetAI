import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { saveExpensesFromTelegram } from "./controllers/expense.js";
import { verifyTelegramOTPFromBot } from "./controllers/telegram.js";
import { formatExpenseResponse } from "./config/expenseParser.js";
import { storeTelegramChatId } from "./config/telegramHelper.js";

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
    const telegramUsername = msg.from.username;

    // Store chatId for proactive OTP sending
    if (telegramUsername) {
        await storeTelegramChatId(telegramUsername, chatId);
    }

    try {
        const { User } = await import("./models/User.js");
        const { TelegramOTP } = await import("./models/TelegramOTP.js");

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
            let pendingOTP = null;

            if (telegramUsername) {
                pendingOTP = await TelegramOTP.findOne({
                    telegramUsername: telegramUsername,
                    used: false,
                    expiresAt: { $gt: new Date() }
                }).sort({ createdAt: -1 });
            }

            if (pendingOTP) {
                const otpMessage = `
🔐 <b>Your OTP Code</b>

Your verification code is: <code>${pendingOTP.otp}</code>

<b>Steps to complete linking:</b>
1. Copy the OTP above
2. Go to SmartKhata website
3. Navigate to Settings → Telegram Integration
4. Paste this OTP to verify
5. Come back here and send the same OTP again to complete linking

⏱️ <b>Expires in:</b> ${Math.floor((pendingOTP.expiresAt - new Date()) / 60000)} minutes

<i>Keep this OTP secure and don't share it with anyone!</i>
`;
                await bot.sendMessage(chatId, otpMessage, { parse_mode: "HTML" });
            } else {
                const welcomeMessage = `
👋 <b>Welcome to SmartKhata!</b>

🔗 <b>Link Your Account:</b>
1. Go to the SmartKhata website
2. Navigate to Settings → Telegram Integration
3. Enter your Telegram username: ${telegramUsername ? `<code>@${telegramUsername}</code>` : "<i>(Please set a username first)</i>"}
4. Click "Generate OTP"
5. Come back here and send <code>/start</code> again to receive your OTP

${!telegramUsername ? `\n⚠️ <b>Important:</b> You need to set a Telegram username first!\n• Go to Settings in Telegram\n• Add a username\n• Then come back here\n` : ""}

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
        }
    } catch (error) {
        console.error("Error in /start handler:", error);
        const welcomeMessage = `
👋 <b>Welcome to SmartKhata!</b>

🔗 <b>Link Your Account:</b>
1. Go to the SmartKhata website
2. Navigate to Settings → Telegram Integration
3. Generate an OTP
4. Come back here and send <code>/start</code> to receive your OTP

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
/start - Get started / Receive OTP
/help - Show this help
/status - Check link status
/today - Today's transactions
/summary - Monthly summary
/balance - Current month balance

<b>🔗 Not Linked Yet?</b>
1. Visit SmartKhata website
2. Go to Settings → Telegram Integration
3. Generate OTP
4. Send /start here to receive your OTP
5. Enter OTP on website
6. Send OTP here again to complete linking
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
3. Generate OTP
4. Send /start here to receive your OTP
5. Enter OTP on website to verify
6. Send OTP here again to complete linking

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
        const { getPendingTransaction, clearPendingTransaction } = await import("./config/partyMatcher.js");
        const pendingData = await getPendingTransaction(telegramUserId);

        if (pendingData && pendingData.waitingForPartyName) {
            const newPartyName = messageText.trim();
            const { transaction } = pendingData;

            const { User } = await import("./models/User.js");
            const { Expense } = await import("./models/Expense.js");

            const user = await User.findOne({ telegramUserId });
            if (!user) {
                await bot.sendMessage(chatId, "❌ Account not linked. Use /start first.", { parse_mode: "HTML" });
                return;
            }

            const descLower = transaction.description?.toLowerCase() || '';
            const isPending = descLower.includes('pending:') ||
                descLower.includes('to receive') ||
                descLower.includes('to pay');

            await Expense.create({
                userId: user._id,
                telegramId: telegramUserId,
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.category,
                type: transaction.type,
                date: new Date(),
                source: "telegram",
                partyName: newPartyName,
                isPending: isPending,
            });

            await clearPendingTransaction(telegramUserId);

            const typeEmoji = transaction.type === 'credit' ? '💰' : '💸';
            let confirmMsg = `✅ <b>Transaction Saved!</b>\n\n`;
            confirmMsg += `${typeEmoji} Amount: ₹${transaction.amount}\n`;
            confirmMsg += `📝 ${transaction.description}\n`;
            confirmMsg += `🏷️ Category: ${transaction.category}\n`;
            confirmMsg += `👤 Party: ${newPartyName} <i>(New)</i>\n`;
            if (isPending) {
                confirmMsg += `⏳ Status: Pending\n`;
            }

            await bot.sendMessage(chatId, confirmMsg, { parse_mode: "HTML" });
            return;
        }

        const result = await saveExpensesFromTelegram(telegramUserId, messageText, { checkParty: true });

        if (result.rateLimited) {
            await bot.sendMessage(chatId, result.message, { parse_mode: "HTML" });
            return;
        }

        if (!result.success && !result.message && !result.needsClarification) {
            return;
        }

        if (result.needsClarification) {
            const { clarificationData } = result;
            const { clarificationInfo, transaction, transactionIndex } = clarificationData;

            const { storePendingTransaction, buildPartySelectionKeyboard, formatClarificationMessage } = await import("./config/partyMatcher.js");
            await storePendingTransaction(telegramUserId, clarificationData);

            const keyboard = buildPartySelectionKeyboard({
                similarParties: clarificationInfo.similarParties || [],
                recentParties: clarificationInfo.recentParties || [],
                originalPartyName: clarificationInfo.originalPartyName || transaction.partyName,
                transactionIndex: transactionIndex || 0,
                showCreateNew: true,
                showSkip: true
            });

            const message = formatClarificationMessage(transaction, clarificationInfo);

            await bot.sendMessage(chatId, message, {
                parse_mode: "HTML",
                reply_markup: keyboard
            });
            return;
        }

        if (!result.success) {
            await bot.sendMessage(chatId, result.message, { parse_mode: "HTML" });
            return;
        }

        const formattedResponse = formatExpenseResponse(result.transactions, result.user);
        await bot.sendMessage(chatId, formattedResponse, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error handling expense:", error);
        await bot.sendMessage(chatId, "❌ Something went wrong. Please try again or check if your message format is correct.\n\nExample: '50 chai' or '200 uber'", {
            parse_mode: "HTML",
        });
    }
};

const handleCallbackQuery = async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const telegramUserId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;

    try {
        const { getPendingTransaction, clearPendingTransaction } = await import("./config/partyMatcher.js");
        const pendingData = await getPendingTransaction(telegramUserId);

        if (!pendingData) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Session expired. Please try again." });
            await bot.deleteMessage(chatId, messageId);
            return;
        }

        const { transaction, allTransactions } = pendingData;
        let selectedParty = null;

        const [action, indexStr, ...valueParts] = data.split(':');
        const value = valueParts.join(':');

        if (action === 'party_select') {
            selectedParty = value;
        } else if (action === 'party_new') {
            const { storePendingTransaction } = await import("./config/partyMatcher.js");
            await storePendingTransaction(telegramUserId, {
                ...pendingData,
                waitingForPartyName: true,
                originalPartyName: value || transaction.partyName
            });

            await bot.deleteMessage(chatId, messageId);

            const promptMsg = `✏️ <b>Enter Unique Party Name</b>\n\n` +
                `Original: "<b>${value || transaction.partyName}</b>"\n\n` +
                `💡 <i>Add identifier to make it unique:</i>\n` +
                `• ${value || transaction.partyName} Office\n` +
                `• ${value || transaction.partyName} College\n` +
                `• ${value || transaction.partyName} Delhi\n\n` +
                `<i>Send the new party name as a message...</i>`;

            await bot.sendMessage(chatId, promptMsg, { parse_mode: "HTML" });
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Enter new party name" });
            return;
        } else if (action === 'party_skip') {
            selectedParty = null;
        } else if (action === 'party_cancel') {
            await clearPendingTransaction(telegramUserId);
            await bot.deleteMessage(chatId, messageId);
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Transaction cancelled" });
            return;
        } else if (action === 'party_prompt') {
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Please send the party name as a message" });
            return;
        }

        transaction.partyName = selectedParty;

        const { User } = await import("./models/User.js");
        const { Expense } = await import("./models/Expense.js");

        const user = await User.findOne({ telegramUserId });
        if (!user) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Account not linked!" });
            return;
        }

        const descLower = transaction.description?.toLowerCase() || '';
        const isPending = descLower.includes('pending:') ||
            descLower.includes('to receive') ||
            descLower.includes('to pay');

        await Expense.create({
            userId: user._id,
            telegramId: telegramUserId,
            amount: transaction.amount,
            description: transaction.description,
            category: transaction.category,
            type: transaction.type,
            date: new Date(),
            source: "telegram",
            partyName: selectedParty,
            isPending: isPending,
        });

        await clearPendingTransaction(telegramUserId);

        await bot.deleteMessage(chatId, messageId);

        const typeEmoji = transaction.type === 'credit' ? '💰' : '💸';
        let confirmMsg = `✅ <b>Transaction Saved!</b>\n\n`;
        confirmMsg += `${typeEmoji} Amount: ₹${transaction.amount}\n`;
        confirmMsg += `📝 ${transaction.description}\n`;
        confirmMsg += `🏷️ Category: ${transaction.category}\n`;
        if (selectedParty) {
            confirmMsg += `👤 Party: ${selectedParty}\n`;
        }
        if (isPending) {
            confirmMsg += `⏳ Status: Pending\n`;
        }

        await bot.sendMessage(chatId, confirmMsg, { parse_mode: "HTML" });
        await bot.answerCallbackQuery(callbackQuery.id, { text: "✅ Saved!" });

    } catch (error) {
        console.error("Error handling callback query:", error);
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Error occurred. Try again." });
    }
};

bot.on("callback_query", handleCallbackQuery);

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

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayExpenses = await Expense.find({
            userId: user._id,
            date: { $gte: startOfDay, $lte: endOfDay },
        }).sort({ date: -1 });

        if (todayExpenses.length === 0) {
            await bot.sendMessage(chatId, "📭 <b>No transactions today</b>\n\nStart tracking your expenses!", {
                parse_mode: "HTML",
            });
            return;
        }

        const totalDebit = todayExpenses.filter(e => e.type === "debit").reduce((sum, e) => sum + e.amount, 0);
        const totalCredit = todayExpenses.filter(e => e.type === "credit").reduce((sum, e) => sum + e.amount, 0);

        let message = `📅 <b>Today's Transactions</b>\n`;
        message += `${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}\n\n`;

        message += `💸 <b>Expenses:</b> -₹${totalDebit}\n`;
        message += `💰 <b>Income:</b> +₹${totalCredit}\n`;
        message += `━━━━━━━━━━━━━━━\n\n`;

        todayExpenses.forEach((expense) => {
            const timeStr = new Date(expense.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
            const icon = expense.type === "credit" ? "💚" : "❤️";
            const sign = expense.type === "credit" ? "+" : "-";
            message += `${icon} ${sign}₹${expense.amount} - ${expense.description}\n`;
            message += `   <i>${expense.category} • ${timeStr}</i>\n\n`;
        });

        message += `📊 <b>Total Transactions:</b> ${todayExpenses.length}`;

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
    console.log(`📩 Received message from @${msg.from?.username}: ${messageText}`);
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

        setTimeout(async () => {
            try {
                try {
                    await bot.deleteWebHook({ drop_pending_updates: true });
                    console.log("🗑️  Old webhook deleted successfully");
                } catch (deleteError) {
                    console.log("ℹ️  Error deleting old webhook:", deleteError.message);
                }

                await bot.setWebHook(fullWebhookUrl, {
                    drop_pending_updates: true,
                    allowed_updates: ["message", "callback_query"],
                });
                console.log("✅ Webhook set successfully!");

                try {
                    const info = await bot.getWebHookInfo();
                    console.log("📊 Webhook Status:");
                    console.log("   URL:", info.url);
                    console.log("   Pending updates:", info.pending_update_count);

                    if (info.last_error_date) {
                        const errorDate = new Date(info.last_error_date * 1000);
                        console.warn("⚠️  Last error date:", errorDate.toLocaleString());
                        console.warn("⚠️  Last error message:", info.last_error_message);
                    } else {
                        console.log("✅ No webhook errors - bot is ready!");
                    }
                } catch (infoError) {
                    console.log("ℹ️  Could not get webhook info:", infoError.message);
                }

            } catch (webhookError) {
                console.error("⚠️ Telegram webhook setup error (non-fatal):", webhookError.message);
                console.log("ℹ️  Server will continue running. Webhook may need manual setup.");
            }
        }, 3000);

    } catch (error) {
        console.error("❌ Failed to setup Telegram webhook:", error.message);
        console.log("ℹ️  Server will continue running without Telegram webhook.");
    }
}

export default bot;