/**
 * @file services/catalog.js
 * @description Catalog service — merchant discovery and product search.
 * Supports both city-based and GPS-based merchant discovery.
 */

'use strict';

const {
  getMerchantsByCity,
  getProducts,
  searchProducts: dbSearchProducts,
  getMerchant,
  findMerchantsByLocation,
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
 * Find merchants near a GPS coordinate.
 * Uses each merchant's own delivery_radius_km to determine if user is within range.
 *
 * @param {number}  lat           — User's latitude
 * @param {number}  lng           — User's longitude
 * @param {string}  [businessType] — Optional type filter
 * @returns {object[]} Merchants sorted by distance, each with distance_km field
 */
function findMerchantsByGPS(lat, lng, businessType) {
  try {
    const merchants = findMerchantsByLocation(lat, lng, businessType);
    console.log(
      `[Catalog] Found ${merchants.length} merchants near (${lat}, ${lng})` +
        (businessType ? ` (type: ${businessType})` : '')
    );
    return merchants;
  } catch (err) {
    console.error('[Catalog] findMerchantsByGPS error:', err.message);
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
 * Search for a product across ALL nearby merchants and return results
 * sorted by price (lowest first). Useful for price comparison.
 *
 * @param {number} lat — User's latitude
 * @param {number} lng — User's longitude
 * @param {string} productName — Product to search for
 * @returns {Array<{merchant: object, product: object}>} Sorted by price ascending
 */
function findBestPrice(lat, lng, productName) {
  try {
    const nearbyMerchants = findMerchantsByLocation(lat, lng);
    const results = [];

    for (const merchant of nearbyMerchants) {
      const products = dbSearchProducts(merchant.id, productName);
      for (const product of products) {
        results.push({
          merchant: {
            id: merchant.id,
            name: merchant.name,
            address: merchant.address,
            rating: merchant.rating,
            distance_km: merchant.distance_km,
          },
          product: {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            unit: product.unit,
          },
        });
      }
    }

    results.sort((a, b) => a.product.price - b.product.price);

    console.log(
      `[Catalog] Best price for "${productName}" near (${lat},${lng}): ${results.length} options`
    );
    return results;
  } catch (err) {
    console.error('[Catalog] findBestPrice error:', err.message);
    return [];
  }
}

module.exports = {
  findNearbyMerchants,
  findMerchantsByGPS,
  searchProducts,
  getFullCatalog,
  findBestPrice,
};
