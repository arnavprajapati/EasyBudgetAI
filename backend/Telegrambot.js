import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { TelegramOTP } from './models/TelegramOTP.js';

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

// Create bot with polling (no webhook needed!)
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 Bot is running and listening for messages...");

// Handle /start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();
    const telegramUsername = msg.from.username || null;

    try {
        // Check if user already has linked account
        const existingUser = await User.findOne({ telegramUserId });

        if (existingUser) {
            // Already linked
            const linkedMessage = `✅ <b>Account Already Linked</b>

Your Telegram account is already linked to SmartKhata.

📧 <b>Email:</b> ${existingUser.email}
👤 <b>Name:</b> ${existingUser.name}
📱 <b>Telegram:</b> @${existingUser.telegramUsername || 'N/A'}
🔗 <b>Linked on:</b> ${existingUser.telegramLinkedAt ? new Date(existingUser.telegramLinkedAt).toLocaleDateString() : 'N/A'}

<i>You're all set! You'll receive notifications and updates from SmartKhata here.</i>`;

            await bot.sendMessage(chatId, linkedMessage, { parse_mode: 'HTML' });
        } else {
            // Not linked - check if there's a pending OTP for this username
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

// Handle OTP messages (6 digits)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    const telegramUserId = msg.from.id.toString();
    const telegramUsername = msg.from.username || null;

    if (text?.startsWith('/')) return;

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

<i>You will now receive notifications and updates from SmartKhata directly in Telegram.</i>`;

            await bot.sendMessage(chatId, successMessage, { parse_mode: 'HTML' });
        } catch (error) {
            console.error("Error verifying OTP:", error);
            await bot.sendMessage(chatId, "❌ Sorry, something went wrong. Please try again.");
        }
    } else if (text && text.length > 0) {
        // Not an OTP - send help
        const helpMessage = `❓ <b>How to Link Your Account</b>

To link your Telegram account:

1. Go to SmartKhata website
2. Settings → Telegram Integration  
3. Enter username: <code>${telegramUsername || 'your_username'}</code>
4. Click "Generate OTP"
5. Send <b>/start</b> to me
6. I'll send you a 6-digit OTP
7. <b>Copy and paste</b> it on the website
8. Click "Verify & Link"

<i>The OTP goes on the website, not here!</i>`;

        await bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
    }
});

bot.on('polling_error', (error) => {
    console.error("❌ Polling error:", error.code, error.message);
});

process.on('SIGINT', () => {
    bot.stopPolling();
    mongoose.connection.close();
    process.exit(0);
});