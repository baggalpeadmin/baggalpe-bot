/* ============================================
   BAGGALPE — Conversation Router (The Brain)
   Routes incoming WhatsApp messages through
   intent detection → flow state machine → response
   ============================================ */

'use strict';

// ── Dependencies ────────────────────────────────────────────
// NOTE: These service/db modules are expected to exist.
// If they don't exist yet, the bot will log errors gracefully.

let ai, catalog, order, whatsapp, schema;

try { ai = require('../services/ai'); } catch (e) {
  console.warn('[Router] services/ai not found — AI intent detection disabled');
  ai = null;
}
try { catalog = require('../services/catalog'); } catch (e) {
  console.warn('[Router] services/catalog not found — catalog search disabled');
  catalog = null;
}
try { order = require('../services/order'); } catch (e) {
  console.warn('[Router] services/order not found — order creation disabled');
  order = null;
}
try { whatsapp = require('../services/whatsapp'); } catch (e) {
  console.warn('[Router] services/whatsapp not found — message sending disabled');
  whatsapp = null;
}
try { schema = require('../db/schema'); } catch (e) {
  console.warn('[Router] db/schema not found — conversation persistence disabled');
  schema = null;
}

const { getFlow, getState, getNextStep, isFlowComplete } = require('./flows');
const templates = require('./templates');

// ── Constants ───────────────────────────────────────────────

/** Keywords that map to specific intents (fallback when AI is unavailable) */
const INTENT_KEYWORDS = {
  greeting: [
    'hi', 'hello', 'namaste', 'namaskar', 'hey', 'hola',
    'start', 'shuru', 'help me'
  ],
  order_grocery: [
    'grocery', 'kirana', 'saman', 'samaan', 'aata', 'daal',
    'dal', 'chawal', 'rice', 'tel', 'oil', 'sugar', 'cheeni',
    'sabzi', 'sabji', 'vegetables', 'tamatar', 'pyaaz', 'aloo',
    'mirch', 'fruits', 'fruit', 'grocery chahiye', 'saman chahiye',
    'order karo', 'mangwao', 'mangwa do', 'bhej do', 'chahiye'
  ],
  book_service: [
    'plumber', 'electrician', 'carpenter', 'ac repair', 'ac service',
    'cleaning', 'safai', 'repair', 'service', 'service chahiye',
    'mistri', 'karigar', 'mechanic'
  ],
  track_order: [
    'track', 'tracking', 'order status', 'kahan hai', 'kahan pahuncha',
    'status', 'delivery status', 'track karo', 'order track'
  ],
  help: [
    'help', 'madad', 'kya kar sakte ho', 'kya kya', 'features',
    'options', 'menu'
  ],
  goodbye: [
    'bye', 'goodbye', 'alvida', 'tata', 'dhanyavaad', 'thanks',
    'thank you', 'shukriya', 'ok bye', 'theek hai'
  ]
};

/** Affirmative keywords for yes/confirm parsing */
const YES_KEYWORDS = [
  'haan', 'haa', 'ha', 'yes', 'yep', 'yeah', 'ok', 'okay',
  'theek', 'theek hai', 'sahi hai', 'kar do', 'bhej do',
  'sab bhej do', 'sab chahiye', 'confirm', 'done', 'ho gaya'
];

/** Negative keywords for no/cancel parsing */
const NO_KEYWORDS = [
  'nahi', 'naa', 'no', 'nope', 'cancel', 'rehne do',
  'mat karo', 'band karo', 'stop', 'ruk'
];

/** Pay keywords */
const PAY_KEYWORDS = [
  'pay', 'payment', 'upi', 'bhugtan', 'paisa', 'pay karo',
  'pay kar do', 'haan pay', 'yes pay', 'baggalpe pay'
];

// ── Keyword-Based Intent Detection (Fallback) ───────────────

/**
 * Detects intent from message text using keyword matching.
 * Returns { intent, entities } where entities may include extracted items.
 *
 * @param {string} text - User's message text
 * @returns {{ intent: string, entities: Object }}
 */
