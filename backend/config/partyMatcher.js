import { redisClient } from "./redis.js";
import { Expense } from "../models/Expense.js";

const levenshteinDistance = (str1, str2) => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    const track = Array(s2.length + 1).fill(null).map(() =>
        Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i++) track[0][i] = i;
    for (let j = 0; j <= s2.length; j++) track[j][0] = j;

    for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }

    return track[s2.length][s1.length];
};

const similarityScore = (str1, str2) => {
    if (!str1 || !str2) return 0;
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1;

    const levenScore = 1 - (levenshteinDistance(s1, s2) / maxLen);

    const phoneticScore = getPhoneticScore(s1, s2);

    const firstName1 = s1.split(' ')[0];
    const firstName2 = s2.split(' ')[0];
    const firstNameBonus = firstName1 === firstName2 ? 0.15 : 0;

    const containsBonus = (s1.includes(firstName2) || s2.includes(firstName1)) ? 0.1 : 0;

    return Math.min(1, levenScore + phoneticScore + firstNameBonus + containsBonus);
};

const getPhoneticScore = (s1, s2) => {
    const normalize = (s) => s
        .replace(/sh/g, 's')
        .replace(/ee/g, 'i')
        .replace(/ai/g, 'e')
        .replace(/aa/g, 'a')
        .replace(/oo/g, 'u')
        .replace(/th/g, 't')
        .replace(/dh/g, 'd')
        .replace(/bh/g, 'b')
        .replace(/ph/g, 'f')
        .replace(/kh/g, 'k')
        .replace(/gh/g, 'g')
        .replace(/ch/g, 'c')
        .replace(/jh/g, 'j');

    const n1 = normalize(s1);
    const n2 = normalize(s2);

    if (n1 === n2) return 0.2;

    const normalizedSimilarity = 1 - (levenshteinDistance(n1, n2) / Math.max(n1.length, n2.length));
    if (normalizedSimilarity > 0.9) return 0.15;
    if (normalizedSimilarity > 0.8) return 0.1;

    return 0;
};


export const getExistingParties = async (userId, limit = 20) => {
    try {
        const transactionsWithParty = await Expense.find({
            userId,
            partyName: { $ne: null, $exists: true }
        })
            .sort({ date: -1 })
            .limit(200)
            .lean();

        const partyMap = new Map();

        for (const txn of transactionsWithParty) {
            const partyName = txn.partyName;
            if (!partyName || partyName.length < 2) continue;

            const key = partyName.toLowerCase();
            const existing = partyMap.get(key);

            if (existing) {
                existing.count++;
                existing.lastActivity = Math.max(existing.lastActivity, new Date(txn.date).getTime());
                if (txn.isPending && txn.description?.toLowerCase().includes('to receive')) {
                    existing.toReceive += txn.amount;
                } else if (txn.isPending && txn.description?.toLowerCase().includes('to pay')) {
                    existing.toGive += txn.amount;
                } else if (txn.type === 'credit') {
                    existing.received += txn.amount;
                } else {
                    existing.given += txn.amount;
                }
            } else {
                const isToReceive = txn.isPending && txn.description?.toLowerCase().includes('to receive');
                const isToPay = txn.isPending && txn.description?.toLowerCase().includes('to pay');

                partyMap.set(key, {
                    name: partyName,
                    count: 1,
                    lastActivity: new Date(txn.date).getTime(),
                    toReceive: isToReceive ? txn.amount : 0,
                    toGive: isToPay ? txn.amount : 0,
                    received: (!txn.isPending && txn.type === 'credit') ? txn.amount : 0,
                    given: (!txn.isPending && txn.type === 'debit' && !isToPay) ? txn.amount : 0,
                });
            }
        }

        const parties = Array.from(partyMap.values())
            .map(party => ({
                ...party,
                balance: party.given + party.toReceive - party.received - party.toGive
            }))
            .sort((a, b) => {
                const scoreA = a.count * 0.3 + (a.lastActivity / Date.now()) * 0.7;
                const scoreB = b.count * 0.3 + (b.lastActivity / Date.now()) * 0.7;
                return scoreB - scoreA;
            })
            .slice(0, limit);

        return parties;
    } catch (error) {
        console.error("Error getting existing parties:", error);
        return [];
    }
};

export const findSimilarParties = async (userId, inputName, threshold = 0.5) => {
    const existingParties = await getExistingParties(userId, 100);

    const similarParties = existingParties
        .map(party => ({
            ...party,
            similarity: similarityScore(inputName, party.name)
        }))
        .filter(party => party.similarity >= threshold && party.similarity < 1.0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 8);

    return similarParties;
};


export const findExactMatches = async (userId, inputName) => {
    const existingParties = await getExistingParties(userId, 50);

    return existingParties.filter(party =>
        party.name.toLowerCase() === inputName.toLowerCase() ||
        similarityScore(inputName, party.name) >= 0.95
    );
};


export const storePendingTransaction = async (telegramUserId, pendingData) => {
    const key = `pending_txn:${telegramUserId}`;
    const data = {
        ...pendingData,
        createdAt: Date.now()
    };

    try {
        await redisClient.setEx(key, 300, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Error storing pending transaction:", error);
        return false;
    }
};


export const getPendingTransaction = async (telegramUserId) => {
    const key = `pending_txn:${telegramUserId}`;

    try {
        const data = await redisClient.get(key);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error("Error getting pending transaction:", error);
        return null;
    }
};


export const clearPendingTransaction = async (telegramUserId) => {
    const key = `pending_txn:${telegramUserId}`;

    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.error("Error clearing pending transaction:", error);
        return false;
    }
};


