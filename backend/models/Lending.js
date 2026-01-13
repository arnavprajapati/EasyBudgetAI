import mongoose from "mongoose";

/**
 * Lending Model - Track money lent/borrowed between user and others
 * 
 * Types:
 * - "lent": User gave money to someone (they owe user)
 * - "borrowed": User took money from someone (user owes them)
 * 
 * Status:
 * - "pending": Money not yet returned
 * - "partial": Partially returned
 * - "settled": Fully returned/paid back
 */

const schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Person's name (AI will extract from transaction description)
        personName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        // Original amount
        originalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Amount still pending (decreases as payments are made)
        pendingAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Type: "lent" (user gave money) or "borrowed" (user took money)
        type: {
            type: String,
            enum: ["lent", "borrowed"],
            required: true,
            index: true,
        },

        // Status
        status: {
            type: String,
            enum: ["pending", "partial", "settled"],
            default: "pending",
            index: true,
        },

        // Transaction description
        description: {
            type: String,
            required: true,
        },

        // Date when money was lent/borrowed
        date: {
            type: Date,
            default: Date.now,
            index: true,
        },

        // Payment history (when partial payments are made)
        payments: [
            {
                amount: {
                    type: Number,
                    required: true,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
                description: {
                    type: String,
                    default: "Payment received",
                },
            },
        ],

        // Source: telegram, web
        source: {
            type: String,
            enum: ["telegram", "web"],
            default: "web",
        },

        // Reference to original expense transaction
        expenseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense",
        },

        // Notes/remarks
        notes: {
            type: String,
            default: "",
        },

        // Reminder settings
        reminderEnabled: {
            type: Boolean,
            default: false,
        },

        nextReminderDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for efficient queries
schema.index({ userId: 1, type: 1, status: 1 });
schema.index({ userId: 1, personName: 1 });
schema.index({ userId: 1, date: -1 });

// Virtual: Calculate amount paid
schema.virtual("amountPaid").get(function () {
    return this.originalAmount - this.pendingAmount;
});

// Virtual: Calculate payment percentage
schema.virtual("paymentPercentage").get(function () {
    if (this.originalAmount === 0) return 0;
    return Math.round((this.amountPaid / this.originalAmount) * 100);
});

// Method: Add payment
schema.methods.addPayment = function (amount, description = "Payment received") {
    if (amount <= 0) {
        throw new Error("Payment amount must be positive");
    }

    if (amount > this.pendingAmount) {
        throw new Error("Payment amount exceeds pending amount");
    }

    this.payments.push({
        amount,
        date: new Date(),
        description
    });

    this.pendingAmount -= amount;

    // Update status
    if (this.pendingAmount === 0) {
        this.status = "settled";
    } else if (this.pendingAmount < this.originalAmount) {
        this.status = "partial";
    }

    return this;
};

// Static method: Get summary for a user
schema.statics.getSummary = async function (userId) {
    const lendingSummary = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                status: { $ne: "settled" }
            }
        },
        {
            $group: {
                _id: "$type",
                totalAmount: { $sum: "$pendingAmount" },
                count: { $sum: 1 },
                persons: {
                    $push: {
                        name: "$personName",
                        amount: "$pendingAmount",
                        date: "$date"
                    }
                }
            }
        }
    ]);

    const result = {
        toLend: 0,      // Total amount user needs to collect (user gave money)
        toBorrow: 0,    // Total amount user needs to pay back (user took money)
        lentCount: 0,
        borrowedCount: 0,
        lentPersons: [],
        borrowedPersons: []
    };

    lendingSummary.forEach(item => {
        if (item._id === "lent") {
            result.toLend = item.totalAmount;
            result.lentCount = item.count;
            result.lentPersons = item.persons;
        } else if (item._id === "borrowed") {
            result.toBorrow = item.totalAmount;
            result.borrowedCount = item.count;
            result.borrowedPersons = item.persons;
        }
    });

    return result;
};

// Static method: Get person-wise summary
schema.statics.getPersonWiseSummary = async function (userId) {
    const summary = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                status: { $ne: "settled" }
            }
        },
        {
            $group: {
                _id: {
                    personName: "$personName",
                    type: "$type"
                },
                totalPending: { $sum: "$pendingAmount" },
                totalOriginal: { $sum: "$originalAmount" },
                count: { $sum: 1 },
                transactions: {
                    $push: {
                        id: "$_id",
                        amount: "$pendingAmount",
                        originalAmount: "$originalAmount",
                        date: "$date",
                        description: "$description",
                        status: "$status"
                    }
                }
            }
        },
        {
            $sort: { totalPending: -1 }
        }
    ]);

    return summary;
};

export const Lending = mongoose.model("Lending", schema);