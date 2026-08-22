import bot from "../bot.js";
import { storeTelegramChatId } from "../../config/telegramHelper.js";

const handleStart = async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();
    const telegramUsername = msg.from.username;

    if (telegramUsername) {
        await storeTelegramChatId(telegramUsername, chatId);
    }

    try {
        const { User } = await import("../../models/User.js");
        const { TelegramOTP } = await import("../../models/TelegramOTP.js");

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

export default handleStart;

