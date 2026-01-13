import express from "express";
import {
    addLending,
    getLendings,
    getLendingSummary,
    getPersonWiseSummary,
    addPayment,
    updateLending,
    deleteLending,
    settleLending,
} from "../controllers/lending.js";
import { isAuth } from "../middlewares/isAuth.js";
import { verifyCSRFToken } from "../config/csrfMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// GET routes (no CSRF needed)
router.get("/all", getLendings);
router.get("/summary", getLendingSummary);
router.get("/person-wise", getPersonWiseSummary);

// POST/PUT/DELETE routes (CSRF required)
router.post("/add", verifyCSRFToken, addLending);
router.post("/:id/payment", verifyCSRFToken, addPayment);
router.post("/:id/settle", verifyCSRFToken, settleLending);
router.put("/:id", verifyCSRFToken, updateLending);
router.delete("/:id", verifyCSRFToken, deleteLending);

export default router;