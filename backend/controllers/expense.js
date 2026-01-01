import { Expense } from "../models/Expense.js";
import { User } from "../models/User.js";
import TryCatch from "../middlewares/TryCatch.js";
import { parseExpenses } from "../config/expenseParser.js";

export const addExpense = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { amount, description, category, date } = req.body;

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

    const validCategories = [
        "Food & Dining",
        "Travel & Transport",
        "Housing / Rent",
        "Bills & Utilities",
        "Personal & Transfers",
        "Miscellaneous",
    ];

    const expenseCategory = validCategories.includes(category) ? category : "Miscellaneous";

    const expense = await Expense.create({
        userId,
        amount,
        description,
        category: expenseCategory,
        date: date ? new Date(date) : new Date(),
        source: "web",
    });

    res.status(201).json({
        message: "Expense added successfully",
        expense,
    });
});

export const addBulkExpenses = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { expenses } = req.body;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
        return res.status(400).json({
            message: "Expenses array is required",
        });
    }

    const validCategories = [
        "Food & Dining",
        "Travel & Transport",
        "Housing / Rent",
        "Bills & Utilities",
        "Personal & Transfers",
        "Miscellaneous",
    ];

    const expensesToCreate = expenses.map((exp) => ({
        userId,
        amount: exp.amount,
        description: exp.description,
        category: validCategories.includes(exp.category) ? exp.category : "Miscellaneous",
        date: exp.date ? new Date(exp.date) : new Date(),
        source: exp.source || "web",
    }));

    const createdExpenses = await Expense.insertMany(expensesToCreate);

    res.status(201).json({
        message: `${createdExpenses.length} expenses added successfully`,
        expenses: createdExpenses,
    });
});

export const getExpenses = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate, category, source, page = 1, limit = 50 } = req.query;

    const filter = { userId };

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (category) filter.category = category;
    if (source) filter.source = source;

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
                _id: "$category",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { total: -1 },
        },
    ]);

    const totalExpense = summary.reduce((sum, cat) => sum + cat.total, 0);

    const categoryBreakdown = summary.map((cat) => ({
        category: cat._id,
        total: cat.total,
        count: cat.count,
        percentage: ((cat.total / totalExpense) * 100).toFixed(2),
    }));

    res.json({
        period,
        totalExpense,
        categoryBreakdown,
        transactionCount: summary.reduce((sum, cat) => sum + cat.count, 0),
    });
});

export const updateExpense = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const { amount, description, category, date } = req.body;

    const expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
        return res.status(404).json({
            message: "Expense not found",
        });
    }

    if (amount !== undefined) expense.amount = amount;
    if (description !== undefined) expense.description = description;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);

    await expense.save();

    res.json({
        message: "Expense updated successfully",
        expense,
    });
});

export const deleteExpense = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
        return res.status(404).json({
            message: "Expense not found",
        });
    }

    res.json({
        message: "Expense deleted successfully",
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

export const saveExpensesFromTelegram = async (telegramUserId, messageText) => {
    try {
        const user = await User.findOne({ telegramUserId });

        if (!user) {
            return {
                success: false,
                message: "Your Telegram account is not linked. Please link it first from the website.",
            };
        }

        const parsed = await parseExpenses(messageText); 

        if (!parsed.expenses || parsed.expenses.length === 0) {
            return {
                success: false,
                message: null,
            };
        }

        const expensesToCreate = parsed.expenses.map((exp) => ({
            userId: user._id,
            telegramId: telegramUserId,
            amount: exp.amount,
            description: exp.description,
            category: exp.category,
            date: new Date(),
            source: "telegram",
        }));

        await Expense.insertMany(expensesToCreate);

        return {
            success: true,
            expenses: parsed.expenses,
            user: { name: user.name, email: user.email },
        };
    } catch (error) {
        console.error("Error saving expenses from Telegram:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again.",
        };
    }
};