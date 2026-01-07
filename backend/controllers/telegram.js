import TryCatch from "../middlewares/TryCatch.js";
import { TelegramOTP } from "../models/TelegramOTP.js";
import { User } from "../models/User.js";
import { sendOTPToTelegram } from "../config/telegramHelper.js";


export const generateTelegramOTP = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { telegramUsername } = req.body;

    if (!telegramUsername || !telegramUsername.trim()) {
        return res.status(400).json({
            message: "Telegram username is required",
        });
    }

    const cleanUsername = telegramUsername.trim().replace(/^@/, "");

    const usernameRegex = /^[a-zA-Z0-9_]{5,32}$/;
    if (!usernameRegex.test(cleanUsername)) {
        return res.status(400).json({
            message: "Invalid Telegram username format. Username must be 5-32 characters and contain only letters, numbers, and underscores.",
        });
    }

    const user = await User.findById(userId);
    if (user.telegramUserId) {
        return res.status(400).json({
            message: "Telegram account already linked",
            telegramUsername: user.telegramUsername,
        });
    }

    const existingUser = await User.findOne({
        telegramUsername: cleanUsername,
        telegramUserId: { $ne: null }
    });

    if (existingUser) {
        return res.status(400).json({
            message: "This Telegram username is already linked to another account",
        });
    }

    await TelegramOTP.deleteMany({ userId, used: false });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await TelegramOTP.create({
        userId,
        otp,
        telegramUsername: cleanUsername,
        expiresAt,
        used: false,
    });

    let otpSentToTelegram = false;
    let needsToStartBot = false;
    try {
        const sendResult = await sendOTPToTelegram(cleanUsername, otp, expiresAt);
        otpSentToTelegram = sendResult.success;
        if (sendResult.reason === "no_chat_id") {
            needsToStartBot = true;
        }
    } catch (error) {
        console.error("Failed to send OTP to Telegram:", error);
    }

    res.json({
        message: otpSentToTelegram
            ? "OTP sent to your Telegram! Check your chat with the bot."
            : needsToStartBot
                ? "Please send /start to the bot first, then click 'Generate OTP' again."
                : "OTP generated! Please send /start to the bot to receive your OTP.",
        otpSentToTelegram,
        needsToStartBot,
        botUsername: process.env.TELEGRAM_BOT_USERNAME || "@smart_khata_bot",
        telegramUsername: cleanUsername,
        expiresAt,
    });
});

/**
 * Verify OTP from website and link account
 * POST /api/v1/telegram/verify-otp
 * Requires authentication
 * Body: { otp: string, telegramUserId: string }
 */
export const verifyOTPFromWebsite = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { otp } = req.body;

    if (!otp || !otp.trim()) {
        return res.status(400).json({
            message: "OTP is required",
        });
    }

    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp.trim())) {
        return res.status(400).json({
            message: "Invalid OTP format. OTP must be 6 digits.",
        });
    }

    const otpRecord = await TelegramOTP.findOne({
        userId,
        otp: otp.trim(),
        used: false,
        expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
        return res.status(400).json({
            message: "Invalid or expired OTP. Please generate a new one.",
        });
    }

    const user = await User.findById(userId);
    if (user.telegramUserId) {
        return res.status(400).json({
            message: "Telegram account already linked",
        });
    }

    const existingUser = await User.findOne({
        telegramUsername: otpRecord.telegramUsername,
        telegramUserId: { $ne: null }
    });

    if (existingUser) {
        return res.status(400).json({
            message: "This Telegram username is already linked to another account",
        });
    }

    otpRecord.used = true;
    otpRecord.usedAt = new Date();
    await otpRecord.save();

    user.telegramUsername = otpRecord.telegramUsername;
    user.telegramLinkedAt = new Date();
    await user.save();

    res.json({
        message: "OTP verified successfully! Now send the OTP to your Telegram bot to complete linking.",
        telegramUsername: otpRecord.telegramUsername,
        botUsername: process.env.TELEGRAM_BOT_USERNAME || "@smart_khata_bot",
    });
});

/**
 * Internal function: Verify Telegram OTP from bot and complete linking
 * This is called by the webhook when user sends OTP to bot
 */
export const verifyTelegramOTPFromBot = async (otp, telegramUserId, telegramUsername) => {
    const otpRecord = await TelegramOTP.findOne({
        otp,
        used: true,
        expiresAt: { $gt: new Date() },
    }).populate("userId");

    if (!otpRecord) {
        return {
            success: false,
            message: "❌ Invalid or expired OTP. Please generate a new one from the website.",
        };
    }

    if (telegramUsername && telegramUsername.toLowerCase() !== otpRecord.telegramUsername.toLowerCase()) {
        return {
            success: false,
            message: `❌ Username mismatch. This OTP was generated for @${otpRecord.telegramUsername}, but you are @${telegramUsername}.`,
        };
    }

    const existingUser = await User.findOne({ telegramUserId });
    if (existingUser && existingUser._id.toString() !== otpRecord.userId._id.toString()) {
        return {
            success: false,
            message: "❌ This Telegram account is already linked to another user.",
        };
    }

    const user = await User.findById(otpRecord.userId._id);
    user.telegramUserId = telegramUserId;
    user.telegramUsername = telegramUsername || otpRecord.telegramUsername;
    user.telegramLinkedAt = new Date();
    await user.save();

    await TelegramOTP.deleteOne({ _id: otpRecord._id });

    return {
        success: true,
        message: `✅ Success! Your Telegram account has been linked to ${user.email}

📧 Email: ${user.email}
👤 Name: ${user.name}
📱 Telegram: @${user.telegramUsername}

You will now receive notifications and updates from SmartKhata directly in Telegram.`,
        user: {
            name: user.name,
            email: user.email,
        },
    };
};

/**
 * Unlink Telegram account
 * POST /api/v1/telegram/unlink
 * Requires authentication
 */
export const unlinkTelegram = TryCatch(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user.telegramUserId) {
        return res.status(400).json({
            message: "No Telegram account linked",
        });
    }

    const telegramUsername = user.telegramUsername;

    user.telegramUserId = null;
    user.telegramUsername = null;
    user.telegramLinkedAt = null;
    await user.save();

    await TelegramOTP.deleteMany({ userId });

    res.json({
        message: `Telegram account @${telegramUsername} unlinked successfully`,
    });
});

/**
 * Get Telegram link status
 * GET /api/v1/telegram/status
 * Requires authentication
 */
export const getTelegramStatus = TryCatch(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    res.json({
        linked: !!user.telegramUserId,
        telegramUsername: user.telegramUsername,
        telegramLinkedAt: user.telegramLinkedAt,
        botUsername: process.env.TELEGRAM_BOT_USERNAME || "@smart_khata_bot",
    });
});