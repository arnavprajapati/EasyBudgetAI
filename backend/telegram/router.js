import bot from "./bot.js";
import handleStart from "./handlers/start.js";
import handleHelp from "./handlers/help.js";
import handleStatus from "./handlers/status.js";
import handleOTP from "./handlers/otp.js";
import handleToday from "./handlers/today.js";
import handleSummary from "./handlers/summary.js";
import handleBalance from "./handlers/balance.js";
import handleParties from "./handlers/parties.js";
import handleExpenseMessage from "./handlers/expense.js";
import handleCallbackQuery from "./handlers/callback.js";

// Inline keyboard callback queries
bot.on("callback_query", handleCallbackQuery);

// Incoming message routing
bot.on("message", async (msg) => {
    const messageText = msg.text;
    console.log(`📩 Received message from @${msg.from?.username}: ${messageText}`);
    if (!messageText) return;

    if (messageText.startsWith("/start"))   return handleStart(msg);
    if (messageText.startsWith("/help"))    return handleHelp(msg);
    if (messageText.startsWith("/status"))  return handleStatus(msg);
    if (messageText.startsWith("/today"))   return handleToday(msg);
    if (messageText.startsWith("/summary")) return handleSummary(msg);
    if (messageText.startsWith("/balance")) return handleBalance(msg);
    if (messageText.startsWith("/parties")) return handleParties(msg);
    if (/^\d{6}$/.test(messageText))        return handleOTP(msg);

    return handleExpenseMessage(msg);
});

// Webhook error logging
bot.on("webhook_error", (error) => {
    console.error("Webhook error:", error);
});

