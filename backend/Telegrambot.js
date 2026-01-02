import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { TelegramOTP } from './models/TelegramOTP.js';
import { saveExpensesFromTelegram } from './controllers/expense.js';
import { formatExpenseResponse } from './config/expenseParser.js';

dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
    dbName: "EasyBudgetAI",
}).then(() => {
    console.log("✅ MongoDB connected");
}).catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN not found in .env");
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 Bot is running and listening for messages...");

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();
    const telegramUsername = msg.from.username || null;

    try {
        const existingUser = await User.findOne({ telegramUserId });

        if (existingUser) {
            const linkedMessage = `✅ <b>Account Already Linked</b>

Your Telegram account is already linked to SmartKhata.

📧 <b>Email:</b> ${existingUser.email}
👤 <b>Name:</b> ${existingUser.name}
📱 <b>Telegram:</b> @${existingUser.telegramUsername || 'N/A'}
🔗 <b>Linked on:</b> ${existingUser.telegramLinkedAt ? new Date(existingUser.telegramLinkedAt).toLocaleDateString() : 'N/A'}

<b>💡 Quick Commands:</b>
• Send transactions like: <code>50 chai, 200 auto</code>
• Send income like: <code>5000 salary mila, 500 refund</code>
• /help - View all commands
• /today - Today's transactions
• /summary - Monthly summary
• /balance - Current month balance

<i>You're all set! Start tracking your money.</i>`;

            await bot.sendMessage(chatId, linkedMessage, { parse_mode: 'HTML' });
        } else {
            if (!telegramUsername) {
                const noUsernameMessage = `❌ <b>No Username Found</b>

Your Telegram account doesn't have a username set. You need a username to link your account.

<b>How to set a username:</b>
1. Go to Telegram Settings
2. Click on your profile
3. Set a username (e.g., @arnav_31_06)
4. Come back and send /start again

<i>After setting your username, generate an OTP from the website.</i>`;

                await bot.sendMessage(chatId, noUsernameMessage, { parse_mode: 'HTML' });
                return;
            }

            const pendingOTP = await TelegramOTP.findOne({
                telegramUsername: telegramUsername.toLowerCase(),
                used: false,
                expiresAt: { $gt: new Date() },
            })
                .sort({ createdAt: -1 })
                .populate("userId");

            if (pendingOTP) {
                const expiryTime = new Date(pendingOTP.expiresAt);
                const now = new Date();
                const minutesLeft = Math.floor((expiryTime - now) / 60000);

                const otpMessage = `🔐 <b>Your OTP for Account Linking</b>

Your 6-digit OTP code is: <code>${pendingOTP.otp}</code>

📧 This will link your Telegram to: <b>${pendingOTP.userId.email}</b>

⏰ This OTP will expire in <b>${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}</b>.

<b>📋 Next Steps:</b>
1. <b>Copy</b> the OTP code above
2. Go back to the <b>SmartKhata website</b>
3. <b>Paste</b> the OTP in the verification field
4. Click <b>"Verify & Link"</b>

<i>Do NOT send the OTP back to me. Enter it on the website!</i>`;

                await bot.sendMessage(chatId, otpMessage, { parse_mode: 'HTML' });
            } else {
                const noPendingMessage = `👋 <b>Welcome to SmartKhata Bot!</b>

I couldn't find any pending OTP for your username (@${telegramUsername}).

<b>🔗 How to Link Your Account:</b>

1️⃣ Log in to your SmartKhata account on the website
2️⃣ Go to <b>Settings → Telegram Integration</b>
3️⃣ Enter your Telegram username: <code>${telegramUsername}</code>
4️⃣ Click <b>"Generate OTP"</b>
5️⃣ Come back here and send <b>/start</b>
6️⃣ I'll send you the OTP code
7️⃣ <b>Copy the OTP</b> and paste it on the website

<b>⚠️ Important:</b>
• Enter your username exactly as: <code>${telegramUsername}</code>
• You'll paste the OTP on the website, not send it to me

<i>Ready to link? Generate your OTP from the website first!</i>`;

                await bot.sendMessage(chatId, noPendingMessage, { parse_mode: 'HTML' });
            }
        }
    } catch (error) {
        console.error("Error handling /start:", error);
        await bot.sendMessage(chatId, "❌ Sorry, something went wrong. Please try again later.");
    }
});

bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    const helpMessage = `📖 <b>SmartKhata Bot Help</b>

<b>💰 Adding Transactions:</b>
Simply send your transactions in natural language:

<u>Expenses (Debit):</u>
<code>50 chai</code>
<code>200 auto, 150 lunch</code>
<code>1000 rent
300 bijli
50 recharge</code>

<u>Income (Credit):</u>
<code>5000 salary mila</code>
<code>500 refund aya, 200 cashback</code>
<code>1000 friend se liya</code>

<b>📊 Commands:</b>
/start - Check account status
/help - Show this help message
/today - Today's transactions
/summary - This month's summary
/balance - Current month balance

<b>📂 Debit Categories (Expenses):</b>
🍽️ Food & Dining
🚗 Travel & Transport
🛍️ Shopping & Entertainment
🏠 Housing / Rent
📱 Bills & Utilities
💸 Personal & Transfers
📦 Miscellaneous

<b>💚 Credit Categories (Income):</b>
💼 Salary & Income
↩️ Refunds & Returns
🤝 Received from Others

<i>Tip: You can write in Hinglish too!</i>`;

    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
});

bot.onText(/\/today/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const user = await User.findOne({ telegramUserId });

        if (!user) {
            await bot.sendMessage(chatId, "❌ Your account is not linked. Use /start to link your account.");
            return;
        }

        const { Expense } = await import('./models/Expense.js');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expenses = await Expense.find({
            userId: user._id,
            date: { $gte: today },
        }).sort({ createdAt: -1 });

        if (expenses.length === 0) {
            await bot.sendMessage(chatId, `📅 <b>Today's Transactions</b>\n\nNo transactions recorded today.\n\n<i>Send transactions like: 50 chai, 200 auto, 5000 salary mila</i>`, { parse_mode: 'HTML' });
            return;
        }

        const debits = expenses.filter(e => e.type === "debit");
        const credits = expenses.filter(e => e.type === "credit");

        const totalDebit = debits.reduce((sum, exp) => sum + exp.amount, 0);
        const totalCredit = credits.reduce((sum, exp) => sum + exp.amount, 0);

        let message = `📅 <b>Today's Transactions</b>\n\n`;

        if (credits.length > 0) {
            message += `💚 <b>CREDIT (Income):</b>\n`;
            credits.forEach((exp, index) => {
                const emoji = getCategoryEmoji(exp.category);
                message += `${index + 1}. ${emoji} +₹${exp.amount} - ${exp.description}\n`;
            });
            message += `\n`;
        }

        if (debits.length > 0) {
            message += `❤️ <b>DEBIT (Expenses):</b>\n`;
            debits.forEach((exp, index) => {
                const emoji = getCategoryEmoji(exp.category);
                message += `${index + 1}. ${emoji} -₹${exp.amount} - ${exp.description}\n`;
            });
        }

        message += `\n━━━━━━━━━━━━━━━━━\n`;
        if (totalCredit > 0) message += `💚 <b>Total Credit:</b> +₹${totalCredit}\n`;
        if (totalDebit > 0) message += `❤️ <b>Total Debit:</b> -₹${totalDebit}\n`;
        
        const netBalance = totalCredit - totalDebit;
        message += `📊 <b>Net Balance:</b> ${netBalance >= 0 ? '+' : ''}₹${netBalance}`;

        await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
        console.error("Error in /today:", error);
        await bot.sendMessage(chatId, "❌ Something went wrong. Please try again.");
    }
});

