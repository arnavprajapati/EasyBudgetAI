import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an expense parser for an Indian budget tracking app called SmartKhata.

Your task: Analyze Telegram text messages and convert them into clean, structured transaction data (both expenses AND income).

Input characteristics:
- The input may contain ONE or MULTIPLE transaction lines.
- Each line represents either an EXPENSE (debit) or INCOME (credit).
- Language can be Hinglish / English / Hindi / casual text.
- Spelling mistakes are possible.

Your responsibilities:
1. Split the text into individual transaction entries.
2. For each transaction:
    - Determine if it's a DEBIT (expense/spent) or CREDIT (income/received).
    - Extract the amount (mandatory, in INR).
    - Rewrite the description in clean, readable English.
    - Assign EXACTLY ONE category from the fixed list below.
3. If the category is unclear, assign "Miscellaneous".
4. Do NOT invent new categories.
5. Ignore commands, emojis, or filler words.
6. If an amount is missing in any line, skip that line completely.

TRANSACTION TYPE DETECTION:
- CREDIT (income/received): Keywords like "mila", "aya", "received", "salary", "income", "refund", "cashback", "got", "paid me", "payment received", "se liya", "friend ne diya", "paisa aya"
- DEBIT (expense/spent): Everything else (default) - "khaya", "kharida", "diya", "paid", "bought", "spent"

Allowed categories (STRICT - use exactly as written):

DEBIT Categories (Expenses):
- Food & Dining
- Travel & Transport
- Housing / Rent
- Shopping & Entertainment
- Bills & Utilities
- Personal & Transfers
- Miscellaneous

CREDIT Categories (Income):
- Salary & Income
- Refunds & Returns
- Received from Others

Category mapping examples:

DEBIT (Expenses):
- "chai", "khana", "roti", "paneer", "juice", "zomato", "swiggy", "groceries", "nashta", "lunch", "dinner" → Food & Dining
- "uber", "ola", "auto", "petrol", "bus", "metro", "rapido", "cab", "taxi", "parking" → Travel & Transport
- "rent", "bijli", "electricity", "water bill", "gas bill", "maintenance", "ghar" → Housing / Rent
- "shopping", "movie", "cinema", "theater", "concert", "game", "entertainment" → Shopping & Entertainment
- "recharge", "wifi", "netflix", "mobile", "internet", "subscription", "gym" → Bills & Utilities
- "friend ko diye", "sent to", "given to", "transfer", "upi", "udhar diya" → Personal & Transfers

CREDIT (Income):
- "salary", "income", "kamaya", "payment mila", "freelance", "business income" → Salary & Income
- "refund", "cashback", "return", "wapas mila", "cancelled order" → Refunds & Returns
- "friend se liya", "received from", "paisa aya", "dost ne diye", "payment received", "udhar wapas mila" → Received from Others

CRITICAL OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object. No explanation, no markdown, no extra text.

{
    "transactions": [
        {
            "amount": <number>,
            "description": "<clean English string>",
            "category": "<exact category from list>",
            "type": "debit" | "credit"
        }
    ]
}

If no valid transactions found, return:
{"transactions": []}`;

export const parseExpenses = async (messageText) => {
    if (!messageText || typeof messageText !== "string" || messageText.trim().length === 0) {
        return { date: new Date().toISOString().split("T")[0], transactions: [] };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `${SYSTEM_PROMPT}

User Input:
${messageText}

Remember: Return ONLY valid JSON with "transactions" array, nothing else.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        text = text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

        const parsed = JSON.parse(text);

        if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
            console.error("Invalid Gemini response structure:", text);
            return { date: new Date().toISOString().split("T")[0], transactions: [] };
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

        const validTransactions = parsed.transactions
            .filter((txn) => {
                return (
                    txn &&
                    typeof txn.amount === "number" &&
                    txn.amount > 0 &&
                    typeof txn.description === "string" &&
                    txn.description.trim().length > 0 &&
                    (txn.type === "debit" || txn.type === "credit")
                );
            })
            .map((txn) => {
                let category;
                if (txn.type === "credit") {
                    category = validCreditCategories.includes(txn.category)
                        ? txn.category
                        : "Received from Others";
                } else {
                    category = validDebitCategories.includes(txn.category)
                        ? txn.category
                        : "Miscellaneous";
                }

                return {
                    amount: Math.round(txn.amount * 100) / 100,
                    description: txn.description.trim(),
                    category: category,
                    type: txn.type,
                };
            });

        return {
            date: new Date().toISOString().split("T")[0],
            transactions: validTransactions,
        };
    } catch (error) {
        console.error("Gemini parsing error:", error.message);

        return fallbackParser(messageText);
    }
};

