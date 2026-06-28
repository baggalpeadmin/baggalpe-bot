/**
 * @file services/ai.js
 * @description Google Gemini AI engine for intent parsing and response generation.
 *              Falls back to keyword matching when GEMINI_API_KEY is not set.
 */

'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/** @type {import('@google/generative-ai').GenerativeModel|null} */
let model = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('[AI] Gemini model initialised (gemini-2.0-flash)');
} else {
  console.log('[AI] GEMINI_API_KEY not set — using keyword fallback');
}

/**
 * System prompt instructing Gemini how to parse shopping intents.
 */
const SYSTEM_PROMPT = `You are a shopping intent parser for "Baggalpe", a WhatsApp-based shopping concierge for Indian consumers.

Your job is to extract structured data from user messages. Users speak Hindi, English, or Hinglish (mixed).

Always respond with ONLY valid JSON matching this schema — no markdown, no extra text:
{
  "intent": "order_grocery|search_product|book_service|group_deal|track_order|greeting|help|unknown",
  "items": [{"name": "product_name", "quantity": "amount_with_unit"}],
  "service_type": "plumber|electrician|null",
  "language": "hi|en",
  "response_suggestion": "suggested response text in Hindi"
}

Rules:
- "order_grocery" — user wants to buy groceries/kirana items (chahiye, mangwao, bhej do, order karo)
- "search_product" — user is asking about price, availability, or searching for a product
- "book_service" — user needs a plumber, electrician, or similar service provider
- "group_deal" — user mentions group buying, wholesale, neighbour deal
- "track_order" — user asks about order status, delivery, BG- order number
- "greeting" — hello, hi, namaste, namaskar
- "help" — user asks what you can do, menu, help
- "unknown" — cannot determine intent
- Extract product names in their original language (e.g., "aata", "dal", "chawal")
- Extract quantities with units (e.g., "5kg", "2L", "1 packet")
- If user mentions plumber/electrician, set service_type accordingly
- Detect language: "hi" for Hindi/Hinglish, "en" for pure English
- response_suggestion should be a helpful Hindi response`;

/**
 * Process a user message through Gemini AI to extract structured intent.
 *
 * @param {string}   userMessage          — The raw message from the user
 * @param {string[]} [conversationHistory] — Previous messages for context
 * @param {object}   [userContext]         — Additional context (city, name, etc.)
 * @returns {Promise<object>} Parsed intent object
 */
async function processMessage(userMessage, conversationHistory = [], userContext = {}) {
  // If Gemini is not available, use keyword fallback
  if (!model) {
    return keywordFallback(userMessage);
  }

  try {
    const contextStr = Object.keys(userContext).length
      ? `\nUser context: ${JSON.stringify(userContext)}`
      : '';

    const historyStr = conversationHistory.length
      ? `\nRecent conversation:\n${conversationHistory.slice(-5).join('\n')}`
      : '';

    const prompt = `${SYSTEM_PROMPT}${contextStr}${historyStr}\n\nUser message: "${userMessage}"`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(cleaned);

    console.log('[AI] Gemini parsed intent:', parsed.intent);
    return parsed;
  } catch (err) {
    console.error('[AI] Gemini error, falling back to keywords:', err.message);
    return keywordFallback(userMessage);
  }
}

/**
 * Simple keyword-based intent detection when Gemini is unavailable.
 *
 * @param {string} message
 * @returns {object} Parsed intent object
 */
function keywordFallback(message) {
  const lower = message.toLowerCase().trim();

  /** @type {object} */
  const result = {
    intent: 'unknown',
    items: [],
    service_type: null,
    language: /[a-z]/.test(lower) ? 'en' : 'hi',
    response_suggestion: '',
  };

  // Greeting
  if (/\b(namaste|namaskar|hello|hi|hey|hola)\b/.test(lower)) {
    result.intent = 'greeting';
    result.response_suggestion = 'Namaste! 🙏 Baggalpe mein aapka swagat hai. Kya mangwana hai?';
    return result;
  }

  // Service booking
  if (/\b(plumber|plumbing|nal|naika|paani)\b/.test(lower)) {
    result.intent = 'book_service';
    result.service_type = 'plumber';
    result.response_suggestion = 'Plumber ki zaroorat hai? Hum abhi bhejte hain!';
    return result;
  }

  if (/\b(electrician|bijli|wiring|electric|switch|fan)\b/.test(lower)) {
    result.intent = 'book_service';
    result.service_type = 'electrician';
    result.response_suggestion = 'Electrician chahiye? Hum arrange karte hain!';
    return result;
  }

  // Order tracking
  if (/\b(track|status|kahan|order\s*number|bg-)/i.test(lower)) {
    result.intent = 'track_order';
    result.response_suggestion = 'Apna order number batayein, hum status check karte hain.';
    return result;
  }

  // Group deal
  if (/\b(group|wholesale|bulk|saste|neighbour|padosi)\b/.test(lower)) {
    result.intent = 'group_deal';
    result.response_suggestion = 'Group deal mein interest hai? Bahut badhiya!';
    return result;
  }

  // Help
  if (/\b(help|madad|menu|kya kar|kya karte)\b/.test(lower)) {
    result.intent = 'help';
    result.response_suggestion =
      'Main aapki shopping mein madad karta hoon! Grocery, sabzi, ya service — kuch bhi mangwayein.';
    return result;
  }

  // Order / grocery (broad match — keep last so specific intents win)
  if (
    /\b(chahiye|mangwao|mangwa|bhej|order|khareed|lana|dena|de do|bhejdo|manga)\b/.test(lower)
  ) {
    result.intent = 'order_grocery';
    result.response_suggestion = 'Bilkul! Kya kya chahiye? List bhej dijiye.';

    // Attempt to extract simple items like "5kg aata", "2L oil"
    const itemPattern = /(\d+\s*(?:kg|g|l|ml|packet|pcs?|piece)?)\s+(\w+)/gi;
    let match;
    while ((match = itemPattern.exec(lower)) !== null) {
      result.items.push({ name: match[2], quantity: match[1].trim() });
    }

    return result;
  }

  // Search
  if (/\b(price|rate|kitne|kimat|milega|available|hai kya)\b/.test(lower)) {
    result.intent = 'search_product';
    result.response_suggestion = 'Product dhundhte hain, ek second...';
    return result;
  }

  // Default
  result.response_suggestion = 'Mujhe samajh nahi aaya. Kya aap grocery, sabzi, ya koi service chahte hain?';
  return result;
}

module.exports = {
  processMessage,
  keywordFallback,
};