bot.onText(/\/summary/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const user = await User.findOne({ telegramUserId });

        if (!user) {
            await bot.sendMessage(chatId, "❌ Your account is not linked. Use /start to link your account.");
            return;
        }

        const { Expense } = await import('./models/Expense.js');

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const summary = await Expense.aggregate([
            {
                $match: {
                    userId: user._id,
                    date: { $gte: startOfMonth },
                },
            },
            {
                $group: {
                    _id: { category: "$category", type: "$type" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.type": 1, total: -1 },
            },
        ]);

        if (summary.length === 0) {
            await bot.sendMessage(chatId, `📊 <b>Monthly Summary</b>\n\nNo transactions recorded this month.\n\n<i>Send transactions like: 50 chai, 200 auto, 5000 salary mila</i>`, { parse_mode: 'HTML' });
            return;
        }

        const totalDebit = summary
            .filter(s => s._id.type === "debit")
            .reduce((sum, cat) => sum + cat.total, 0);
        
        const totalCredit = summary
            .filter(s => s._id.type === "credit")
            .reduce((sum, cat) => sum + cat.total, 0);

        const monthName = new Date().toLocaleString('default', { month: 'long' });

        let message = `📊 <b>${monthName} Summary</b>\n\n`;

        const credits = summary.filter(s => s._id.type === "credit");
        if (credits.length > 0) {
            message += `💚 <b>CREDIT (Income):</b>\n`;
            credits.forEach((cat) => {
                const emoji = getCategoryEmoji(cat._id.category);
                const percentage = totalCredit > 0 ? ((cat.total / totalCredit) * 100).toFixed(1) : 0;
                message += `${emoji} <b>${cat._id.category}</b>\n`;
                message += `   ₹${cat.total} (${cat.count} items) - ${percentage}%\n\n`;
            });
        }

        const debits = summary.filter(s => s._id.type === "debit");
        if (debits.length > 0) {
            message += `❤️ <b>DEBIT (Expenses):</b>\n`;
            debits.forEach((cat) => {
                const emoji = getCategoryEmoji(cat._id.category);
                const percentage = totalDebit > 0 ? ((cat.total / totalDebit) * 100).toFixed(1) : 0;
                message += `${emoji} <b>${cat._id.category}</b>\n`;
                message += `   ₹${cat.total} (${cat.count} items) - ${percentage}%\n\n`;
            });
        }

        message += `━━━━━━━━━━━━━━━━━\n`;
        if (totalCredit > 0) message += `💚 <b>Total Credit:</b> +₹${totalCredit}\n`;
        if (totalDebit > 0) message += `❤️ <b>Total Debit:</b> -₹${totalDebit}\n`;
        
        const netBalance = totalCredit - totalDebit;
        message += `📊 <b>Net Balance:</b> ${netBalance >= 0 ? '+' : ''}₹${netBalance}`;

        await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
        console.error("Error in /summary:", error);
        await bot.sendMessage(chatId, "❌ Something went wrong. Please try again.");
    }
});

bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const user = await User.findOne({ telegramUserId });

        if (!user) {
            await bot.sendMessage(chatId, "❌ Your account is not linked. Use /start to link your account.");
            return;
        }

        const { Expense } = await import('./models/Expense.js');

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const transactions = await Expense.find({
            userId: user._id,
            date: { $gte: startOfMonth },
        });

        const totalCredit = transactions
            .filter(t => t.type === "credit")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalDebit = transactions
            .filter(t => t.type === "debit")
            .reduce((sum, t) => sum + t.amount, 0);

        const netBalance = totalCredit - totalDebit;
        const monthName = new Date().toLocaleString('default', { month: 'long' });

        const message = `💰 <b>${monthName} Balance</b>

💚 <b>Total Income:</b> +₹${totalCredit}
❤️ <b>Total Expenses:</b> -₹${totalDebit}
━━━━━━━━━━━━━━━━━
📊 <b>Net Balance:</b> ${netBalance >= 0 ? '+' : ''}₹${netBalance}

${netBalance >= 0 ? '✅ You are in surplus!' : '⚠️ You are in deficit!'}`;

        await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
        console.error("Error in /balance:", error);
        await bot.sendMessage(chatId, "❌ Something went wrong. Please try again.");
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    const telegramUserId = msg.from.id.toString();
    const telegramUsername = msg.from.username || null;

    if (!text || text.startsWith('/')) return;

    const otpRegex = /^\d{6}$/;
    if (otpRegex.test(text)) {
        try {
            const otpRecord = await TelegramOTP.findOne({
                otp: text,
                used: true,
                expiresAt: { $gt: new Date() },
            }).populate("userId");

            if (!otpRecord) {
                const invalidMessage = `❌ <b>Invalid or Expired OTP</b>

This OTP is either invalid or has expired.

<b>Please:</b>
1. Go to the website
2. Generate a new OTP
3. Send /start to get it
4. Paste it on the website (not here!)

<i>Remember: You should paste the OTP on the website, not send it to me!</i>`;

                await bot.sendMessage(chatId, invalidMessage, { parse_mode: 'HTML' });
                return;
            }

            if (telegramUsername && telegramUsername.toLowerCase() !== otpRecord.telegramUsername.toLowerCase()) {
                const mismatchMessage = `❌ <b>Username Mismatch</b>

This OTP was generated for @${otpRecord.telegramUsername}, but you are @${telegramUsername}.

Please generate a new OTP with your correct username.`;

                await bot.sendMessage(chatId, mismatchMessage, { parse_mode: 'HTML' });
                return;
            }

            const existingUser = await User.findOne({ telegramUserId });
            if (existingUser && existingUser._id.toString() !== otpRecord.userId._id.toString()) {
                await bot.sendMessage(chatId, "❌ This Telegram account is already linked to another user.");
                return;
            }

            const user = await User.findById(otpRecord.userId._id);
            user.telegramUserId = telegramUserId;
            user.telegramUsername = telegramUsername || otpRecord.telegramUsername;
            user.telegramLinkedAt = new Date();
            await user.save();

            await TelegramOTP.deleteOne({ _id: otpRecord._id });

            const successMessage = `✅ <b>Success!</b>

Your Telegram account has been linked to ${user.email}

📧 <b>Email:</b> ${user.email}
👤 <b>Name:</b> ${user.name}
📱 <b>Telegram:</b> @${user.telegramUsername}

<b>💡 You can now:</b>
• Send expenses like: <code>50 chai, 200 auto</code>
• Send income like: <code>5000 salary mila</code>
• Use /today to see today's transactions
• Use /summary for monthly summary
• Use /balance for current balance

<i>Start tracking your money now!</i>`;

            await bot.sendMessage(chatId, successMessage, { parse_mode: 'HTML' });
            return;
        } catch (error) {
            console.error("Error verifying OTP:", error);
            await bot.sendMessage(chatId, "❌ Sorry, something went wrong. Please try again.");
            return;
        }
    }

    try {
        const result = await saveExpensesFromTelegram(telegramUserId, text);

        if (result.success) {
            const message = formatExpenseResponse({ transactions: result.transactions });
            await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
        } else if (result.message) {
            await bot.sendMessage(chatId, `❌ ${result.message}`);
        }
    } catch (error) {
        console.error("Error processing message:", error);
    }
});

const getCategoryEmoji = (category) => {
    const emojis = {
        "Food & Dining": "🍽️",
        "Travel & Transport": "🚗",
        "Shopping & Entertainment": "🛍️",
        "Housing / Rent": "🏠",
        "Bills & Utilities": "📱",
        "Personal & Transfers": "💸",
        "Miscellaneous": "📦",
        "Salary & Income": "💼",
        "Refunds & Returns": "↩️",
        "Received from Others": "🤝",
    };
    return emojis[category] || "📦";
};

bot.on('polling_error', (error) => {
    console.error("❌ Polling error:", error.code, error.message);
});

process.on('SIGINT', () => {
    bot.stopPolling();
    mongoose.connection.close();
    process.exit(0);
});