export const buildPartySelectionKeyboard = (options) => {
    const {
        similarParties = [],
        recentParties = [],
        originalPartyName = null,
        transactionIndex = 0,
        showCreateNew = true,
        showSkip = true
    } = options;

    const keyboard = [];

    if (similarParties.length > 0) {
        for (const party of similarParties.slice(0, 5)) {
            const label = `✅ ${party.name} (${Math.round(party.similarity * 100)}% match)`;
            keyboard.push([{
                text: label,
                callback_data: `party_select:${transactionIndex}:${party.name}`
            }]);
        }
    }

    if (recentParties.length > 0 && similarParties.length === 0) {
        for (const party of recentParties.slice(0, 4)) {
            const lastDate = new Date(party.lastActivity).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            const label = `👤 ${party.name} (₹${party.balance} • ${lastDate})`;
            keyboard.push([{
                text: label,
                callback_data: `party_select:${transactionIndex}:${party.name}`
            }]);
        }
    }

    const actionRow = [];

    if (showCreateNew && originalPartyName) {
        actionRow.push({
            text: `➕ Use "${originalPartyName}"`,
            callback_data: `party_new:${transactionIndex}:${originalPartyName}`
        });
    } else if (showCreateNew) {
        actionRow.push({
            text: `➕ Enter New Party`,
            callback_data: `party_prompt:${transactionIndex}`
        });
    }

    if (showSkip) {
        actionRow.push({
            text: `⏭️ Skip Party`,
            callback_data: `party_skip:${transactionIndex}`
        });
    }

    if (actionRow.length > 0) {
        keyboard.push(actionRow);
    }

    keyboard.push([{
        text: `📋 View All Parties`,
        callback_data: `party_viewall:${transactionIndex}`
    }]);

    keyboard.push([{
        text: `❌ Cancel Transaction`,
        callback_data: `party_cancel:${transactionIndex}`
    }]);

    return {
        inline_keyboard: keyboard
    };
};

export const needsPartyClarification = async (userId, transaction) => {
    const { partyName, partyConfidence, category } = transaction;

    const partyCategories = ["Personal & Transfers", "Received from Others"];

    if (!partyCategories.includes(category)) {
        return { needsClarification: false, reason: null };
    }

    if (!partyName || partyConfidence < 0.3) {
        const recentParties = await getExistingParties(userId, 6);
        if (recentParties.length > 0) {
            return {
                needsClarification: true,
                reason: "missing_party",
                recentParties
            };
        }
        return { needsClarification: false, reason: null };
    }

    const existingParties = await getExistingParties(userId, 50);

    if (existingParties.length === 0) {
        return { needsClarification: false, reason: null };
    }

    const inputNameLower = partyName.toLowerCase().trim();
    const inputFirstName = inputNameLower.split(' ')[0];

    const matchingParties = existingParties.filter(party => {
        const existingNameLower = party.name.toLowerCase().trim();
        const existingFirstName = existingNameLower.split(' ')[0];

        if (existingNameLower === inputNameLower) return true;

        if (existingFirstName === inputFirstName) return true;

        if (existingNameLower.includes(inputFirstName) || inputNameLower.includes(existingFirstName)) return true;

        const similarity = similarityScore(partyName, party.name);
        if (similarity >= 0.5) return true;

        return false;
    });

    if (matchingParties.length > 0) {
        const sortedMatches = matchingParties.map(p => ({
            ...p,
            similarity: p.name.toLowerCase().trim() === inputNameLower ? 1.0 : similarityScore(partyName, p.name)
        })).sort((a, b) => b.similarity - a.similarity);

        return {
            needsClarification: true,
            reason: sortedMatches[0].similarity === 1.0 ? "exact_match_confirm" : "similar_name_exists",
            similarParties: sortedMatches,
            originalPartyName: partyName
        };
    }

    return { needsClarification: false, reason: null };
};


export const formatClarificationMessage = (transaction, clarificationInfo) => {
    const { amount, type, description } = transaction;
    const { reason, similarParties, recentParties, originalPartyName } = clarificationInfo;

    const typeEmoji = type === "credit" ? "💰" : "💸";

    let message = `${typeEmoji} <b>Confirm Party</b>\n\n`;
    message += `💵 Amount: ₹${amount}\n`;
    message += `📝 ${description}\n\n`;

    switch (reason) {
        case "missing_party":
            message += `❓ <b>Who is this transaction with?</b>\n\n`;
            message += `Select from contacts or add new:`;
            break;

        case "exact_match_confirm":
            message += `👤 <b>"${originalPartyName}" already exists!</b>\n\n`;
            message += `• Same person? → Select existing\n`;
            message += `• Different person? → Add unique identifier\n`;
            message += `  <i>(e.g., "${originalPartyName} Office", "${originalPartyName} K23SG")</i>`;
            break;

        case "similar_name_exists":
            message += `🤔 <b>Similar name found!</b>\n\n`;
            message += `You typed: "<b>${originalPartyName}</b>"\n\n`;
            message += `• Same person? → Select existing\n`;
            message += `• New person? → Create with your name\n`;
            message += `  <i>(Add identifier like College, Office, etc.)</i>`;
            break;

        case "same_first_name":
        case "similar_party":
        case "possible_misspelling":
            message += `🤔 <b>Similar name found!</b>\n\n`;
            message += `You typed: "<b>${originalPartyName}</b>"\n\n`;
            message += `Select existing or create new:`;
            break;

        case "multiple_matches":
            message += `👥 <b>Multiple matches found</b>\n\n`;
            message += `Select the correct one:`;
            break;

        default:
            message += `Select party for this transaction:`;
    }

    return message;
};
