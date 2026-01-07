import { Expense } from "../models/Expense.js";
import { User } from "../models/User.js";
import TryCatch from "../middlewares/TryCatch.js";
import { parseExpenses } from "../config/expenseParser.js";

export const addExpense = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { amount, description, category, date, type } = req.body;

    if (!amount || !description) {
        return res.status(400).json({
            message: "Amount and description are required",
        });
    }

    if (amount <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than 0",
        });
    }

    const transactionType = type === "credit" ? "credit" : "debit";

    const validDebitCategories = [
        "Food & Dining",
        "Travel & Transport",
        "Shopping & Entertainment",
        "Housing / Rent",
        "Bills & Utilities",
        "Personal & Transfers",
        "Miscellaneous",
    ];

    const validCreditCategories = [
        "Salary & Income",
        "Refunds & Returns",
        "Received from Others",
    ];

    let expenseCategory;
    if (transactionType === "credit") {
        expenseCategory = validCreditCategories.includes(category)
            ? category
            : "Received from Others";
    } else {
        expenseCategory = validDebitCategories.includes(category)
            ? category
            : "Miscellaneous";
    }

    const expense = await Expense.create({
        userId,
        amount,
        description,
        category: expenseCategory,
        type: transactionType,
        date: date ? new Date(date) : new Date(),
        source: "web",
    });

    res.status(201).json({
        message: `${transactionType === "credit" ? "Income" : "Expense"} added successfully`,
        expense,
    });
});

export const addBulkExpenses = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({
            message: "Transactions array is required",
        });
    }

    const validDebitCategories = [
        "Food & Dining",
        "Travel & Transport",
        "Shopping & Entertainment",
        "Housing / Rent",
        "Bills & Utilities",
        "Personal & Transfers",
        "Miscellaneous",
    ];

    const validCreditCategories = [
        "Salary & Income",
        "Refunds & Returns",
        "Received from Others",
    ];

    const expensesToCreate = transactions.map((txn) => {
        const transactionType = txn.type === "credit" ? "credit" : "debit";
        let category;

        if (transactionType === "credit") {
            category = validCreditCategories.includes(txn.category)
                ? txn.category
                : "Received from Others";
        } else {
            category = validDebitCategories.includes(txn.category)
                ? txn.category
                : "Miscellaneous";
        }

        return {
            userId,
            amount: txn.amount,
            description: txn.description,
            category: category,
            type: transactionType,
            date: txn.date ? new Date(txn.date) : new Date(),
            source: txn.source || "web",
        };
    });

    const createdExpenses = await Expense.insertMany(expensesToCreate);

    res.status(201).json({
        message: `${createdExpenses.length} transactions added successfully`,
        transactions: createdExpenses,
    });
});

export const getExpenses = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate, category, source, type, page = 1, limit = 50 } = req.query;

    const filter = { userId };

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (category) filter.category = category;
    if (source) filter.source = source;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
        Expense.find(filter)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Expense.countDocuments(filter),
    ]);

    res.json({
        expenses,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
});

export const getExpenseSummary = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { period = "month" } = req.query;

    let startDate;
    const now = new Date();

    switch (period) {
        case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
        case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const summary = await Expense.aggregate([
        {
            $match: {
                userId: userId,
                date: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: { category: "$category", type: "$type" },
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { "_id.type": 1, total: -1 },
        },
    ]);

    const totalDebit = summary
        .filter(cat => cat._id.type === "debit")
        .reduce((sum, cat) => sum + cat.total, 0);

    const totalCredit = summary
        .filter(cat => cat._id.type === "credit")
        .reduce((sum, cat) => sum + cat.total, 0);

    const debitBreakdown = summary
        .filter(cat => cat._id.type === "debit")
        .map((cat) => ({
            category: cat._id.category,
            type: "debit",
            total: cat.total,
            count: cat.count,
            percentage: totalDebit > 0 ? ((cat.total / totalDebit) * 100).toFixed(2) : 0,
        }));

    const creditBreakdown = summary
        .filter(cat => cat._id.type === "credit")
        .map((cat) => ({
            category: cat._id.category,
            type: "credit",
            total: cat.total,
            count: cat.count,
            percentage: totalCredit > 0 ? ((cat.total / totalCredit) * 100).toFixed(2) : 0,
        }));

    const netBalance = totalCredit - totalDebit;

    res.json({
        period,
        totalDebit,
        totalCredit,
        netBalance,
        debitBreakdown,
        creditBreakdown,
        transactionCount: summary.reduce((sum, cat) => sum + cat.count, 0),
    });
});

