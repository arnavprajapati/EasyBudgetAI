import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PERSON_EXTRACTION_PROMPT = `You are a person name extractor for a lending/borrowing tracking app.

Your task: Extract the person's name from transaction descriptions.

Rules:
1. Look for names after keywords like: "ko diye", "ko diya", "se liye", "se liya", "to", "from", "given to", "received from", "sent to", "borrowed from", "lent to"
2. Common Indian names: Rahul, Amit, Priya, Neha, Rohan, Anjali, Vikram, Pooja, etc.
3. Can be: First name only, Full name, Nickname
4. Remove titles: "bhai", "didi", "uncle", "aunty" (but keep the name)
5. Capitalize properly
6. If multiple names, return the first one
7. If no clear name found, return null

Examples:
"1000 Rahul ko diye" → "Rahul"
"500 amit se liye" → "Amit"
"2000 given to Priya Singh" → "Priya Singh"
"300 friend ko bheja" → "Friend"
"1500 bhai ko diye" → "Bhai"
"5000 sent to office" → null (not a person)
"200 upi transfer" → null (no person mentioned)

CRITICAL OUTPUT FORMAT:
Return ONLY a JSON object with "personName" field:

{"personName": "Name Here"}

or

{"personName": null}

No explanation, no markdown, just JSON.`;

/**
 * Extract person name from transaction description using AI
 * @param {string} description - Transaction description
 * @returns {Promise<string|null>} - Person name or null
 */
export const extractPersonName = async (description) => {
    if (!description || typeof description !== "string") {
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.1, // Very low for consistent extraction
                topP: 0.8,
                maxOutputTokens: 100,
            }
        });

        const prompt = `${PERSON_EXTRACTION_PROMPT}

Description: "${description}"

Extract the person name and return JSON:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean JSON
        text = text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

        const parsed = JSON.parse(text);

        if (parsed.personName && typeof parsed.personName === "string") {
            return parsed.personName.trim();
        }

        return null;
    } catch (error) {
        console.error("AI person extraction error:", error.message);

        // Fallback to regex extraction
        return fallbackExtractPersonName(description);
    }
};

/**
 * Fallback regex-based person name extraction
 * @param {string} description - Transaction description
 * @returns {string|null} - Person name or null
 */
const fallbackExtractPersonName = (description) => {
    const lowerDesc = description.toLowerCase();

    // Keywords indicating lending/borrowing
    const lendKeywords = [
        "ko diye", "ko diya", "ko bheje", "ko bheja",
        "given to", "sent to", "lent to", "given", "sent"
    ];

    const borrowKeywords = [
        "se liye", "se liya", "se leke",
        "from", "received from", "borrowed from"
    ];

    // Check for lend keywords
    for (const keyword of lendKeywords) {
        if (lowerDesc.includes(keyword)) {
            // Extract name before keyword
            const parts = description.split(new RegExp(keyword, "i"));
            if (parts.length > 0) {
                const namePart = parts[0].trim();
                // Remove amount
                const name = namePart.replace(/\d+/g, "").replace(/rs|₹|rupees?/gi, "").trim();
                if (name.length > 0 && name.length < 30) {
                    return capitalizeWords(name);
                }
            }
        }
    }

    // Check for borrow keywords
    for (const keyword of borrowKeywords) {
        if (lowerDesc.includes(keyword)) {
            // Extract name after keyword
            const parts = description.split(new RegExp(keyword, "i"));
            if (parts.length > 1) {
                const namePart = parts[1].trim();
                // Remove amount and extra words
                const name = namePart.replace(/\d+/g, "").replace(/rs|₹|rupees?/gi, "").trim();
                const firstWord = name.split(/\s+/)[0];
                if (firstWord && firstWord.length < 20) {
                    return capitalizeWords(firstWord);
                }
            }
        }
    }

    // Look for common patterns like "to Name" or "from Name"
    const toMatch = description.match(/(?:to|sent to|given to)\s+([A-Za-z\s]+)/i);
    if (toMatch && toMatch[1]) {
        const name = toMatch[1].trim().split(/\s+/).slice(0, 2).join(" ");
        if (name.length > 0) {
            return capitalizeWords(name);
        }
    }

    const fromMatch = description.match(/(?:from|received from|borrowed from)\s+([A-Za-z\s]+)/i);
    if (fromMatch && fromMatch[1]) {
        const name = fromMatch[1].trim().split(/\s+/).slice(0, 2).join(" ");
        if (name.length > 0) {
            return capitalizeWords(name);
        }
    }

    return null;
};

/**
 * Capitalize each word in a string
 * @param {string} str - Input string
 * @returns {string} - Capitalized string
 */
const capitalizeWords = (str) => {
    return str
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

/**
 * Analyze if a transaction involves lending/borrowing
 * @param {Object} transaction - Transaction object
 * @returns {Object} - Analysis result
 */
export const analyzeLendingTransaction = async (transaction) => {
    const { description, amount, type, category } = transaction;

    // Only analyze "Personal & Transfers" category
    if (category !== "Personal & Transfers") {
        return { isLending: false, personName: null, lendingType: null };
    }

    // Extract person name
    const personName = await extractPersonName(description);

    if (!personName) {
        return { isLending: false, personName: null, lendingType: null };
    }

    // Determine lending type
    let lendingType = null;
    if (type === "debit") {
        // User gave money = lent
        lendingType = "lent";
    } else if (type === "credit") {
        // User received money = borrowed
        lendingType = "borrowed";
    }

    return {
        isLending: true,
        personName,
        lendingType,
        amount
    };
};

export default {
    extractPersonName,
    analyzeLendingTransaction,
};