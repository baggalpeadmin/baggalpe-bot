/* ============================================
   BAGGALPE — Response Message Templates
   Hindi/Hinglish conversational messages
   with emojis for WhatsApp delivery
   ============================================ */

'use strict';

/**
 * Formats a price in INR with ₹ symbol
 * @param {number} amount
 * @returns {string}
 */
function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Formats a star rating as emoji stars
 * @param {number} rating - Rating out of 5
 * @returns {string}
 */
function formatRating(rating) {
  const full = Math.floor(rating);
  const stars = '⭐'.repeat(full);
  return `${stars} ${rating}/5`;
}

/**
 * Generates a separator line for WhatsApp
 * @returns {string}
 */
function separator() {
  return '────────────';
}

// ── Template Functions ──────────────────────────────────────

module.exports = {

  /**
   * Welcome message for a returning user
   * @param {string} name - User's name
   * @returns {string}
   */
  welcome(name) {
    return (
      `Namaste ${name}! 🙏\n` +
      `Main hoon *Baggalpe AI* — aapka personal shopping assistant.\n\n` +
      `Aapko kya chahiye aaj? 🛒`
    );
  },

  /**
   * Welcome message for a brand-new user
   * @returns {string}
   */
  welcomeNew() {
    return (
      `Namaste! 🙏 Baggalpe mein aapka swagat hai!\n\n` +
      `Main aapka *AI shopping assistant* hoon. Grocery, sabzi, daily needs — ` +
      `sab kuch aapke neighbourhood se, seedha WhatsApp pe! 📱\n\n` +
      `Bas batao kya chahiye, baaki main sambhaal lunga 😊`
    );
  },

  /**
   * Prompt asking user what they need today
   * @returns {string}
   */
  askWhatYouNeed() {
    return (
      `Aapko kya chahiye aaj? 🛒\n\n` +
      `👉 Grocery / Kirana items\n` +
      `👉 Sabzi / Fruits\n` +
      `👉 Daily needs\n` +
      `👉 Service booking (Plumber, Electrician)\n\n` +
      `List bhej do ya ek ek karke batao — dono chalega! 😊`
    );
  },

  /**
   * Ask what service type the user wants
   * @returns {string}
   */
  askServiceType() {
    return (
      `Kya service chahiye aaj? 🔧\n\n` +
      `👉 Plumber\n` +
      `👉 Electrician\n` +
      `👉 AC Repair\n` +
      `👉 Carpenter\n` +
      `👉 Cleaning\n\n` +
      `Bas naam batao, main dhundh leta hoon aapke area mein! 🔍`
    );
  },

  /**
   * Searching indicator message
   * @param {string} [what='items'] - What we're searching for
   * @returns {string}
   */
  searching(what = 'items') {
    return `Aapke area mein ${what} dhundh raha hoon... 🔍`;
  },

  /**
   * Format a list of nearby merchants with emoji, distance, and rating
   * @param {Array<{name: string, distance: string, rating: number, id: number, speciality?: string}>} merchants
   * @returns {string}
   */
  showMerchants(merchants) {
    if (!merchants || merchants.length === 0) {
      return `Koi merchant nahi mila aapke paas 😔 Kuch aur try karein?`;
    }

    let msg = `📍 *Aapke paas ki dukaanein:* 🏪\n\n`;

    merchants.forEach((m, i) => {
      const num = i + 1;
      const rating = m.rating ? ` | ${formatRating(m.rating)}` : '';
      // Show distance from GPS if available
      let distance = '';
      if (m.distance_km !== undefined) {
        distance = m.distance_km < 1
          ? ` (${Math.round(m.distance_km * 1000)}m door)`
          : ` (${m.distance_km.toFixed(1)}km door)`;
      } else if (m.distance) {
        distance = ` (${m.distance} door)`;
      }
      const speciality = m.speciality ? `\n   📋 ${m.speciality}` : '';

      msg += `*${num}. 🏪 ${m.name}*${distance}${rating}${speciality}\n\n`;
    });

    msg += `Kaunsa store choose karein? Number ya naam bhejo 👆`;
    return msg;
  },

  /**
   * Format product cards for a specific merchant
   * @param {Array<{name: string, price: number, unit?: string, emoji?: string}>} products
   * @param {string} merchantName - Name of the merchant
   * @returns {string}
   */
  showProducts(products, merchantName) {
    if (!products || products.length === 0) {
      return `${merchantName} ke paas ye items available nahi hain 😔`;
    }

    let msg = `📦 *${merchantName}* ke available items:\n\n`;

    products.forEach((p, i) => {
      const emoji = p.emoji || '📦';
      const unit = p.unit || '';
      const unitStr = unit ? `/${unit}` : '';
      msg += `${emoji} ${p.name} — ${formatPrice(p.price)}${unitStr}\n`;
    });

    msg += `\nKitna chahiye? Ya _"sab bhej do"_ bol do! 😊`;
    return msg;
  },

  /**
   * Format a detailed order summary
   * @param {Array<{name: string, qty: string, price: number, emoji?: string}>} items
   * @param {number} subtotal
   * @param {number} platformFee
   * @param {number} total
   * @param {string} merchantName
   * @returns {string}
   */
  orderSummary(items, subtotal, platformFee, total, merchantName) {
    let msg = `✅ *Order Summary:*\n\n`;

    items.forEach(item => {
      const emoji = item.emoji || '📦';
      msg += `${emoji} ${item.name} ${item.qty} — ${formatPrice(item.price)}\n`;
    });

    msg += `${separator()}\n`;
    msg += `💰 Subtotal: ${formatPrice(subtotal)}\n`;
    msg += `📋 Platform Fee: ${formatPrice(platformFee)}\n`;
    msg += `🚚 Delivery: FREE\n`;
    msg += `${separator()}\n`;
    msg += `💳 *Total: ${formatPrice(total)}*\n`;
    msg += `⏱️ Delivery in ~45 min\n\n`;
    msg += `🔒 Secure payment via *Baggalpe Pay*\n\n`;
    msg += `_"Pay" bolein ya "cancel" karein_ 💬`;

    return msg;
  },

  /**
   * Payment processing indicator
   * @returns {string}
   */
  paymentProcessing() {
    return `🔄 Baggalpe Pay se payment process ho raha hai...\n\nPlease wait 🙏`;
  },

  /**
   * Payment success and order confirmation
   * @param {string} orderNumber - Order ID like BG-28491
   * @param {number} total - Total amount paid
   * @param {number} merchantPayout - Amount merchant receives
   * @param {string} deliveryTime - Estimated delivery time
   * @returns {string}
   */
  paymentSuccess(orderNumber, total, merchantPayout, deliveryTime) {
    return (
      `✅ *Baggalpe Pay* — ${formatPrice(total)} received!\n` +
      `🧾 Order *#${orderNumber}* confirmed\n` +
      `🚚 Delivery ho rahi hai\n` +
      `⏱️ Expected: ${deliveryTime}\n` +
      `💰 Merchant payout: ${formatPrice(merchantPayout)} (next business day)\n\n` +
      `Aapka order track karne ke liye *"track"* type karein 📦\n\n` +
      `Dhanyavaad! 🙏\n\n` +
      `🔒 Powered by Baggalpe Pay`
    );
  },

  /**
   * Service booking confirmation
   * @param {string} providerName - Name of the service provider
   * @param {string} time - Estimated arrival time
   * @param {number} charge - Visiting charge
   * @returns {string}
   */
  bookingConfirmed(providerName, time, charge) {
    return (
      `✅ *Booking confirmed!*\n` +
      `🔧 ${providerName} aa rahe hain\n` +
      `⏰ ~${time} mein pahunchenge\n` +
      `📞 Contact: Confirmation ke baad share hoga\n` +
      `💰 Visiting charge: ${formatPrice(charge)}\n\n` +
      `Service hone ke baad *Baggalpe Pay* se pay karein 🔒\n\n` +
      `${providerName} ko aapka address share kar diya hai 🏠`
    );
  },

  /**
   * Show available service providers
   * @param {Array<{name: string, rating: number, jobs: number, distance: string, charge: number, available: string}>} providers
   * @returns {string}
   */
  showProviders(providers) {
    if (!providers || providers.length === 0) {
      return `Abhi koi provider available nahi hai 😔 Thodi der mein try karein?`;
    }

    let msg = `Available providers: 🔧\n\n`;

    providers.forEach((p, i) => {
      const num = i + 1;
      msg += `*${num}. 🔧 ${p.name}*\n`;
      msg += `   ${formatRating(p.rating)} (${p.jobs} jobs)\n`;
      msg += `   📍 ${p.distance} away\n`;
      msg += `   💰 Visiting charge: ${formatPrice(p.charge)}\n`;
      msg += `   ⏰ Available in ${p.available}\n\n`;
    });

    msg += `Kise book karein? Number ya naam bhejo 👆`;
    return msg;
  },

  /**
   * Order tracking status update
   * @param {string} orderNumber - Order ID
   * @param {string} status - Current status
   * @returns {string}
   */
  orderTracking(orderNumber, status) {
    const statusEmojis = {
      placed: '📋 Order placed — merchant ko bhej diya',
      confirmed: '✅ Merchant ne confirm kar diya',
      preparing: '🔄 Order prepare ho raha hai',
      out_for_delivery: '🚚 Delivery ke liye nikal chuka hai!',
      delivered: '🎉 Deliver ho gaya! Enjoy karein!',
      cancelled: '❌ Order cancel ho gaya'
    };

    const statusText = statusEmojis[status] || `📦 Status: ${status}`;

    return (
      `📦 *Order #${orderNumber}*\n\n` +
      `${statusText}\n\n` +
      `Koi aur help chahiye? Bas bolein! 😊`
    );
  },

  /**
   * Fallback when the bot doesn't understand
   * @returns {string}
   */
  notUnderstood() {
    return (
      `Sorry, main samajh nahi paaya 😅\n\n` +
      `Kya aap dobara bata sakte hain? Ya in mein se kuch try karein:\n\n` +
      `👉 _"Grocery chahiye"_\n` +
      `👉 _"Plumber bhejo"_\n` +
      `👉 _"Order track karo"_\n` +
      `👉 _"Help"_`
    );
  },

  /**
   * Help text listing all available commands
   * @returns {string}
   */
  help() {
    return (
      `🤖 *Baggalpe AI — Main kya kar sakta hoon:*\n\n` +
      `🛒 *Shopping*\n` +
      `   → _"Grocery chahiye"_ — Kirana items order karein\n` +
      `   → _"Sabzi mangwao"_ — Fresh vegetables\n` +
      `   → _"Aata, daal, tel chahiye"_ — Seedha list bhejo\n\n` +
      `🔧 *Services*\n` +
      `   → _"Plumber bhejo"_ — Service book karein\n` +
      `   → _"Electrician chahiye"_ — Expert dhundhen\n\n` +
      `📦 *Order*\n` +
      `   → _"Track karo"_ — Order ka status dekhein\n` +
      `   → _"Cancel karo"_ — Order cancel karein\n\n` +
      `${separator()}\n` +
      `Bas Hindi ya Hinglish mein baat karein — main samajh jaunga! 😊`
    );
  },

  /**
   * Farewell / goodbye message
   * @returns {string}
   */
  goodbye() {
    return (
      `Dhanyavaad! 🙏\n\n` +
      `Baggalpe pe aane ke liye shukriya. Jab bhi zaroorat ho, bas message kar dena! 😊\n\n` +
      `Alvida! 👋`
    );
  },

  /**
   * No merchants found in the user's city
   * @param {string} city - City name
   * @returns {string}
   */
  merchantNotFound(city) {
    return (
      `Aapke city *${city}* mein abhi merchants register nahi hain 😔\n\n` +
      `Hum jaldi hi ${city} mein launch kar rahe hain! 🚀\n` +
      `Jaise hi available ho, aapko inform kar denge.\n\n` +
      `Tab tak koi aur help chahiye? 😊`
    );
  },

  /**
   * Product search returned no results
   * @param {string} query - What the user searched for
   * @returns {string}
   */
  productNotFound(query) {
    return (
      `"${query}" nahi mila nearby stores mein 😔\n\n` +
      `Kuch aur try karein ya alag tarike se likhen.\n` +
      `Jaise: _"aata"_, _"daal"_, _"sabzi"_ 🛒`
    );
  },

  /**
   * Generic error message shown to user when something breaks
   * @returns {string}
   */
  error() {
    return (
      `Oops! Kuch gadbad ho gayi 😓\n\n` +
      `Please thodi der mein dobara try karein.\n` +
      `Agar problem bani rahe toh humein contact karein 📞`
    );
  },

  /**
   * Confirmation prompt when user selects a merchant
   * @param {string} merchantName
   * @returns {string}
   */
  merchantSelected(merchantName) {
    return `👍 *${merchantName}* select kiya!\n\nUnke items dhundh raha hoon... 🔍`;
  },

  /**
   * Prompt asking user to confirm items before payment
   * @returns {string}
   */
  confirmItems() {
    return `Sab sahi hai? _"Haan"_ bolein toh order place kar deta hoon! ✅`;
  }
};
