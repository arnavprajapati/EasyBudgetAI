import { Lending } from "../models/Lending.js";
import { Expense } from "../models/Expense.js";
import TryCatch from "../middlewares/TryCatch.js";
import { analyzeLendingTransaction } from "../config/lendingParser.js";

/**
 * Add a new lending/borrowing record
 * POST /api/v1/lending/add
 */
export const addLending = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { personName, amount, type, description, date } = req.body;

    if (!personName || !amount || !type) {
        return res.status(400).json({
            message: "Person name, amount, and type are required",
        });
    }

    if (amount <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than 0",
        });
    }

    if (!["lent", "borrowed"].includes(type)) {
        return res.status(400).json({
            message: "Type must be either 'lent' or 'borrowed'",
        });
    }

    const lending = await Lending.create({
        userId,
        personName: personName.trim(),
        originalAmount: amount,
        pendingAmount: amount,
        type,
        description: description || `${type === "lent" ? "Lent to" : "Borrowed from"} ${personName}`,
        date: date ? new Date(date) : new Date(),
        source: "web",
        status: "pending",
    });

    res.status(201).json({
        message: `${type === "lent" ? "Lending" : "Borrowing"} record added successfully`,
        lending,
    });
});

export const getLendings = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { type, status, personName, startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = { userId };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (personName) filter.personName = new RegExp(personName, "i");

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [lendings, total] = await Promise.all([
        Lending.find(filter)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Lending.countDocuments(filter),
    ]);

    res.json({
        lendings,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
});

export const getLendingSummary = TryCatch(async (req, res) => {
    const userId = req.user._id;

    const summary = await Lending.getSummary(userId);

    res.json({
        summary,
        message: summary.toLend > 0 || summary.toBorrow > 0
            ? `You need to collect ₹${summary.toLend} and pay back ₹${summary.toBorrow}`
            : "All settled! No pending lendings or borrowings."
    });
});

export const getPersonWiseSummary = TryCatch(async (req, res) => {
    const userId = req.user._id;

    const summary = await Lending.getPersonWiseSummary(userId);

    const personSummary = {};

    summary.forEach(item => {
        const person = item._id.personName;
        const type = item._id.type;

        if (!personSummary[person]) {
            personSummary[person] = {
                name: person,
                toLend: 0,
                toBorrow: 0,
                netBalance: 0,
                transactions: []
            };
        }

        if (type === "lent") {
            personSummary[person].toLend += item.totalPending;
        } else if (type === "borrowed") {
            personSummary[person].toBorrow += item.totalPending;
        }

        personSummary[person].transactions.push(...item.transactions);
    });

    Object.values(personSummary).forEach(person => {
        person.netBalance = person.toLend - person.toBorrow;
    });

    res.json({
        summary: Object.values(personSummary).sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance))
    });
});

export const addPayment = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            message: "Valid payment amount is required",
        });
    }

    const lending = await Lending.findOne({ _id: id, userId });

    if (!lending) {
        return res.status(404).json({
            message: "Lending record not found",
        });
    }

    if (lending.status === "settled") {
        return res.status(400).json({
            message: "This lending is already settled",
        });
    }

    if (amount > lending.pendingAmount) {
        return res.status(400).json({
            message: `Payment amount (₹${amount}) exceeds pending amount (₹${lending.pendingAmount})`,
        });
    }

    lending.addPayment(amount, description || "Payment received");
    await lending.save();

    res.json({
        message: `Payment of ₹${amount} recorded successfully`,
        lending,
        remainingAmount: lending.pendingAmount,
    });
});

export const updateLending = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const { personName, description, notes, reminderEnabled, nextReminderDate } = req.body;

    const lending = await Lending.findOne({ _id: id, userId });

    if (!lending) {
        return res.status(404).json({
            message: "Lending record not found",
        });
    }

    if (personName !== undefined) lending.personName = personName.trim();
    if (description !== undefined) lending.description = description;
    if (notes !== undefined) lending.notes = notes;
    if (reminderEnabled !== undefined) lending.reminderEnabled = reminderEnabled;
    if (nextReminderDate !== undefined) lending.nextReminderDate = nextReminderDate;

    await lending.save();

    res.json({
        message: "Lending record updated successfully",
        lending,
    });
});

export const deleteLending = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const lending = await Lending.findOneAndDelete({ _id: id, userId });

    if (!lending) {
        return res.status(404).json({
            message: "Lending record not found",
        });
    }

    res.json({
        message: "Lending record deleted successfully",
    });
});

export const settleLending = TryCatch(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const lending = await Lending.findOne({ _id: id, userId });

    if (!lending) {
        return res.status(404).json({
            message: "Lending record not found",
        });
    }

    if (lending.status === "settled") {
        return res.status(400).json({
            message: "This lending is already settled",
        });
    }

    lending.status = "settled";
    const pendingBeforeSettle = lending.pendingAmount;
    lending.pendingAmount = 0;

    if (pendingBeforeSettle > 0) {
        lending.payments.push({
            amount: pendingBeforeSettle,
            date: new Date(),
            description: "Marked as settled"
        });
    }

    await lending.save();

    res.json({
        message: `Lending of ₹${lending.originalAmount} with ${lending.personName} marked as settled`,
        lending,
    });
});

/**
 * ✅ FIXED: Auto-detect and create lending from expense
 * AI analyzes the FULL context to determine lending type
 * NO keyword checking - only AI decision
 */
export const autoCreateLendingFromExpense = async (expense, userId) => {
    try {
        // Only process relevant categories
        const isPersonalTransfer = expense.category === "Personal & Transfers";
        const isReceivedFromOthers = expense.category === "Received from Others";
        
        if (!isPersonalTransfer && !isReceivedFromOthers) {
            return null;
        }

        // ✅ AI will analyze and return: { isLending, personName, lendingType }
        const aiAnalysis = await analyzeLendingTransaction(expense);

        if (!aiAnalysis.isLending || !aiAnalysis.personName) {
            console.log("❌ AI says: Not a lending transaction or no person found");
            return null;
        }

        const { personName, lendingType } = aiAnalysis;

        console.log(`✅ AI Decision: "${personName}" - Type: ${lendingType}`);

        // Check if similar lending already exists (prevent duplicates)
        const existingLending = await Lending.findOne({
            userId,
            personName: new RegExp(`^${personName}$`, "i"),
            type: lendingType,
            status: { $ne: "settled" },
            createdAt: { $gte: new Date(Date.now() - 5000) }
        });

        if (existingLending) {
            console.log("⚠️ Similar lending already exists, skipping");
            return existingLending;
        }

        // Create lending record
        const lending = await Lending.create({
            userId,
            personName,
            originalAmount: expense.amount,
            pendingAmount: expense.amount,
            type: lendingType,
            description: expense.description,
            date: expense.date,
            source: expense.source,
            expenseId: expense._id,
            status: "pending",
        });

        console.log(`✅ Lending created: ${lendingType} ₹${expense.amount} - ${personName}`);
        return lending;
    } catch (error) {
        console.error("❌ Error auto-creating lending:", error);
        return null;
    }
};