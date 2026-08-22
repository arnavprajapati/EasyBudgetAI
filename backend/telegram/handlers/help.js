import bot from "../bot.js";

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
/parties - List all saved parties

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

export default handleHelp;

