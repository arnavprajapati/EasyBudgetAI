import dotenv from "dotenv";
import { redisClient } from "./redis.js";
import crypto from "crypto";

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

const RATE_LIMIT_CONFIG = {
    userRequests: {
        maxRequests: 30,
        windowSeconds: 60,
    },
    globalRequests: {
        maxRequests: 200,
        windowSeconds: 60,
    },
    burstProtection: {
        maxRequests: 5,
        windowSeconds: 10,
    },
    deduplication: {
        windowSeconds: 5,
    },
    cooldownSeconds: 30,
};


const generateRequestHash = (userId, messageText) => {
    const content = `${userId}:${messageText.toLowerCase().trim()}`;
    return crypto.createHash('md5').update(content).digest('hex');
};


const isDuplicateRequest = async (userId, messageText) => {
    try {
        const hash = generateRequestHash(userId, messageText);
        const key = `gemini:dedup:${hash}`;

        const exists = await redisClient.get(key);
        if (exists) {
            console.log(`🔄 Duplicate request detected for user ${userId}`);
            return { isDuplicate: true, cachedResult: JSON.parse(exists) };
        }

        return { isDuplicate: false };
    } catch (error) {
        console.error("Deduplication check error:", error);
        return { isDuplicate: false };
    }
};

const cacheRequestResult = async (userId, messageText, result) => {
    try {
        const hash = generateRequestHash(userId, messageText);
        const key = `gemini:dedup:${hash}`;

        await redisClient.setEx(
            key,
            RATE_LIMIT_CONFIG.deduplication.windowSeconds,
            JSON.stringify(result)
        );
    } catch (error) {
        console.error("Result caching error:", error);
    }
};

const checkRateLimit = async (key, maxRequests, windowSeconds) => {
    try {
        const current = await redisClient.incr(key);

        if (current === 1) {
            await redisClient.expire(key, windowSeconds);
        }

        const ttl = await redisClient.ttl(key);

        return {
            allowed: current <= maxRequests,
            current,
            limit: maxRequests,
            remaining: Math.max(0, maxRequests - current),
            resetIn: ttl > 0 ? ttl : windowSeconds,
        };
    } catch (error) {
        console.error("Rate limit check error:", error);
        return { allowed: true, current: 0, limit: maxRequests, remaining: maxRequests, resetIn: 0 };
    }
};


const isInCooldown = async (userId) => {
    try {
        const key = `gemini:cooldown:${userId}`;
        const cooldown = await redisClient.get(key);

        if (cooldown) {
            const ttl = await redisClient.ttl(key);
            return { inCooldown: true, remainingSeconds: ttl };
        }

        return { inCooldown: false };
    } catch (error) {
        console.error("Cooldown check error:", error);
        return { inCooldown: false };
    }
};


const setCooldown = async (userId) => {
    try {
        const key = `gemini:cooldown:${userId}`;
        await redisClient.setEx(key, RATE_LIMIT_CONFIG.cooldownSeconds, "1");
    } catch (error) {
        console.error("Set cooldown error:", error);
    }
};


const checkAllRateLimits = async (userId) => {
    const cooldown = await isInCooldown(userId);
    if (cooldown.inCooldown) {
        return {
            allowed: false,
            reason: "cooldown",
            message: `⏳ Please wait ${cooldown.remainingSeconds}s before sending more messages.`,
            retryAfter: cooldown.remainingSeconds,
        };
    }

    const burstKey = `gemini:burst:${userId}`;
    const burstLimit = await checkRateLimit(
        burstKey,
        RATE_LIMIT_CONFIG.burstProtection.maxRequests,
        RATE_LIMIT_CONFIG.burstProtection.windowSeconds
    );

    if (!burstLimit.allowed) {
        await setCooldown(userId);
        return {
            allowed: false,
            reason: "burst",
            message: `⚡ Too many messages too fast! Please wait ${burstLimit.resetIn}s.`,
            retryAfter: burstLimit.resetIn,
        };
    }

    const userKey = `gemini:user:${userId}`;
    const userLimit = await checkRateLimit(
        userKey,
        RATE_LIMIT_CONFIG.userRequests.maxRequests,
        RATE_LIMIT_CONFIG.userRequests.windowSeconds
    );

    if (!userLimit.allowed) {
        await setCooldown(userId);
        return {
            allowed: false,
            reason: "user_limit",
            message: `🚫 Rate limit reached (${userLimit.limit}/min). Please wait ${userLimit.resetIn}s.`,
            retryAfter: userLimit.resetIn,
        };
    }

    const globalKey = "gemini:global";
    const globalLimit = await checkRateLimit(
        globalKey,
        RATE_LIMIT_CONFIG.globalRequests.maxRequests,
        RATE_LIMIT_CONFIG.globalRequests.windowSeconds
    );

    if (!globalLimit.allowed) {
        return {
            allowed: false,
            reason: "global_limit",
            message: "🔥 Server is busy. Please try again in a few seconds.",
            retryAfter: globalLimit.resetIn,
        };
    }

    return {
        allowed: true,
        remaining: {
            user: userLimit.remaining,
            global: globalLimit.remaining,
        },
    };
};


