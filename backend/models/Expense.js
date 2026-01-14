import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        telegramId: {
            type: String,
            default: null,
        },
        amount: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["debit", "credit"],
            default: "debit",
            required: true,
        },
        category: {
            type: String,
            enum: [
                "Food & Dining",
                "Travel & Transport",
                "Shopping & Entertainment",
                "Housing / Rent",
                "Bills & Utilities",
                "Personal & Transfers",
                "Miscellaneous",

                "Salary & Income",
                "Refunds & Returns",
                "Received from Others",
            ],
            default: "Miscellaneous",
        },
        date: {
            type: Date,
            default: Date.now,
        },
        source: {
            type: String,
            enum: ["telegram", "web"],
            default: "web",
        },
        partyName: {
            type: String,
            default: null,
        },
        isPending: {
            type: Boolean,
            default: false,
        },
        khataType: {
            type: String,
            enum: ["to_receive", "to_give", null],
            default: null,
        },
    },
    { timestamps: true }
);

schema.index({ userId: 1, date: -1 });
schema.index({ telegramId: 1 });
schema.index({ userId: 1, type: 1 });
schema.index({ userId: 1, partyName: 1 });

export const Expense = mongoose.model("Expense", schema);