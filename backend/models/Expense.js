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
        category: {
            type: String,
            enum: [
                "Food & Dining",
                "Travel & Transport",
                "Housing / Rent",
                "Bills & Utilities",
                "Personal & Transfers",
                "Miscellaneous",
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
    },
    { timestamps: true }
);

schema.index({ userId: 1, date: -1 });
schema.index({ telegramId: 1 });

export const Expense = mongoose.model("Expense", schema);