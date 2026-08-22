import bot from "../bot.js";

const handleSummary = async (msg) => {
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
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactions = await Expense.find({
            userId: user._id,
            date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        if (transactions.length === 0) {
            await bot.sendMessage(chatId, "📭 <b>No transactions this month</b>\n\nStart tracking your expenses!", {
                parse_mode: "HTML",
            });
            return;
        }

        const credits = transactions.filter(t => t.type === "credit");
        const debits = transactions.filter(t => t.type === "debit");

        const totalCredit = credits.reduce((sum, t) => sum + t.amount, 0);
        const totalDebit = debits.reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalCredit - totalDebit;

        const categoryTotals = {};
        debits.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const monthName = startOfMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

        let message = `📊 <b>Monthly Summary</b>\n`;
        message += `<i>${monthName}</i>\n\n`;

        message += `💰 <b>Total Income:</b> +₹${totalCredit}\n`;
        message += `💸 <b>Total Expenses:</b> -₹${totalDebit}\n`;
        message += `📈 <b>Net Balance:</b> ${netBalance >= 0 ? "+" : ""}₹${netBalance}\n\n`;

        if (Object.keys(categoryTotals).length > 0) {
            message += `🏷️ <b>Expense Breakdown:</b>\n`;
            const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
            sortedCategories.forEach(([category, amount]) => {
                const percentage = ((amount / totalDebit) * 100).toFixed(1);
                message += `• ${category}: ₹${amount} (${percentage}%)\n`;
            });
            message += `\n`;
        }

        message += `📝 <b>Total Transactions:</b> ${transactions.length}`;

        await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error in /summary:", error);
        await bot.sendMessage(chatId, "❌ Error fetching summary. Please try again.", {
            parse_mode: "HTML",
        });
    }
};

export default handleSummary;

