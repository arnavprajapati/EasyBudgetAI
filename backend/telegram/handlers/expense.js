import bot from "../bot.js";
import { saveExpensesFromTelegram } from "../../controllers/expense.js";
import { formatExpenseResponse } from "../../config/expenseParser.js";

const handleExpenseMessage = async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    const telegramUserId = msg.from.id.toString();

    if (!messageText || typeof messageText !== "string" || messageText.trim().length === 0) {
        return;
    }

    try {
        const { getPendingTransaction, clearPendingTransaction } = await import("../../config/partyMatcher.js");
        const pendingData = await getPendingTransaction(telegramUserId);

        // --- Handle pending "waiting for new party name" state ---
        if (pendingData && pendingData.waitingForPartyName) {
            const newPartyName = messageText.trim();
            const { transaction } = pendingData;

            const { User } = await import("../../models/User.js");
            const { Expense } = await import("../../models/Expense.js");

            const user = await User.findOne({ telegramUserId });
            if (!user) {
                await bot.sendMessage(chatId, "❌ Account not linked. Use /start first.", { parse_mode: "HTML" });
                return;
            }

            const descLower = transaction.description?.toLowerCase() || '';
            const isPending = descLower.includes('pending:') ||
                descLower.includes('to receive') ||
                descLower.includes('to pay');

            await Expense.create({
                userId: user._id,
                telegramId: telegramUserId,
                amount: transaction.amount,
                description: transaction.description,
                category: transaction.category,
                type: transaction.type,
                date: new Date(),
                source: "telegram",
                partyName: newPartyName,
                isPending: isPending,
                khataType: newPartyName ? (transaction.type === 'debit' ? 'to_receive' : 'to_give') : null,
            });

            await clearPendingTransaction(telegramUserId);

            const typeEmoji = transaction.type === 'credit' ? '💰' : '💸';
            let confirmMsg = `✅ <b>Transaction Saved!</b>\n\n`;
            confirmMsg += `${typeEmoji} Amount: ₹${transaction.amount}\n`;
            confirmMsg += `📝 ${transaction.description}\n`;
            confirmMsg += `🏷️ Category: ${transaction.category}\n`;
            confirmMsg += `👤 Party: ${newPartyName} <i>(New)</i>\n`;
            if (isPending) {
                confirmMsg += `⏳ Status: Pending\n`;
            }

            await bot.sendMessage(chatId, confirmMsg, { parse_mode: "HTML" });
            return;
        }

        // --- Normal expense message flow ---
        const result = await saveExpensesFromTelegram(telegramUserId, messageText, { checkParty: true });

        if (result.rateLimited || result.isDuplicate) {
            await bot.sendMessage(chatId, result.message, { parse_mode: "HTML" });
            return;
        }

        if (!result.success && !result.message && !result.needsClarification) {
            return;
        }

        // --- Party clarification needed ---
        if (result.needsClarification) {
            const { clarificationData } = result;
            const { clarificationInfo, transaction, transactionIndex } = clarificationData;

            const { storePendingTransaction, buildPartySelectionKeyboard, formatClarificationMessage } = await import("../../config/partyMatcher.js");
            await storePendingTransaction(telegramUserId, clarificationData);

            const keyboard = buildPartySelectionKeyboard({
                similarParties: clarificationInfo.similarParties || [],
                recentParties: clarificationInfo.recentParties || [],
                originalPartyName: clarificationInfo.originalPartyName || transaction.partyName,
                transactionIndex: transactionIndex || 0,
                showCreateNew: true,
                showSkip: true
            });

            const message = formatClarificationMessage(transaction, clarificationInfo);

            await bot.sendMessage(chatId, message, {
                parse_mode: "HTML",
                reply_markup: keyboard
            });
            return;
        }

        if (!result.success) {
            await bot.sendMessage(chatId, result.message, { parse_mode: "HTML" });
            return;
        }

        const formattedResponse = formatExpenseResponse(result.transactions, result.user);

        // If a similar transaction was recorded in the last 60 seconds, attach warning & Undo button
        if (result.potentialDuplicate && result.createdExpenses && result.createdExpenses.length === 1) {
            const expenseId = result.createdExpenses[0]._id.toString();
            const warningText = `\n⚠️ <i>Note: Aapne abhi ${result.potentialDuplicate.timeDifferenceSeconds}s pehle bhi ₹${result.potentialDuplicate.previousAmount} (${result.potentialDuplicate.previousDescription}) add kiya tha.</i>`;

            await bot.sendMessage(chatId, formattedResponse + warningText, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🗑️ Undo This Transaction",
                                callback_data: `undo_expense:${expenseId}`
                            }
                        ]
                    ]
                }
            });
            return;
        }

        await bot.sendMessage(chatId, formattedResponse, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error handling expense:", error);
        await bot.sendMessage(chatId, "❌ Something went wrong. Please try again or check if your message format is correct.\n\nExample: '50 chai' or '200 uber'", {
            parse_mode: "HTML",
        });
    }
};

export default handleExpenseMessage;

