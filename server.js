/**
 * @file server.js
 * @description Baggalpe WhatsApp AI Shopping Concierge — Express Server
 *
 * Endpoints:
 *   GET  /webhook   — Meta webhook verification
 *   POST /webhook   — Receive incoming WhatsApp messages
 *   POST /api/test  — Local test endpoint (no WhatsApp API needed)
 *   GET  /health    — Health check
 *   GET  /test/*    — Browser-based chat simulator (static)
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const { initDB } = require('./db/schema');
const { handleMessage } = require('./conversation/router');

const app = express();
app.use(express.json());
app.use('/test', express.static(path.join(__dirname, 'test')));

// ---------------------------------------------------------------------------
// GET /webhook — Meta Verification
// ---------------------------------------------------------------------------

/**
 * Handles the one-time webhook verification handshake required by Meta.
 * Meta sends hub.mode, hub.verify_token, and hub.challenge as query params.
 * We echo back the challenge only when the token matches our env variable.
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[Webhook] Verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ---------------------------------------------------------------------------
// POST /webhook — Receive WhatsApp Messages
// ---------------------------------------------------------------------------

/**
 * Receives incoming messages from the WhatsApp Cloud API webhook.
 *
 * Payload shape (simplified):
 *   body.entry[0].changes[0].value.messages[0]
 *     .from      — sender phone number (string)
 *     .text.body — message text (only for type === 'text')
 *     .id        — unique message id
 *     .type      — 'text', 'image', 'interactive', etc.
 *
 * We always return 200 immediately to avoid retries from Meta's servers.
 * Message processing happens asynchronously.
 */
app.post('/webhook', (req, res) => {
  // Acknowledge receipt immediately — Meta retries on non-2xx
  res.sendStatus(200);

  try {
    const entry = req.body?.entry;
    if (!entry || !entry.length) return;

    const changes = entry[0]?.changes;
    if (!changes || !changes.length) return;

    const value = changes[0]?.value;
    if (!value) return;

    const messages = value.messages;
    if (!messages || !messages.length) return;

    const message = messages[0];

    // Only process text messages — ignore status updates, read receipts, etc.
    if (message.type !== 'text') {
      console.log(`[Webhook] Ignoring non-text message type: ${message.type}`);
      return;
    }

    const from = message.from;        // sender phone number
    const text = message.text?.body;   // message content
    const messageId = message.id;      // unique message id

    if (!from || !text) return;

    console.log(`[Webhook] Message from ${from}: "${text}"`);

    // Fire-and-forget — errors are caught inside handleMessage
    handleMessage(from, text, messageId).catch((err) => {
      console.error(`[Webhook] Error handling message from ${from}:`, err);
    });
  } catch (err) {
    console.error('[Webhook] Payload parse error:', err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/test — Local Test Endpoint (NO WhatsApp needed)
// ---------------------------------------------------------------------------

/** @type {Map<string, Array<{type: string, text: string, buttons?: Array}>>} */
const testResponses = new Map();

/**
 * Allows testing the full conversation pipeline from the browser simulator
 * without requiring WhatsApp credentials.
 *
 * We temporarily monkey-patch the whatsapp service's send functions so that
 * instead of calling the Meta API they push messages into an in-memory array.
 * After handleMessage completes we return the collected responses as JSON.
 *
 * Request body: { phone: string, message: string }
 * Response:     { responses: Array<{ type, text, buttons? }> }
 */
app.post('/api/test', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message required' });
  }

  // Initialise a fresh response bucket for this phone
  testResponses.set(phone, []);

  // Monkey-patch whatsapp service to capture outgoing messages
  const whatsapp = require('./services/whatsapp');
  const originalSend = whatsapp.sendText;
  const originalButtons = whatsapp.sendButtons;

  whatsapp.sendText = async (to, text) => {
    const bucket = testResponses.get(phone);
    if (bucket) bucket.push({ type: 'text', text });
  };

  whatsapp.sendButtons = async (to, text, buttons) => {
    const bucket = testResponses.get(phone);
    if (bucket) bucket.push({ type: 'buttons', text, buttons });
  };

  try {
    await handleMessage(phone, message, 'test_msg_' + Date.now());

    // Small delay so any trailing async sends can land
    await new Promise((r) => setTimeout(r, 500));

    const responses = testResponses.get(phone) || [];
    res.json({ responses });
  } catch (err) {
    console.error('[Test] Error:', err);
    res.json({ responses: [{ type: 'text', text: 'Error: ' + err.message }] });
  } finally {
    // Restore original implementations
    whatsapp.sendText = originalSend;
    whatsapp.sendButtons = originalButtons;
    testResponses.delete(phone);
  }
});

// ---------------------------------------------------------------------------
// GET /health — Health Check
// ---------------------------------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Baggalpe Bot',
    uptime: process.uptime(),
  });
});

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 4000;

initDB(); // Create / migrate database tables

app.listen(PORT, () => {
  console.log(`\n🛒 Baggalpe Bot Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Webhook: http://localhost:${PORT}/webhook`);
  console.log(`🧪 Test Simulator:  http://localhost:${PORT}/test/simulator.html`);
  console.log(`❤️  Health Check:    http://localhost:${PORT}/health\n`);
});
