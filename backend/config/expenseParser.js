import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an expense parser for an Indian budget tracking app called SmartKhata.

Your task: Analyze Telegram text messages and convert them into clean, structured expense data.

Input characteristics:
- The input may contain ONE or MULTIPLE expense lines.
- Each line usually starts with an amount but may be written casually.
- Language can be Hinglish / English / Hindi / casual text.
- Spelling mistakes are possible.
- Each line represents a separate expense.

Your responsibilities:
1. Split the text into individual expense entries (one expense per line or comma-separated).
2. For each expense:
    - Extract the amount (mandatory, in INR).
    - Rewrite the description in clean, readable English (capitalize properly).
    - Assign EXACTLY ONE category from the fixed list below.
3. If the category is unclear, assign "Miscellaneous".
4. Do NOT invent new categories.
5. Ignore commands, emojis, or filler words.
6. If an amount is missing in any line, skip that line completely.

Allowed categories (STRICT - use exactly as written):
- Food & Dining
- Travel & Transport
- Housing / Rent
- Bills & Utilities
- Personal & Transfers
- Miscellaneous

Category mapping examples:
- "chai", "khana", "roti", "paneer", "juice", "zomato", "swiggy", "groceries", "nashta", "lunch", "dinner" → Food & Dining
- "uber", "ola", "auto", "petrol", "bus", "metro", "rapido", "cab", "taxi", "parking" → Travel & Transport
- "rent", "bijli", "electricity", "water bill", "gas bill", "maintenance", "ghar" → Housing / Rent
- "recharge", "wifi", "netflix", "mobile", "internet", "subscription", "gym" → Bills & Utilities
- "friend ko diye", "sent to", "given to", "transfer", "upi", "udhar" → Personal & Transfers
- Anything unclear → Miscellaneous

CRITICAL OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object. No explanation, no markdown, no extra text.

{
    "expenses": [
        {
            "amount": <number>,
            "description": "<clean English string>",
            "category": "<exact category from list>"
        }
    ]
}

If no valid expenses found, return:
{"expenses": []}`;

export const parseExpenses = async (messageText) => {
    if (!messageText || typeof messageText !== "string" || messageText.trim().length === 0) {
        return { date: new Date().toISOString().split("T")[0], expenses: [] };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `${SYSTEM_PROMPT}

User Input:
${messageText}

Remember: Return ONLY valid JSON, nothing else.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        text = text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

        const parsed = JSON.parse(text);

        if (!parsed.expenses || !Array.isArray(parsed.expenses)) {
            console.error("Invalid Gemini response structure:", text);
            return { date: new Date().toISOString().split("T")[0], expenses: [] };
        }

        const validCategories = [
            "Food & Dining",
            "Travel & Transport",
            "Housing / Rent",
            "Bills & Utilities",
            "Personal & Transfers",
            "Miscellaneous",
        ];

        const validExpenses = parsed.expenses
            .filter((exp) => {
                return (
                    exp &&
                    typeof exp.amount === "number" &&
                    exp.amount > 0 &&
                    typeof exp.description === "string" &&
                    exp.description.trim().length > 0
                );
            })
            .map((exp) => ({
                amount: Math.round(exp.amount * 100) / 100, 
                description: exp.description.trim(),
                category: validCategories.includes(exp.category) ? exp.category : "Miscellaneous",
            }));

        return {
            date: new Date().toISOString().split("T")[0],
            expenses: validExpenses,
        };
    } catch (error) {
        console.error("Gemini parsing error:", error.message);

        return fallbackParser(messageText);
    }
};

const fallbackParser = (messageText) => {
    const categoryKeywords = {
        "Food & Dining": ["chai", "tea", "coffee", "khana", "food", "lunch", "dinner", "breakfast", "nashta", "juice", "zomato", "swiggy", "grocery", "sabzi"],
        "Travel & Transport": ["auto", "uber", "ola", "rapido", "cab", "taxi", "petrol", "diesel", "bus", "metro", "train", "parking"],
        "Housing / Rent": ["rent", "kiraya", "bijli", "electricity", "water", "gas", "maintenance"],
        "Bills & Utilities": ["recharge", "mobile", "wifi", "internet", "netflix", "subscription", "gym"],
        "Personal & Transfers": ["ko diya", "ko diye", "given", "sent", "transfer", "upi", "udhar"],
    };

    const lines = messageText.split(/[\n,]+/).map((l) => l.trim()).filter(Boolean);
    const expenses = [];

    for (let line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.startsWith("/")) continue;

        const amountMatch = line.match(/(\d+(?:\.\d{1,2})?)/);
        if (!amountMatch) continue;

        const amount = parseFloat(amountMatch[1]);
        if (amount <= 0) continue;

        let description = line.replace(/\d+(?:\.\d{1,2})?/g, "").trim();
        description = description.replace(/^(rs|₹|rupees?)\s*/i, "").trim();

        let category = "Miscellaneous";
        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some((kw) => lowerLine.includes(kw))) {
                category = cat;
                break;
            }
        }

        if (!description) description = category.split(" ")[0];

        expenses.push({
            amount,
            description: description.charAt(0).toUpperCase() + description.slice(1),
            category,
        });
    }

    return { date: new Date().toISOString().split("T")[0], expenses };
};

export const formatExpenseResponse = (parsedData) => {
    if (!parsedData.expenses || parsedData.expenses.length === 0) {
        return null;
    }

    const total = parsedData.expenses.reduce((sum, exp) => sum + exp.amount, 0);

    let message = `✅ <b>Expenses Recorded!</b>\n\n`;
    message += `📅 <b>Date:</b> ${new Date().toLocaleDateString("en-IN")}\n\n`;

    parsedData.expenses.forEach((exp, index) => {
        const categoryEmoji = getCategoryEmoji(exp.category);
        message += `${index + 1}. ${categoryEmoji} ₹${exp.amount} - ${exp.description}\n`;
        message += `   <i>${exp.category}</i>\n\n`;
    });

    message += `💰 <b>Total:</b> ₹${total}`;

    return message;
};

const getCategoryEmoji = (category) => {
    const emojis = {
        "Food & Dining": "🍽️",
        "Travel & Transport": "🚗",
        "Housing / Rent": "🏠",
        "Bills & Utilities": "📱",
        "Personal & Transfers": "💸",
        "Miscellaneous": "📦",
    };
    return emojis[category] || "📦";
};