const fallbackParser = (messageText) => {
    const debitKeywords = {
        "Food & Dining": ["chai", "tea", "coffee", "khana", "food", "lunch", "dinner", "breakfast", "nashta", "juice", "zomato", "swiggy", "grocery", "sabzi"],
        "Travel & Transport": ["auto", "uber", "ola", "rapido", "cab", "taxi", "petrol", "diesel", "bus", "metro", "train", "parking"],
        "Shopping & Entertainment": ["shopping", "movie", "cinema", "theater", "concert", "game", "entertainment"],
        "Housing / Rent": ["rent", "kiraya", "bijli", "electricity", "water", "gas", "maintenance"],
        "Bills & Utilities": ["recharge", "mobile", "wifi", "internet", "netflix", "subscription", "gym"],
        "Personal & Transfers": ["ko diya", "ko diye", "given", "sent", "transfer", "upi"],
    };

    const creditKeywords = {
        "Salary & Income": ["salary", "income", "kamaya", "payment mila", "freelance", "business"],
        "Refunds & Returns": ["refund", "cashback", "return", "wapas mila", "cancelled"],
        "Received from Others": ["se liya", "received", "paisa aya", "dost ne diye", "friend ne diya", "payment received", "udhar wapas"],
    };

    const lines = messageText.split(/[\n,]+/).map((l) => l.trim()).filter(Boolean);
    const transactions = [];

    for (let line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.startsWith("/")) continue;

        const amountMatch = line.match(/(\d+(?:\.\d{1,2})?)/);
        if (!amountMatch) continue;

        const amount = parseFloat(amountMatch[1]);
        if (amount <= 0) continue;

        let description = line.replace(/\d+(?:\.\d{1,2})?/g, "").trim();
        description = description.replace(/^(rs|₹|rupees?)\s*/i, "").trim();

        let type = "debit";
        let category = "Miscellaneous";

        let foundCredit = false;
        for (const [cat, keywords] of Object.entries(creditKeywords)) {
            if (keywords.some((kw) => lowerLine.includes(kw))) {
                type = "credit";
                category = cat;
                foundCredit = true;
                break;
            }
        }

        if (!foundCredit) {
            for (const [cat, keywords] of Object.entries(debitKeywords)) {
                if (keywords.some((kw) => lowerLine.includes(kw))) {
                    category = cat;
                    break;
                }
            }
        }

        if (!description) description = category.split(" ")[0];

        transactions.push({
            amount,
            description: description.charAt(0).toUpperCase() + description.slice(1),
            category,
            type,
        });
    }

    return { date: new Date().toISOString().split("T")[0], transactions };
};

export const formatExpenseResponse = (parsedData) => {
    const transactions = Array.isArray(parsedData) 
        ? parsedData 
        : parsedData?.transactions || [];
    
    if (!transactions || transactions.length === 0) {
        return null;
    }

    const debits = transactions.filter(t => t.type === "debit");
    const credits = transactions.filter(t => t.type === "credit");

    const totalDebit = debits.reduce((sum, exp) => sum + exp.amount, 0);
    const totalCredit = credits.reduce((sum, exp) => sum + exp.amount, 0);

    let message = `✅ <b>Transactions Recorded!</b>\n\n`;
    message += `📅 <b>Date:</b> ${new Date().toLocaleDateString("en-IN")}\n\n`;

    if (credits.length > 0) {
        message += `💰 <b>CREDIT (Income):</b>\n`;
        credits.forEach((txn, index) => {
            const categoryEmoji = getCategoryEmoji(txn.category);
            message += `${index + 1}. ${categoryEmoji} +₹${txn.amount} - ${txn.description}\n`;
            message += `   <i>${txn.category}</i>\n\n`;
        });
    }

    if (debits.length > 0) {
        message += `💸 <b>DEBIT (Expenses):</b>\n`;
        debits.forEach((txn, index) => {
            const categoryEmoji = getCategoryEmoji(txn.category);
            message += `${index + 1}. ${categoryEmoji} -₹${txn.amount} - ${txn.description}\n`;
            message += `   <i>${txn.category}</i>\n\n`;
        });
    }

    message += `━━━━━━━━━━━━━━━━━\n`;
    if (credits.length > 0) message += `💚 <b>Total Credit:</b> +₹${totalCredit}\n`;
    if (debits.length > 0) message += `❤️ <b>Total Debit:</b> -₹${totalDebit}\n`;

    const netBalance = totalCredit - totalDebit;
    if (credits.length > 0 && debits.length > 0) {
        message += `📊 <b>Net:</b> ${netBalance >= 0 ? '+' : ''}₹${netBalance}`;
    }

    return message;
};

const getCategoryEmoji = (category) => {
    const emojis = {
        "Food & Dining": "🍽️",
        "Travel & Transport": "🚗",
        "Shopping & Entertainment": "🛍️",
        "Housing / Rent": "🏠",
        "Bills & Utilities": "📱",
        "Personal & Transfers": "💸",
        "Miscellaneous": "📦",
        "Salary & Income": "💼",
        "Refunds & Returns": "↩️",
        "Received from Others": "🤝",
    };
    return emojis[category] || "📦";
};