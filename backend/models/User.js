import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      default: "user",
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    photoURL: {
      type: String,
      default: null,
    },
    telegramUserId: {
      type: String,
      unique: true,
      sparse: true,
    },
    telegramUsername: {
      type: String,
      default: null,
    },
    telegramLinkedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", schema);