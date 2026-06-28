/**
 * @file services/catalog.js
 * @description Catalog service — merchant discovery and product search.
 */

'use strict';

const {
  initDB,
  getMerchantsByCity,
  getProducts,
  searchProducts: dbSearchProducts,
  getMerchant,
} = require('../db/schema');

/**
 * Find active merchants in a city, optionally filtered by business type.
 *
 * @param {string}  city         — City name (case-insensitive)
 * @param {string}  [businessType] — e.g. 'kirana', 'sabzi', 'plumber'
 * @returns {object[]} Array of merchant rows
 */
function findNearbyMerchants(city, businessType) {
  try {
    const merchants = getMerchantsByCity(city, businessType);
    console.log(
      `[Catalog] Found ${merchants.length} merchants in ${city}` +
        (businessType ? ` (type: ${businessType})` : '')
    );
    return merchants;
  } catch (err) {
    console.error('[Catalog] findNearbyMerchants error:', err.message);
    return [];
  }
}

/**
 * Search products by name within a specific merchant's inventory.
 *
 * @param {number} merchantId
 * @param {string} query — Partial product name
 * @returns {object[]} Matching product rows
 */
function searchProducts(merchantId, query) {
  try {
    const results = dbSearchProducts(merchantId, query);
    console.log(
      `[Catalog] Search "${query}" in merchant ${merchantId}: ${results.length} results`
    );
    return results;
  } catch (err) {
    console.error('[Catalog] searchProducts error:', err.message);
    return [];
  }
}

/**
 * Get the full product catalog for a merchant.
 *
 * @param {number} merchantId
 * @returns {object[]} All in-stock products
 */
function getFullCatalog(merchantId) {
  try {
    const products = getProducts(merchantId);
    console.log(`[Catalog] Full catalog for merchant ${merchantId}: ${products.length} products`);
    return products;
  } catch (err) {
    console.error('[Catalog] getFullCatalog error:', err.message);
    return [];
  }
}

/**
 * Search for a product across ALL merchants in a city and return results
 * sorted by price (lowest first). Useful for price comparison.
 *
 * @param {string} city        — City name
 * @param {string} productName — Product to search for
 * @returns {Array<{merchant: object, product: object}>} Sorted by price ascending
 */
function findBestPrice(city, productName) {
  try {
    const db = initDB();

    const rows = db
      .prepare(
        `SELECT p.*, m.name AS merchant_name, m.id AS merchant_id, m.address, m.rating
         FROM products p
         JOIN merchants m ON p.merchant_id = m.id
         WHERE LOWER(m.city) = LOWER(?)
           AND LOWER(p.name) LIKE LOWER(?)
           AND p.in_stock = 1
           AND m.is_active = 1
         ORDER BY p.price ASC`
      )
      .all(city, `%${productName}%`);

    const results = rows.map((row) => ({
      merchant: {
        id: row.merchant_id,
        name: row.merchant_name,
        address: row.address,
        rating: row.rating,
      },
      product: {
        id: row.id,
        name: row.name,
        category: row.category,
        price: row.price,
        unit: row.unit,
      },
    }));

    console.log(
      `[Catalog] Best price for "${productName}" in ${city}: ${results.length} options`
    );
    return results;
  } catch (err) {
    console.error('[Catalog] findBestPrice error:', err.message);
    return [];
  }
}

module.exports = {
  findNearbyMerchants,
  searchProducts,
  getFullCatalog,
  findBestPrice,
};
