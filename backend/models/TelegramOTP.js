import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        telegramUsername: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        used: {
            type: Boolean,
            default: false,
        },
        usedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TelegramOTP = mongoose.model("TelegramOTP", schema);