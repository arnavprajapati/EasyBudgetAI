import bot from "../bot.js";

const handleStatus = async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const { User } = await import("../../models/User.js");
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

export default handleStatus;

