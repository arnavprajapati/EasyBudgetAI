import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { redisClient } from "./redis.js";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const telegramBot = BOT_TOKEN ? new TelegramBot(BOT_TOKEN, { polling: false }) : null;


export const storeTelegramChatId = async (telegramUsername, chatId) => {
    try {
        if (!telegramUsername) return;
        const key = `telegram:chatid:${telegramUsername.toLowerCase()}`;
        await redisClient.setEx(key, 24 * 60 * 60, chatId.toString());
        console.log(`📱 Stored chatId for @${telegramUsername} with key: ${key}, value: ${chatId}`);
    } catch (error) {
        console.error("Error storing telegram chatId:", error);
    }
};


export const getTelegramChatId = async (telegramUsername) => {
    try {
        if (!telegramUsername) return null;
        const key = `telegram:chatid:${telegramUsername.toLowerCase()}`;
        console.log(`🔍 Looking for chatId with key: ${key}`);
        const chatId = await redisClient.get(key);
        console.log(`🔍 Found chatId: ${chatId}`);
        return chatId;
    } catch (error) {
        console.error("Error getting telegram chatId:", error);
        return null;
    }
};


export const sendOTPToTelegram = async (telegramUsername, otp, expiresAt) => {
    try {
        if (!telegramBot) {
            console.log("❌ Telegram bot not initialized");
            return { success: false, reason: "bot_not_initialized" };
        }

        const chatId = await getTelegramChatId(telegramUsername);
        if (!chatId) {
            console.log(`❌ No chatId found for @${telegramUsername}`);
            return { success: false, reason: "no_chat_id" };
        }

        const expiresInMinutes = Math.floor((new Date(expiresAt) - new Date()) / 60000);

        const otpMessage = `
🔐 <b>Your OTP Code</b>

Your verification code is: <code>${otp}</code>

<b>Steps to complete linking:</b>
1. Go back to SmartKhata website
2. Enter this OTP in the verification field
3. Click "Verify & Continue"
4. Come back here and send <code>${otp}</code> to complete linking

⏱️ <b>Expires in:</b> ${expiresInMinutes} minutes

<i>Keep this OTP secure and don't share it with anyone!</i>
`;

        await telegramBot.sendMessage(chatId, otpMessage, { parse_mode: "HTML" });
        console.log(`✅ OTP sent to @${telegramUsername} (chatId: ${chatId})`);
        return { success: true };
    } catch (error) {
        console.error("Error sending OTP to Telegram:", error);
        return { success: false, reason: "send_error", error: error.message };
    }
};


export const sendTelegramMessage = async (telegramUsername, message) => {
    try {
        if (!telegramBot) {
            return { success: false, reason: "bot_not_initialized" };
        }

        const chatId = await getTelegramChatId(telegramUsername);
        if (!chatId) {
            return { success: false, reason: "no_chat_id" };
        }

        await telegramBot.sendMessage(chatId, message, { parse_mode: "HTML" });
        return { success: true };
    } catch (error) {
        console.error("Error sending Telegram message:", error);
        return { success: false, reason: "send_error", error: error.message };
    }
};
