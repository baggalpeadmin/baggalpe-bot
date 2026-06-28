/**
 * @file services/order.js
 * @description Order management — create, track, and calculate commissions.
 */

'use strict';

const {
  createOrder: dbCreateOrder,
  getOrder,
  updateOrderStatus,
  getMerchant,
} = require('../db/schema');

/**
 * Generate a unique order number in the format BG-XXXXX.
 * @returns {string}
 */
function generateOrderNumber() {
  const num = Math.floor(10000 + Math.random() * 90000); // 5-digit
  return `BG-${num}`;
}

/**
 * Create a new order.
 *
 * @param {string} userPhone   — Customer phone number
 * @param {number} merchantId  — Merchant ID
 * @param {Array<{productId: number, name: string, quantity: number, price: number}>} items
 * @returns {object} The created order details
 */
function createOrder(userPhone, merchantId, items) {
  try {
    // Calculate subtotal from items
    const subtotal = items.reduce((sum, item) => {
      return sum + item.price * (item.quantity || 1);
    }, 0);

    const platformFee = 10;
    const total = subtotal + platformFee;
    const orderNumber = generateOrderNumber();

    dbCreateOrder({
      orderNumber,
      userPhone,
      merchantId,
      items,
      subtotal,
      platformFee,
      total,
    });

    const order = {
      orderNumber,
      userPhone,
      merchantId,
      items,
      subtotal,
      platformFee,
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
    };

    console.log(`[Order] Created ${orderNumber} — ₹${total} (subtotal ₹${subtotal} + fee ₹${platformFee})`);
    return order;
  } catch (err) {
    console.error('[Order] createOrder error:', err.message);
    throw err;
  }
}

/**
 * Fetch an order by its order number, enriched with merchant details.
 *
 * @param {string} orderNumber — e.g. "BG-12345"
 * @returns {object|null} Order with merchant info, or null
 */
function getOrderByNumber(orderNumber) {
  try {
    const order = getOrder(orderNumber);
    if (!order) {
      console.log(`[Order] ${orderNumber} not found`);
      return null;
    }

    // Parse items JSON
    if (order.items && typeof order.items === 'string') {
      try {
        order.items = JSON.parse(order.items);
      } catch (_) {
        /* keep raw */
      }
    }

    // Attach merchant details
    const merchant = getMerchant(order.merchant_id);
    order.merchant = merchant || null;

    console.log(`[Order] Fetched ${orderNumber} — status: ${order.status}`);
    return order;
  } catch (err) {
    console.error('[Order] getOrderByNumber error:', err.message);
    return null;
  }
}

/**
 * Update the status of an order.
 *
 * @param {string} orderNumber
 * @param {string} status — e.g. 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
 * @returns {boolean} True if updated successfully
 */
function updateStatus(orderNumber, status) {
  try {
    const result = updateOrderStatus(orderNumber, status);
    const success = result.changes > 0;
    console.log(
      `[Order] ${orderNumber} status → ${status} (${success ? 'ok' : 'not found'})`
    );
    return success;
  } catch (err) {
    console.error('[Order] updateStatus error:', err.message);
    return false;
  }
}

/**
 * Calculate the commission breakdown for an order total.
 *
 * @param {number} total — The order total (excluding platform fee)
 * @returns {{merchantPayout: number, baggalpeCommission: number, platformFee: number}}
 */
function calculateCommission(total) {
  const baggalpeCommission = Math.round(total * 0.05 * 100) / 100;
  const merchantPayout = Math.round(total * 0.95 * 100) / 100;
  const platformFee = 10;

  return {
    merchantPayout,
    baggalpeCommission,
    platformFee,
  };
}

module.exports = {
  createOrder,
  getOrderByNumber,
  updateStatus,
  calculateCommission,
  generateOrderNumber,
};
