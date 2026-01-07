import express from "express";
import {
    addExpense,
    addBulkExpenses,
    getExpenses,
    getExpenseSummary,
    updateExpense,
    deleteExpense,
    parseExpenseText,
    getParties,
    getPartyTransactions,
} from "../controllers/expense.js";
import { isAuth } from "../middlewares/isAuth.js";
import { verifyCSRFToken } from "../config/csrfMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/add", isAuth, verifyCSRFToken, addExpense);
router.post("/bulk", isAuth, verifyCSRFToken, addBulkExpenses);
router.get("/all", isAuth, getExpenses);
router.get("/summary", isAuth, getExpenseSummary);
router.put("/:id", isAuth, verifyCSRFToken, updateExpense);
router.delete("/:id", isAuth, verifyCSRFToken, deleteExpense);
router.post("/parse", isAuth, parseExpenseText);

// Party/Khata routes
router.get("/parties", isAuth, getParties);
router.get("/parties/:partyName", isAuth, getPartyTransactions);

export default router;