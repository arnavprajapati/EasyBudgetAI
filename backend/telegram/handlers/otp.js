import bot from "../bot.js";
import { verifyTelegramOTPFromBot } from "../../controllers/telegram.js";

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

export default handleOTP;