export const getRateLimitStats = async (userId = null) => {
    try {
        const stats = {
            global: {
                current: parseInt(await redisClient.get("gemini:global") || "0"),
                limit: RATE_LIMIT_CONFIG.globalRequests.maxRequests,
            },
        };

        if (userId) {
            stats.user = {
                current: parseInt(await redisClient.get(`gemini:user:${userId}`) || "0"),
                limit: RATE_LIMIT_CONFIG.userRequests.maxRequests,
                burst: parseInt(await redisClient.get(`gemini:burst:${userId}`) || "0"),
            };

            const cooldown = await isInCooldown(userId);
            stats.user.inCooldown = cooldown.inCooldown;
            stats.user.cooldownRemaining = cooldown.remainingSeconds || 0;
        }

        return stats;
    } catch (error) {
        console.error("Get rate limit stats error:", error);
        return null;
    }
};

const SYSTEM_PROMPT = `You are SmartKhata - India's smartest expense & khata tracker.

=== LANGUAGE ===
Users write in Hindi, English, Hinglish. Understand INTENT, handle typos, slang, voice-to-text.

=== CRITICAL: TYPE DETERMINES EVERYTHING ===

**type: "debit"** = Money went OUT from me
- I gave, sent, paid, lent money
- "X ko diye", "sent to X", "paid X", "X ko bheja"

**type: "credit"** = Money came IN to me  
- I received, got, borrowed money
- "X se liye", "X se mila", "received from X", "X ne diye"

=== PARTY TRANSACTIONS ===

When a PERSON is involved:
- partyName = person's name
- If type=debit → they owe me (I gave them money)
- If type=credit → I owe them (I got money from them)

=== CATEGORIES ===
DEBIT: Food & Dining, Travel & Transport, Shopping & Entertainment, Housing / Rent, Bills & Utilities, Personal & Transfers, Miscellaneous
CREDIT: Salary & Income, Refunds & Returns, Received from Others

=== OUTPUT ===
{"transactions": [{"amount": <number>, "description": "<2-4 words>", "category": "<cat>", "type": "debit"|"credit", "partyName": "<Name>"|null, "partyConfidence": 0-1, "isPending": true|false}]}

=== EXAMPLES ===

"Rahul ko 5000 diye" → I gave to Rahul
{"transactions": [{"amount": 5000, "description": "Sent to Rahul", "category": "Personal & Transfers", "type": "debit", "partyName": "Rahul", "partyConfidence": 1.0, "isPending": false}]}

"Priya se 1200 liye" → I took from Priya  
{"transactions": [{"amount": 1200, "description": "Received from Priya", "category": "Received from Others", "type": "credit", "partyName": "Priya", "partyConfidence": 1.0, "isPending": false}]}

"Amit 1381 dega" → Amit will give (future)
{"transactions": [{"amount": 1381, "description": "Pending from Amit", "category": "Personal & Transfers", "type": "debit", "partyName": "Amit", "partyConfidence": 1.0, "isPending": true}]}

"Neha ko 2000 dena hai" → I need to pay Neha (future)
{"transactions": [{"amount": 2000, "description": "Pending to Neha", "category": "Personal & Transfers", "type": "debit", "partyName": "Neha", "partyConfidence": 1.0, "isPending": true}]}

"Vikram se 500 milega" → I will receive from Vikram (future)
{"transactions": [{"amount": 500, "description": "Pending from Vikram", "category": "Personal & Transfers", "type": "debit", "partyName": "Vikram", "partyConfidence": 1.0, "isPending": true}]}

"chai 50 auto 80" → Regular expenses
{"transactions": [{"amount": 50, "description": "Tea", "category": "Food & Dining", "type": "debit", "partyName": null, "partyConfidence": 0, "isPending": false}, {"amount": 80, "description": "Auto", "category": "Travel & Transport", "type": "debit", "partyName": null, "partyConfidence": 0, "isPending": false}]}

"salary 50000" → Income
{"transactions": [{"amount": 50000, "description": "Salary", "category": "Salary & Income", "type": "credit", "partyName": null, "partyConfidence": 0, "isPending": false}]}

ONLY return valid JSON.`;




