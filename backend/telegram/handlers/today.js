import bot from "../bot.js";

const handleToday = async (msg) => {
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

        message += `📈 <b>Income:</b> +₹${totalCredit}\n`;
        message += `📉 <b>Expenses:</b> -₹${totalDebit}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

        todayExpenses.forEach((expense) => {
            const timeStr = new Date(expense.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
            const isCredit = expense.type === "credit";
            const icon = isCredit ? "🟢" : "🔴";
            const sign = isCredit ? "+" : "-";
            message += `${icon} <b>${sign}₹${expense.amount}</b> • ${expense.description}\n`;
            message += `   <i>${expense.category} • ${timeStr}</i>\n\n`;
        });

        message += `━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📊 <b>Total Transactions:</b> ${todayExpenses.length}`;

        await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error in /today:", error);
        await bot.sendMessage(chatId, "❌ Error fetching today's transactions. Please try again.", {
            parse_mode: "HTML",
        });
    }
};

export default handleToday;