function detectIntentByKeywords(text) {
  const lower = text.toLowerCase().trim();

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return {
          intent,
          entities: { rawText: text }
        };
      }
    }
  }

  return { intent: 'unknown', entities: { rawText: text } };
}

// ── Response Helpers ────────────────────────────────────────

/**
 * Sends a text message to the user via WhatsApp.
 * Falls back to console.log if whatsapp service is unavailable.
 *
 * @param {string} to - Recipient phone number
 * @param {string} text - Message text
 */
async function sendMessage(to, text) {
  console.log(`[Router] Sending to ${to}: ${text.substring(0, 80)}...`);

  if (whatsapp && typeof whatsapp.sendText === 'function') {
    try {
      await whatsapp.sendText(to, text);
    } catch (err) {
      console.error('[Router] Failed to send WhatsApp message:', err.message);
    }
  } else {
    console.log('[Router] (WhatsApp service unavailable — message logged only)');
  }
}

/**
 * Marks a message as read via WhatsApp API.
 *
 * @param {string} messageId - WhatsApp message ID
 */
async function markAsRead(messageId) {
  if (whatsapp && typeof whatsapp.markAsRead === 'function') {
    try {
      await whatsapp.markAsRead(messageId);
    } catch (err) {
      console.error('[Router] Failed to mark as read:', err.message);
    }
  }
}

// ── Conversation State Persistence ──────────────────────────

/**
 * Gets the current conversation state for a user.
 * Returns { flow, step, context } or null if no active conversation.
 *
 * @param {string} from - User's phone number
 * @returns {Object|null}
 */
function getConversation(from) {
  if (schema && typeof schema.getConversation === 'function') {
    const row = schema.getConversation(from);
    if (!row) return null;
    // Normalize DB column names to router-friendly properties
    return {
      flow: row.current_flow || row.flow || null,
      step: row.current_step !== undefined ? row.current_step : (row.step !== undefined ? row.step : 0),
      context: row.context || {}
    };
  }
  console.log('[Router] (DB unavailable — no conversation state)');
  return null;
}

/**
 * Saves / updates conversation state in DB.
 *
 * @param {string} from - User's phone number
 * @param {string} flow - Flow name (e.g., 'grocery')
 * @param {number} step - Current step number
 * @param {Object} context - Conversation context data
 */
function saveConversation(from, flow, step, context) {
  if (schema && typeof schema.upsertConversation === 'function') {
    schema.upsertConversation(from, flow, step, typeof context === 'string' ? context : JSON.stringify(context));
    console.log(`[Router] Saved state: flow=${flow}, step=${step}`);
  } else {
    console.log(`[Router] (DB unavailable — state not persisted) flow=${flow}, step=${step}`);
  }
}

/**
 * Clears / completes the conversation state for a user.
 *
 * @param {string} from - User's phone number
 */
function clearConversation(from) {
  if (schema && typeof schema.clearConversation === 'function') {
    schema.clearConversation(from);
    console.log('[Router] Conversation cleared');
  }
}

// ── User Input Parsers ──────────────────────────────────────

/**
 * Parses a number selection from user text (e.g., "1", "2", "pehla").
 *
 * @param {string} text - User's message
 * @param {number} maxOptions - Maximum valid option number
 * @returns {number|null} Selected index (0-based) or null
 */
function parseNumberSelection(text, maxOptions) {
  const lower = text.toLowerCase().trim();

  // Direct number: "1", "2", "3"
  const num = parseInt(lower, 10);
  if (!isNaN(num) && num >= 1 && num <= maxOptions) {
    return num - 1; // Convert to 0-based index
  }

  // Hindi ordinals
  const ordinals = {
    'pehla': 0, 'pahla': 0, 'first': 0, 'ek': 0,
    'doosra': 1, 'dusra': 1, 'second': 1, 'do': 1,
    'teesra': 2, 'tisra': 2, 'third': 2, 'teen': 2,
    'chautha': 3, 'fourth': 3, 'char': 3
  };

  for (const [word, idx] of Object.entries(ordinals)) {
    if (lower.includes(word) && idx < maxOptions) {
      return idx;
    }
  }

  return null;
}