export const updateExpense = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const { amount, description, category, date, type } = req.body;

    const expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
        return res.status(404).json({
            message: "Transaction not found",
        });
    }

    if (amount !== undefined) expense.amount = amount;
    if (description !== undefined) expense.description = description;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (type !== undefined) expense.type = type;

    await expense.save();

    res.json({
        message: "Transaction updated successfully",
        expense,
    });
});

export const deleteExpense = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
        return res.status(404).json({
            message: "Transaction not found",
        });
    }

    res.json({
        message: "Transaction deleted successfully",
    });
});

export const parseExpenseText = TryCatch(async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
        return res.status(400).json({
            message: "Text is required",
        });
    }

    const parsed = await parseExpenses(text);

    res.json({
        message: "Text parsed successfully",
        ...parsed,
    });
});

export const saveExpensesFromTelegram = async (telegramUserId, messageText, options = {}) => {
    const { checkParty = false } = options;

    try {
        const user = await User.findOne({ telegramUserId });

        if (!user) {
            return {
                success: false,
                message: "Your Telegram account is not linked. Please link it first from the website.",
            };
        }

        const parsed = await parseExpenses(messageText);

        if (!parsed.transactions || parsed.transactions.length === 0) {
            return {
                success: false,
                message: null,
            };
        }

        // Check if party clarification is needed (only if checkParty is enabled)
        if (checkParty) {
            const { needsPartyClarification } = await import("../config/partyMatcher.js");
            for (let i = 0; i < parsed.transactions.length; i++) {
                const txn = parsed.transactions[i];
                const clarification = await needsPartyClarification(user._id, txn);

                if (clarification.needsClarification) {
                    return {
                        success: false,
                        needsClarification: true,
                        clarificationData: {
                            transaction: txn,
                            clarificationInfo: clarification,
                            transactionIndex: i,
                            allTransactions: parsed.transactions
                        },
                        user: { name: user.name, email: user.email }
                    };
                }
            }
        }

        const expensesToCreate = parsed.transactions.map((txn) => {
            // Check if this is a pending transaction (lena hai / dena hai)
            const isPending = txn.description?.toLowerCase().includes('pending:') ||
                txn.description?.toLowerCase().includes('to receive') ||
                txn.description?.toLowerCase().includes('to pay');

            return {
                userId: user._id,
                telegramId: telegramUserId,
                amount: txn.amount,
                description: txn.description,
                category: txn.category,
                type: txn.type,
                date: new Date(),
                source: "telegram",
                partyName: txn.partyName || null,
                isPending: isPending,
            };
        });

        await Expense.insertMany(expensesToCreate);

        return {
            success: true,
            transactions: parsed.transactions,
            user: { name: user.name, email: user.email },
        };
    } catch (error) {
        console.error("Error saving transactions from Telegram:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again.",
        };
    }
};

