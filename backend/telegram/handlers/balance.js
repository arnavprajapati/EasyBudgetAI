import bot from "../bot.js";

const handleBalance = async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const { User } = await import("../../models/User.js");
        const { Expense } = await import("../../models/Expense.js");

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

        let message = `💼 <b>Current Month Balance</b>\n`;
        message += `<i>${monthName}</i>\n\n`;
        message += `📈 <b>Income:</b> +₹${totalCredit}\n`;
        message += `📉 <b>Expenses:</b> -₹${totalDebit}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📊 <b>Net Balance:</b> ${netBalance >= 0 ? "+" : ""}₹${netBalance}`;

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

export default handleBalance;

