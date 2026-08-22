import bot from "../bot.js";

const handleParties = async (msg) => {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from.id.toString();

    try {
        const { User } = await import("../../models/User.js");
        const { getExistingParties } = await import("../../config/partyMatcher.js");

        const user = await User.findOne({ telegramUserId });

        if (!user) {
            await bot.sendMessage(chatId, "❌ Your account is not linked. Please use /start to link your account.", {
                parse_mode: "HTML",
            });
            return;
        }

        const parties = await getExistingParties(user._id, 50);

        if (parties.length === 0) {
            await bot.sendMessage(chatId, "📭 <b>No parties saved yet</b>\n\nStart adding transactions with party names!\n\n<b>Example:</b>\n• \"Rahul ko 500 diya\"\n• \"Priya se 1000 liya\"", {
                parse_mode: "HTML",
            });
            return;
        }

        let message = `👥 <b>Your Saved Parties</b>\n`;
        message += `<i>Total: ${parties.length} parties</i>\n\n`;

        // Separate into To Receive and To Give
        const toReceive = parties.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);
        const toGive = parties.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);
        const settled = parties.filter(p => p.balance === 0);

        if (toReceive.length > 0) {
            const totalReceive = toReceive.reduce((sum, p) => sum + p.balance, 0);
            message += `📥 <b>To Receive: ₹${totalReceive}</b>\n`;
            toReceive.slice(0, 10).forEach((party, i) => {
                const lastDate = new Date(party.lastActivity).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                message += `${i + 1}. ${party.name} → +₹${party.balance} <i>(${party.count} txn, ${lastDate})</i>\n`;
            });
            if (toReceive.length > 10) {
                message += `   <i>... +${toReceive.length - 10} more</i>\n`;
            }
            message += `\n`;
        }

        if (toGive.length > 0) {
            const totalGive = Math.abs(toGive.reduce((sum, p) => sum + p.balance, 0));
            message += `📤 <b>To Give: ₹${totalGive}</b>\n`;
            toGive.slice(0, 10).forEach((party, i) => {
                const lastDate = new Date(party.lastActivity).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                message += `${i + 1}. ${party.name} → -₹${Math.abs(party.balance)} <i>(${party.count} txn, ${lastDate})</i>\n`;
            });
            if (toGive.length > 10) {
                message += `   <i>... +${toGive.length - 10} more</i>\n`;
            }
            message += `\n`;
        }

        if (settled.length > 0) {
            message += `✅ <b>Settled: ${settled.length} parties</b>\n`;
            settled.slice(0, 5).forEach((party) => {
                message += `• ${party.name}\n`;
            });
            if (settled.length > 5) {
                message += `   <i>... +${settled.length - 5} more</i>\n`;
            }
        }

        await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error in /parties:", error);
        await bot.sendMessage(chatId, "❌ Error fetching parties. Please try again.", {
            parse_mode: "HTML",
        });
    }
};

export default handleParties;