export const parseExpenses = async (messageText, userId = null) => {
    if (!messageText || typeof messageText !== "string" || messageText.trim().length === 0) {
        return { date: new Date().toISOString().split("T")[0], transactions: [] };
    }

    if (userId) {
        const dupCheck = await isDuplicateRequest(userId, messageText);
        if (dupCheck.isDuplicate && dupCheck.cachedResult) {
            console.log(`✅ Returning cached result for user ${userId}`);
            return dupCheck.cachedResult;
        }

        const rateLimitCheck = await checkAllRateLimits(userId);
        if (!rateLimitCheck.allowed) {
            console.log(`🚫 Rate limit hit for user ${userId}: ${rateLimitCheck.reason}`);
            return {
                date: new Date().toISOString().split("T")[0],
                transactions: [],
                rateLimited: true,
                rateLimitMessage: rateLimitCheck.message,
                retryAfter: rateLimitCheck.retryAfter,
            };
        }
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.SITE_URL || "https://smartkhata.me",
                "X-Title": "SmartKhata"
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: `${messageText}\n\nRemember: Return ONLY valid JSON with "transactions" array, nothing else.`
                    }
                ],
                temperature: 0.1,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenRouter API error:", response.status, errorData);
            return fallbackParser(messageText);
        }

        const data = await response.json();
        let text = data.choices?.[0]?.message?.content?.trim() || "";

        text = text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

        const parsed = JSON.parse(text);

        if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
            console.error("Invalid OpenRouter response structure:", text);
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
                    partyName: txn.partyName && typeof txn.partyName === "string" ? txn.partyName.trim() : null,
                    partyConfidence: typeof txn.partyConfidence === "number" ? txn.partyConfidence : 0,
                    isPending: txn.isPending === true,
                    khataType: txn.partyName ? (txn.type === 'debit' ? 'to_receive' : 'to_give') : null,
                };
            });

        const finalResult = {
            date: new Date().toISOString().split("T")[0],
            transactions: validTransactions,
        };

        if (userId) {
            await cacheRequestResult(userId, messageText, finalResult);
        }

        return finalResult;
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
            partyName: null,
            partyConfidence: 0,
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

    const expenses = [];
    const income = [];
    const receivables = [];
    const payables = [];

    for (const t of transactions) {
        const desc = t.description?.toLowerCase() || '';
        if (desc.includes('to receive')) {
            receivables.push(t);
        } else if (desc.includes('to pay')) {
            payables.push(t);
        } else if (t.type === 'credit') {
            income.push(t);
        } else {
            expenses.push(t);
        }
    }

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalReceivables = receivables.reduce((sum, t) => sum + t.amount, 0);
    const totalPayables = payables.reduce((sum, t) => sum + t.amount, 0);

    let message = `✅ <b>Transaction Recorded!</b>\n\n`;
    message += `📅 <b>Date:</b> ${new Date().toLocaleDateString("en-IN")} \n\n`;

    if (receivables.length > 0) {
        message += `� <b>RECEIVABLES:</b>\n`;
        receivables.forEach((txn, index) => {
            const partyName = txn.partyName || 'Someone';
            message += `${index + 1}. 🟢 +₹${txn.amount} - To receive from ${partyName}\n`;
            message += `   <i>${txn.category}</i>\n\n`;
        });
    }

    if (payables.length > 0) {
        message += `📤 <b>PAYABLES:</b>\n`;
        payables.forEach((txn, index) => {
            const partyName = txn.partyName || 'Someone';
            message += `${index + 1}. 🔴 -₹${txn.amount} - To pay ${partyName}\n`;
            message += `   <i>${txn.category}</i>\n\n`;
        });
    }

    if (income.length > 0) {
        message += `💰 <b>INCOME:</b>\n`;
        income.forEach((txn, index) => {
            const categoryEmoji = getCategoryEmoji(txn.category);
            message += `${index + 1}. ${categoryEmoji} +₹${txn.amount} - ${txn.description}\n`;
            message += `   <i>${txn.category}</i>\n\n`;
        });
    }

    if (expenses.length > 0) {
        message += `💸 <b>EXPENSES:</b>\n`;
        expenses.forEach((txn, index) => {
            const categoryEmoji = getCategoryEmoji(txn.category);
            message += `${index + 1}. ${categoryEmoji} -₹${txn.amount} - ${txn.description}\n`;
            message += `   <i>${txn.category}</i>\n\n`;
        });
    }

    message += `━━━━━━━━━━━━━━━━━\n`;
    if (receivables.length > 0) message += `� <b>Total Receivables:</b> +₹${totalReceivables}\n`;
    if (payables.length > 0) message += `📤 <b>Total Payables:</b> -₹${totalPayables}\n`;
    if (income.length > 0) message += `💚 <b>Total Income:</b> +₹${totalIncome}\n`;
    if (expenses.length > 0) message += `❤️ <b>Total Expenses:</b> -₹${totalExpenses}\n`;

    return message;
};

const getCategoryEmoji = (category) => {
    const emojis = {
        "Food & Dining": "🍽️",
        "Travel & Transport": "🚗",
        "Shopping & Entertainment": "🛍️",
        "Housing / Rent": "🏠",
        "Bills & Utilities": "📱",
        "Personal & Transfers": "🤝",
        "Miscellaneous": "📦",
        "Salary & Income": "💼",
        "Refunds & Returns": "↩️",
        "Received from Others": "🤝",
    };
    return emojis[category] || "📦";
};