/**
 * Checks if user text is an affirmative response.
 *
 * @param {string} text
 * @returns {boolean}
 */
function isAffirmative(text) {
  const lower = text.toLowerCase().trim();
  return YES_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Checks if user text is a negative/cancel response.
 *
 * @param {string} text
 * @returns {boolean}
 */
function isNegative(text) {
  const lower = text.toLowerCase().trim();
  return NO_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Checks if user text is a pay intent.
 *
 * @param {string} text
 * @returns {boolean}
 */
function isPayIntent(text) {
  const lower = text.toLowerCase().trim();
  return PAY_KEYWORDS.some(kw => lower.includes(kw)) || isAffirmative(text);
}

/**
 * Extracts a service type keyword from user text.
 *
 * @param {string} text
 * @returns {string|null}
 */
function parseServiceType(text) {
  const lower = text.toLowerCase().trim();
  const services = [
    'plumber', 'electrician', 'carpenter',
    'ac repair', 'ac service', 'cleaning', 'safai'
  ];

  for (const svc of services) {
    if (lower.includes(svc)) return svc;
  }

  // Normalize Hindi terms
  if (lower.includes('bijli') || lower.includes('electric')) return 'electrician';
  if (lower.includes('nalkaa') || lower.includes('paani') || lower.includes('pipe')) return 'plumber';

  return null;
}

/**
 * Tries to match user text against a list of named items (merchants, providers).
 *
 * @param {string} text - User's message
 * @param {Array<{name: string}>} items - List of items with names
 * @returns {number|null} Index of matched item (0-based) or null
 */
function parseNameSelection(text, items) {
  const lower = text.toLowerCase().trim();

  for (let i = 0; i < items.length; i++) {
    const name = items[i].name.toLowerCase();
    if (lower.includes(name) || name.includes(lower)) {
      return i;
    }
  }

  return null;
}

// ── AI Intent Detection ─────────────────────────────────────

/**
 * Detects user intent using AI service (Gemini).
 * Falls back to keyword matching if AI is unavailable.
 *
 * @param {string} text - User's message
 * @returns {Promise<{ intent: string, entities: Object }>}
 */
async function detectIntent(text) {
  // Try AI first
  if (ai && typeof ai.processMessage === 'function') {
    try {
      console.log('[Router] Detecting intent via AI...');
      const result = await ai.processMessage(text, [], {});
      console.log(`[Router] AI intent: ${result.intent}`);
      return {
        intent: result.intent || 'unknown',
        entities: {
          rawText: text,
          items: result.items || [],
          service_type: result.service_type || null,
          language: result.language || 'hi'
        }
      };
    } catch (err) {
      console.error('[Router] AI intent detection failed, using keywords:', err.message);
    }
  } else if (ai && typeof ai.keywordFallback === 'function') {
    try {
      console.log('[Router] Using AI keyword fallback...');
      const result = ai.keywordFallback(text);
      console.log(`[Router] Keyword fallback intent: ${result.intent}`);
      return {
        intent: result.intent || 'unknown',
        entities: {
          rawText: text,
          items: result.items || [],
          service_type: result.service_type || null,
          language: result.language || 'hi'
        }
      };
    } catch (err) {
      console.error('[Router] AI keyword fallback failed:', err.message);
    }
  }

  // Final fallback to local keyword matching
  console.log('[Router] Using local keyword-based intent detection');
  return detectIntentByKeywords(text);
}

// ── Flow Action Handlers ────────────────────────────────────

/**
 * Executes the 'searchCatalog' action:
 * Finds nearby merchants and searches products.
 *
 * @param {string} from - User's phone number
 * @param {Object} context - Conversation context
 * @returns {Promise<Object>} Updated context with merchants and products
 */
async function actionSearchCatalog(from, context) {
  console.log('[Router] Action: searchCatalog');

  let merchants = [];
  let products = [];

  if (catalog) {
    // Map generic categories to merchant types
    const categoryMap = {
      'grocery': 'kirana', 'kirana': 'kirana', 'sabzi': 'sabzi',
      'vegetables': 'sabzi', 'pharmacy': 'pharmacy', 'medical': 'pharmacy'
    };
    const merchantType = categoryMap[context.category] || null; // null = all types

    // Find nearby merchants
    if (typeof catalog.findNearbyMerchants === 'function') {
      merchants = catalog.findNearbyMerchants(
        context.userCity || 'Jaipur',
        merchantType
      );
    }

    // Search for specific products if items were provided and we have a merchant
    if (typeof catalog.searchProducts === 'function' && context.items && context.items.length > 0 && merchants.length > 0) {
      const firstItem = context.items[0];
      products = catalog.searchProducts(merchants[0].id, firstItem.name || firstItem);
    }
  }

  // If no catalog service, use demo data as placeholder
  if (merchants.length === 0) {
    merchants = [
      { id: 1, name: 'Ramu Kirana Store', distance: '500m', rating: 4.5, speciality: 'Grocery & Daily Needs' },
      { id: 2, name: 'Shyam General Store', distance: '800m', rating: 4.2, speciality: 'Grocery & Household' }
    ];
    console.log('[Router] Using demo merchant data');
  }

  return {
    ...context,
    merchants,
    products
  };
}

/**
 * Executes the 'processPayment' action:
 * Creates the order and processes payment.
 *
 * @param {string} from - User's phone number
 * @param {Object} context - Conversation context
 * @returns {Promise<Object>} Updated context with order details
 */
async function actionProcessPayment(from, context) {
  console.log('[Router] Action: processPayment');

  let orderResult = null;

  if (order && typeof order.createOrder === 'function') {
    const items = (context.selectedProducts || []).map(p => ({
      productId: p.id || 0,
      name: p.name || 'Item',
      quantity: p.quantity || 1,
      price: p.price || 0
    }));
    orderResult = order.createOrder(
      from,
      context.selectedMerchant?.id || 1,
      items
    );
  }

  // Generate order number if order service isn't available
  if (!orderResult) {
    orderResult = {
      orderNumber: `BG-${Math.floor(10000 + Math.random() * 89999)}`,
      total: context.total || 0,
      merchantPayout: Math.round((context.total || 0) * 0.95),
      deliveryTime: '45 minutes'
    };
    console.log('[Router] Using generated order number:', orderResult.orderNumber);
  }

  return {
    ...context,
    orderNumber: orderResult.orderNumber,
    merchantPayout: orderResult.merchantPayout || Math.round((context.total || 0) * 0.95),
    deliveryTime: orderResult.deliveryTime || '45 minutes'
  };
}

/**
 * Executes the 'searchProviders' action:
 * Finds nearby service providers.
 *
 * @param {string} from - User's phone number
 * @param {Object} context - Conversation context
 * @returns {Promise<Object>} Updated context with providers
 */
async function actionSearchProviders(from, context) {
  console.log('[Router] Action: searchProviders');

  let providers = [];

  if (catalog && typeof catalog.findNearbyMerchants === 'function') {
    providers = await catalog.findNearbyMerchants(
      context.userCity || 'Jaipur',
      context.serviceType || 'plumber'
    );
  }

  // Demo data fallback
  if (providers.length === 0) {
    providers = [
      { id: 1, name: 'Rajesh Kumar', rating: 4.8, jobs: 120, distance: '1.2km', charge: 150, available: '30 min' },
      { id: 2, name: 'Amit Singh', rating: 4.3, jobs: 85, distance: '2.5km', charge: 100, available: '1 hour' }
    ];
    console.log('[Router] Using demo provider data');
  }

  return {
    ...context,
    providers
  };
}

// ── Main Message Handler ────────────────────────────────────

/**
 * Main entry point — handles an incoming WhatsApp message.
 * Routes it through intent detection or continues an active flow.
 *
 * @param {string} from - Sender's phone number (e.g., "919876543210")
 * @param {string} messageText - The message body text
 * @param {string} messageId - WhatsApp message ID (for read receipts)
 * @returns {Promise<void>}
 */
async function handleMessage(from, messageText, messageId) {
  console.log(`\n[Router] ════════════════════════════════════════`);
  console.log(`[Router] Message from: ${from}`);
  console.log(`[Router] Text: "${messageText}"`);
  console.log(`[Router] MessageID: ${messageId}`);
  console.log(`[Router] ════════════════════════════════════════\n`);

  try {
    // Step 1: Mark message as read
    await markAsRead(messageId);

    // Step 2: Get current conversation state
    const conversation = getConversation(from);
    console.log('[Router] Current conversation:', conversation ? `flow=${conversation.flow}, step=${conversation.step}` : 'none');

    // Step 3: Route based on conversation state
    if (!conversation || conversation.flow === null || conversation.flow === 'complete') {
      // ── No active conversation → Detect intent ──
      await handleNewConversation(from, messageText);
    } else {
      // ── Active conversation → Continue flow ──
      await handleActiveConversation(from, messageText, conversation);
    }

  } catch (err) {
    console.error('[Router] ❌ Error handling message:', err);
    await sendMessage(from, templates.error());
  }
}

// ── New Conversation Handler ────────────────────────────────

/**
 * Handles a message when there is no active conversation flow.
 * Detects intent and starts the appropriate flow.
 *
 * @param {string} from - User's phone number
 * @param {string} messageText - The message text
 */
async function handleNewConversation(from, messageText) {
  console.log('[Router] Handling new conversation — detecting intent...');

  const { intent, entities } = await detectIntent(messageText);
  console.log(`[Router] Detected intent: "${intent}"`, entities);

  switch (intent) {

    case 'greeting': {
      // Send welcome + ask what they need
      const userName = entities?.name || null;
      if (userName) {
        await sendMessage(from, templates.welcome(userName));
      } else {
        await sendMessage(from, templates.welcomeNew());
      }
      await sendMessage(from, templates.askWhatYouNeed());
      break;
    }

    case 'order_grocery':
    case 'search_product': {
      // Start GROCERY flow
      console.log('[Router] Starting GROCERY flow');
      const context = {
        items: entities?.items || entities?.rawText || messageText,
        category: 'grocery'
      };

      // Skip ASK_ITEMS since user already told us what they want
      // Jump to SEARCH_CATALOG (step 1)
      await sendMessage(from, templates.searching('best stores'));

      // Execute search
      const updatedContext = await actionSearchCatalog(from, context);

      // Show merchants (step 2)
      await sendMessage(from, templates.showMerchants(updatedContext.merchants));

      // Save at step 2 waiting for merchant selection
      saveConversation(from, 'grocery', 2, updatedContext);
      break;
    }

    case 'book_service': {
      // Start SERVICE flow
      console.log('[Router] Starting SERVICE flow');

      const serviceType = parseServiceType(messageText);

      if (serviceType) {
        // User already specified a service type → skip ASK_SERVICE_TYPE
        const context = { serviceType };
        await sendMessage(from, templates.searching(serviceType + 's'));

        // Execute provider search
        const updatedContext = await actionSearchProviders(from, context);

        // Show providers (step 2)
        await sendMessage(from, templates.showProviders(updatedContext.providers));

        // Save at step 2 waiting for provider selection
        saveConversation(from, 'service', 2, updatedContext);

      } else {
        // Ask what type of service
        await sendMessage(from, templates.askServiceType());
        saveConversation(from, 'service', 0, {});
      }
      break;
    }

    case 'track_order': {
      // Look up order and send tracking info
      console.log('[Router] Handling order tracking');

      let orderInfo = null;
      if (order && typeof order.getLatestOrder === 'function') {
        orderInfo = await order.getLatestOrder(from);
      }

      if (orderInfo) {
        await sendMessage(from, templates.orderTracking(orderInfo.orderNumber, orderInfo.status));
      } else {
        await sendMessage(from, `Aapka koi active order nahi mila 📦\n\nNaya order place karna hai? Bas batao kya chahiye! 🛒`);
      }
      break;
    }

    case 'help': {
      await sendMessage(from, templates.help());
      break;
    }

    case 'goodbye': {
      await sendMessage(from, templates.goodbye());
      break;
    }

    default: {
      // Unknown intent
      console.log('[Router] Unknown intent — sending not understood');
      await sendMessage(from, templates.notUnderstood());
      break;
    }
  }
}

// ── Active Conversation Handler ─────────────────────────────

/**
 * Handles a message when the user is mid-flow in an active conversation.
 * Parses the response based on what the current state expects.
 *
 * @param {string} from - User's phone number
 * @param {string} messageText - The message text
 * @param {Object} conversation - Current conversation state { flow, step, context }
 */
async function handleActiveConversation(from, messageText, conversation) {
  const { flow: flowName, step: currentStep } = conversation;
  let context = {};

  // Parse context from stored JSON
  try {
    context = typeof conversation.context === 'string'
      ? JSON.parse(conversation.context)
      : (conversation.context || {});
  } catch (e) {
    console.error('[Router] Failed to parse context:', e.message);
    context = {};
  }

  // Allow user to cancel at any time
  if (isNegative(messageText)) {
    console.log('[Router] User cancelled flow');
    clearConversation(from);
    await sendMessage(from, `❌ Cancel kar diya!\n\nKuch aur chahiye toh batao 😊`);
    return;
  }

  // Get current state
  const currentState = getState(flowName, currentStep);
  if (!currentState) {
    console.error(`[Router] Invalid state: flow=${flowName}, step=${currentStep}`);
    clearConversation(from);
    await sendMessage(from, templates.notUnderstood());
    return;
  }

  console.log(`[Router] Active flow: ${flowName}, step: ${currentStep}, expects: ${currentState.expects || 'none'}`);

  // ── Route based on what the current state expects ──

  switch (currentState.expects) {

    // ── User providing a list of items they need ──
    case 'items_list': {
      console.log('[Router] Parsing items list');
      context.items = messageText;

      // Move to search
      await sendMessage(from, templates.searching('best stores'));
      const updatedContext = await actionSearchCatalog(from, context);

      // Show merchants
      await sendMessage(from, templates.showMerchants(updatedContext.merchants));
      saveConversation(from, flowName, 2, updatedContext);
      break;
    }

    // ── User selecting a merchant from the list ──
    case 'merchant_selection': {
      const merchants = context.merchants || [];
      let selectedIdx = parseNumberSelection(messageText, merchants.length);

      // Try name matching if number didn't work
      if (selectedIdx === null) {
        selectedIdx = parseNameSelection(messageText, merchants);
      }

      if (selectedIdx === null) {
        await sendMessage(from, `Kaunsa store? Number bhejo (1, 2, 3...) ya store ka naam likhein 🏪`);
        return; // Stay at same step
      }

      const selected = merchants[selectedIdx];
      context.selectedMerchant = selected;
      console.log(`[Router] Selected merchant: ${selected.name}`);

      await sendMessage(from, templates.merchantSelected(selected.name));

      // Search products for this merchant
      let products = [];
      if (catalog && typeof catalog.searchProducts === 'function') {
        products = await catalog.searchProducts(context.items, selected.id);
      }

      // Demo product data fallback
      if (products.length === 0) {
        products = [
          { name: 'Ashirvaad Aata 5kg', price: 275, emoji: '📦', unit: '' },
          { name: 'Tamatar', price: 40, emoji: '🍅', unit: 'kg' },
          { name: 'Pyaaz', price: 30, emoji: '🧅', unit: 'kg' },
          { name: 'Aloo', price: 25, emoji: '🥔', unit: 'kg' },
          { name: 'Mirch', price: 60, emoji: '🌶️', unit: 'kg' }
        ];
      }

      context.availableProducts = products;
      await sendMessage(from, templates.showProducts(products, selected.name));
      saveConversation(from, flowName, 3, context);
      break;
    }

    // ── User confirming product selection ──
    case 'product_confirmation': {
      if (!isAffirmative(messageText)) {
        await sendMessage(from, `Kya changes chahiye? Batao ya _"haan"_ bolein toh aage badhte hain ✅`);
        return; // Stay at same step
      }

      console.log('[Router] Products confirmed, building order summary');

      const products = context.availableProducts || [];
      const items = products.map(p => ({
        name: p.name,
        qty: p.unit ? '1kg' : '1',
        price: p.price,
        emoji: p.emoji
      }));

      const subtotal = items.reduce((sum, item) => sum + item.price, 0);
      const platformFee = 10;
      const total = subtotal + platformFee;

      context.selectedProducts = items;
      context.subtotal = subtotal;
      context.platformFee = platformFee;
      context.total = total;

      const merchantName = context.selectedMerchant?.name || 'Store';
      await sendMessage(from, templates.orderSummary(items, subtotal, platformFee, total, merchantName));
      saveConversation(from, flowName, 4, context);
      break;
    }

    // ── User confirming payment ──
    case 'payment_confirmation': {
      if (!isPayIntent(messageText)) {
        await sendMessage(from, `_"Pay"_ bolein toh payment process kar deta hoon, ya _"cancel"_ karein ❌`);
        return; // Stay at same step
      }

      console.log('[Router] Payment confirmed, processing...');

      // Show processing indicator
      await sendMessage(from, templates.paymentProcessing());

      // Process payment & create order
      const updatedContext = await actionProcessPayment(from, context);

      // Send success message
      await sendMessage(from, templates.paymentSuccess(
        updatedContext.orderNumber,
        updatedContext.total || context.total,
        updatedContext.merchantPayout,
        updatedContext.deliveryTime
      ));

      // Flow complete
      clearConversation(from);
      console.log('[Router] ✅ GROCERY flow complete');
      break;
    }

    // ── User selecting a service type ──
    case 'service_type': {
      const serviceType = parseServiceType(messageText);

      if (!serviceType) {
        await sendMessage(from, `Konsi service chahiye? Jaise: _plumber_, _electrician_, _ac repair_ 🔧`);
        return; // Stay at same step
      }

      context.serviceType = serviceType;
      console.log(`[Router] Service type: ${serviceType}`);

      await sendMessage(from, templates.searching(serviceType + 's'));

      // Search providers
      const updatedContext = await actionSearchProviders(from, context);

      // Show providers
      await sendMessage(from, templates.showProviders(updatedContext.providers));
      saveConversation(from, flowName, 2, updatedContext);
      break;
    }

    // ── User selecting a service provider ──
    case 'provider_selection': {
      const providers = context.providers || [];
      let selectedIdx = parseNumberSelection(messageText, providers.length);

      if (selectedIdx === null) {
        selectedIdx = parseNameSelection(messageText, providers);
      }

      if (selectedIdx === null) {
        await sendMessage(from, `Kise book karein? Number (1, 2...) ya naam likhein 🔧`);
        return; // Stay at same step
      }

      const selected = providers[selectedIdx];
      context.selectedProvider = selected;
      console.log(`[Router] Selected provider: ${selected.name}`);

      // Send booking confirmation
      await sendMessage(from, templates.bookingConfirmed(
        selected.name,
        selected.available || '30 min',
        selected.charge || 150
      ));

      // Flow complete
      clearConversation(from);
      console.log('[Router] ✅ SERVICE flow complete');
      break;
    }

    default: {
      // State doesn't expect input — shouldn't normally reach here
      console.warn(`[Router] Unexpected state.expects: ${currentState.expects}`);
      clearConversation(from);
      await sendMessage(from, templates.notUnderstood());
      break;
    }
  }
}

// ── Exports ─────────────────────────────────────────────────

module.exports = { handleMessage };
