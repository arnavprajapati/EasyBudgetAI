import bot from "../bot.js";

const handleCallbackQuery = async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const telegramUserId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;

    try {
        // --- Handle Undo Expense Callback ---
        if (data && data.startsWith('undo_expense:')) {
            const expenseId = data.split(':')[1];
            const { Expense } = await import("../../models/Expense.js");
            const deleted = await Expense.findOneAndDelete({
                _id: expenseId,
                telegramId: telegramUserId
            });

            await bot.answerCallbackQuery(callbackQuery.id, { text: "Transaction removed!" });

            if (deleted) {
                await bot.editMessageText(
                    `🗑️ <b>Transaction Removed</b>\n\n<s>₹${deleted.amount} - ${deleted.description}</s> has been deleted from your expenses.`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: "HTML"
                    }
                );
            } else {
                await bot.editMessageText(
                    `ℹ️ Transaction already removed or not found.`,
                    { chat_id: chatId, message_id: messageId }
                );
            }
            return;
        }

        const { getPendingTransaction, clearPendingTransaction } = await import("../../config/partyMatcher.js");
        const pendingData = await getPendingTransaction(telegramUserId);

        if (!pendingData) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Session expired. Please try again." });
            await bot.deleteMessage(chatId, messageId);
            return;
        }

        const { transaction, allTransactions } = pendingData;
        let selectedParty = null;

        const [action, indexStr, ...valueParts] = data.split(':');
        const value = valueParts.join(':');

        if (action === 'party_select') {
            selectedParty = value;

        } else if (action === 'party_new') {
            const { storePendingTransaction } = await import("../../config/partyMatcher.js");
            await storePendingTransaction(telegramUserId, {
                ...pendingData,
                waitingForPartyName: true,
                originalPartyName: value || transaction.partyName
            });

            await bot.deleteMessage(chatId, messageId);

            const promptMsg = `✏️ <b>Enter Unique Party Name</b>\n\n` +
                `Original: "<b>${value || transaction.partyName}</b>"\n\n` +
                `💡 <i>Add identifier to make it unique:</i>\n` +
                `• ${value || transaction.partyName} Office\n` +
                `• ${value || transaction.partyName} College\n` +
                `• ${value || transaction.partyName} Delhi\n\n` +
                `<i>Send the new party name as a message...</i>`;

            await bot.sendMessage(chatId, promptMsg, { parse_mode: "HTML" });
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Enter new party name" });
            return;

        } else if (action === 'party_skip') {
            selectedParty = null;

        } else if (action === 'party_cancel') {
            await clearPendingTransaction(telegramUserId);
            await bot.deleteMessage(chatId, messageId);
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Transaction cancelled" });
            return;

        } else if (action === 'party_prompt') {
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Please send the party name as a message" });
            return;

        } else if (action === 'party_viewall') {
            const { User } = await import("../../models/User.js");
            const { getExistingParties } = await import("../../config/partyMatcher.js");

            const user = await User.findOne({ telegramUserId });
            if (!user) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "Account not linked!" });
                return;
            }

            const allParties = await getExistingParties(user._id, 20);

            if (allParties.length === 0) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "No saved parties yet!" });
                return;
            }

            const partyKeyboard = [];
            for (const party of allParties) {
                const lastDate = new Date(party.lastActivity).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                const balanceSign = party.balance >= 0 ? '+' : '';
                const label = `👤 ${party.name} (${balanceSign}₹${party.balance} • ${lastDate})`;
                partyKeyboard.push([{
                    text: label,
                    callback_data: `party_select:0:${party.name}`
                }]);
            }

            partyKeyboard.push([
                { text: `➕ Enter New Party`, callback_data: `party_prompt:0` },
                { text: `⏭️ Skip Party`, callback_data: `party_skip:0` }
            ]);
            partyKeyboard.push([{
                text: `❌ Cancel Transaction`,
                callback_data: `party_cancel:0`
            }]);

            const typeEmoji = transaction.type === "credit" ? "💰" : "💸";
            let message = `${typeEmoji} <b>Select Party</b>\n\n`;
            message += `💵 Amount: ₹${transaction.amount}\n`;
            message += `📝 ${transaction.description}\n\n`;
            message += `👥 <b>All Your Parties:</b>`;

            await bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: partyKeyboard }
            });

            await bot.answerCallbackQuery(callbackQuery.id, { text: "Showing all parties" });
            return;
        }

        // --- Commit the transaction with the resolved party ---
        transaction.partyName = selectedParty;

        const { User } = await import("../../models/User.js");
        const { Expense } = await import("../../models/Expense.js");

        const user = await User.findOne({ telegramUserId });
        if (!user) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Account not linked!" });
            return;
        }

        const descLower = transaction.description?.toLowerCase() || '';
        const isPending = descLower.includes('pending:') ||
            descLower.includes('to receive') ||
            descLower.includes('to pay');

        let finalDescription = transaction.description;
        if (selectedParty && transaction.partyName && selectedParty !== transaction.partyName) {
            const regex = new RegExp(transaction.partyName, 'gi');
            finalDescription = transaction.description.replace(regex, selectedParty);
        }

        await Expense.create({
            userId: user._id,
            telegramId: telegramUserId,
            amount: transaction.amount,
            description: finalDescription,
            category: transaction.category,
            type: transaction.type,
            date: new Date(),
            source: "telegram",
            partyName: selectedParty,
            isPending: isPending,
            khataType: selectedParty ? (transaction.type === 'debit' ? 'to_receive' : 'to_give') : null,
        });

        await clearPendingTransaction(telegramUserId);
        await bot.deleteMessage(chatId, messageId);

        const typeEmoji = transaction.type === 'credit' ? '💰' : '💸';
        let confirmMsg = `✅ <b>Transaction Saved!</b>\n\n`;
        confirmMsg += `${typeEmoji} Amount: ₹${transaction.amount}\n`;
        confirmMsg += `📝 ${transaction.description}\n`;
        confirmMsg += `🏷️ Category: ${transaction.category}\n`;
        if (selectedParty) {
            confirmMsg += `👤 Party: ${selectedParty}\n`;
        }
        if (isPending) {
            confirmMsg += `⏳ Status: Pending\n`;
        }

        await bot.sendMessage(chatId, confirmMsg, { parse_mode: "HTML" });
        await bot.answerCallbackQuery(callbackQuery.id, { text: "✅ Saved!" });

    } catch (error) {
        console.error("Error handling callback query:", error);
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Error occurred. Try again." });
    }
};

export default handleCallbackQuery;