// Get all parties (khata) for a user with balance summary
export const getParties = TryCatch(async (req, res) => {
    const userId = req.user._id;

    // Get all transactions with party names
    const transactions = await Expense.find({
        userId,
        partyName: { $ne: null, $exists: true }
    }).sort({ date: -1 }).lean();

    // Group by party and calculate balances
    const partyMap = new Map();

    for (const txn of transactions) {
        const partyName = txn.partyName;
        if (!partyName) continue;

        const key = partyName.toLowerCase();
        const existing = partyMap.get(key);

        // Calculate khata logic:
        // "maine diya" / "given" = they owe me (To Receive)
        // "maine liya" / "received" = I owe them (To Give)  
        // "lena hai" / "to receive" = pending receivable
        // "dena hai" / "to pay" = pending payable

        const descLower = txn.description?.toLowerCase() || '';
        const isToReceive = txn.isPending && descLower.includes('to receive');
        const isToPay = txn.isPending && descLower.includes('to pay');

        // For completed transactions:
        // If I gave money (debit to Personal), they owe me
        // If I received money (credit from Others), I owe them
        const isGiven = !txn.isPending && txn.type === 'debit' &&
            (txn.category === 'Personal & Transfers');
        const isReceived = !txn.isPending && txn.type === 'credit' &&
            (txn.category === 'Received from Others');

        if (existing) {
            existing.count++;
            existing.lastActivity = Math.max(existing.lastActivity, new Date(txn.date).getTime());

            if (isToReceive) {
                existing.toReceive += txn.amount;
            } else if (isToPay) {
                existing.toGive += txn.amount;
            } else if (isGiven) {
                existing.toReceive += txn.amount; // They owe me
            } else if (isReceived) {
                existing.toGive += txn.amount; // I owe them
            }

            existing.transactions.push(txn);
        } else {
            partyMap.set(key, {
                name: partyName,
                count: 1,
                lastActivity: new Date(txn.date).getTime(),
                toReceive: (isToReceive || isGiven) ? txn.amount : 0,
                toGive: (isToPay || isReceived) ? txn.amount : 0,
                transactions: [txn]
            });
        }
    }

    // Convert to array and calculate net balance
    const parties = Array.from(partyMap.values())
        .map(party => ({
            name: party.name,
            count: party.count,
            lastActivity: party.lastActivity,
            toReceive: party.toReceive,
            toGive: party.toGive,
            netBalance: party.toReceive - party.toGive, // Positive = they owe me
        }))
        .sort((a, b) => b.lastActivity - a.lastActivity);

    res.json({
        success: true,
        parties,
        summary: {
            totalToReceive: parties.reduce((sum, p) => sum + p.toReceive, 0),
            totalToGive: parties.reduce((sum, p) => sum + p.toGive, 0),
            netBalance: parties.reduce((sum, p) => sum + p.netBalance, 0)
        }
    });
});

// Get all transactions for a specific party
export const getPartyTransactions = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { partyName } = req.params;

    if (!partyName) {
        return res.status(400).json({
            success: false,
            message: "Party name is required"
        });
    }

    const transactions = await Expense.find({
        userId,
        partyName: { $regex: new RegExp(`^${partyName}$`, 'i') }
    }).sort({ date: -1 }).lean();

    // Calculate running balance
    let toReceive = 0;
    let toGive = 0;

    const processedTransactions = transactions.map(txn => {
        const descLower = txn.description?.toLowerCase() || '';
        const isToReceive = txn.isPending && descLower.includes('to receive');
        const isToPay = txn.isPending && descLower.includes('to pay');
        const isGiven = !txn.isPending && txn.type === 'debit' &&
            txn.category === 'Personal & Transfers';
        const isReceived = !txn.isPending && txn.type === 'credit' &&
            txn.category === 'Received from Others';

        if (isToReceive || isGiven) {
            toReceive += txn.amount;
        } else if (isToPay || isReceived) {
            toGive += txn.amount;
        }

        return {
            ...txn,
            khataType: isToReceive ? 'To Receive (Pending)' :
                isToPay ? 'To Pay (Pending)' :
                    isGiven ? 'Given (To Receive)' :
                        isReceived ? 'Received (To Pay)' : 'Other'
        };
    });

    res.json({
        success: true,
        partyName,
        transactions: processedTransactions,
        summary: {
            toReceive,
            toGive,
            netBalance: toReceive - toGive,
            transactionCount: transactions.length
        }
    });
});