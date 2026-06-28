/**
 * @file services/whatsapp.js
 * @description WhatsApp Cloud API client for sending messages via Meta's Graph API.
 */

'use strict';

const axios = require('axios');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const BASE_URL = `https://graph.facebook.com/v25.0/${PHONE_ID}/messages`;

/**
 * Ensure the phone number includes country code (defaults to India +91).
 * @param {string} phone
 * @returns {string}
 */
function formatPhone(phone) {
  if (!phone) return phone;
  // Strip all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  // If 10 digits, prepend India country code
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

/**
 * Low-level POST to the WhatsApp Cloud API.
 * @param {object} body — Full message payload
 * @returns {Promise<object|null>}
 */
async function sendRequest(body) {
  try {
    const response = await axios.post(BASE_URL, body, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    console.log('[WA] Message sent:', JSON.stringify(response.data));
    return response.data;
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error('[WA] Send failed:', detail);
    return null;
  }
}

/**
 * Send a plain text message.
 * @param {string} to   — Recipient phone number
 * @param {string} text — Message body
 * @returns {Promise<object|null>}
 */
async function sendText(to, text) {
  return sendRequest({
    messaging_product: 'whatsapp',
    to: formatPhone(to),
    type: 'text',
    text: { preview_url: false, body: text },
  });
}

/**
 * Send an interactive message with reply buttons (max 3).
 * @param {string}   to       — Recipient phone number
 * @param {string}   bodyText — Message body
 * @param {Array<{id: string, title: string}>} buttons — Up to 3 buttons
 * @returns {Promise<object|null>}
 */
async function sendButtons(to, bodyText, buttons) {
  if (!buttons || buttons.length === 0 || buttons.length > 3) {
    console.error('[WA] sendButtons: need 1-3 buttons, got', buttons?.length);
    return null;
  }

  return sendRequest({
    messaging_product: 'whatsapp',
    to: formatPhone(to),
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map((btn) => ({
          type: 'reply',
          reply: { id: btn.id, title: btn.title.substring(0, 20) },
        })),
      },
    },
  });
}

/**
 * Send an interactive list message.
 * @param {string} to         — Recipient phone number
 * @param {string} bodyText   — Message body
 * @param {string} buttonText — Text on the list-open button
 * @param {Array<{title: string, rows: Array<{id: string, title: string, description?: string}>}>} sections
 * @returns {Promise<object|null>}
 */
async function sendList(to, bodyText, buttonText, sections) {
  if (!sections || sections.length === 0) {
    console.error('[WA] sendList: sections required');
    return null;
  }

  return sendRequest({
    messaging_product: 'whatsapp',
    to: formatPhone(to),
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonText.substring(0, 20),
        sections: sections.map((sec) => ({
          title: sec.title.substring(0, 24),
          rows: sec.rows.map((row) => ({
            id: row.id,
            title: row.title.substring(0, 24),
            description: row.description ? row.description.substring(0, 72) : undefined,
          })),
        })),
      },
    },
  });
}

/**
 * Mark an incoming message as read.
 * @param {string} messageId — The wamid of the incoming message
 * @returns {Promise<object|null>}
 */
async function markAsRead(messageId) {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );
    console.log('[WA] Marked as read:', messageId);
    return response.data;
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error('[WA] markAsRead failed:', detail);
    return null;
  }
}

module.exports = {
  sendText,
  sendButtons,
  sendList,
  markAsRead,
  formatPhone,
};
