/* ============================================
   BAGGALPE — Conversation Flow Definitions
   State machine for multi-step chat flows
   ============================================ */

'use strict';

// ── Flow State Definitions ──────────────────────────────────
// Each flow is a named sequence of states.
// A state can have:
//   - step      : sequential step number (0-based)
//   - prompt    : name of the template function to call for the response
//   - expects   : what kind of user input this state waits for
//   - action    : name of the backend action to execute (no user input needed)

/**
 * @typedef {Object} FlowState
 * @property {number}  step    - Step index in the flow (0-based)
 * @property {string}  [prompt]  - Template function name to render response
 * @property {string}  [expects] - Type of user input expected at this step
 * @property {string}  [action]  - Backend action to execute at this step
 */

/**
 * @typedef {Object} Flow
 * @property {string} name - Unique flow identifier
 * @property {Object<string, FlowState>} states - Named states keyed by state name
 */

const FLOWS = {

  // ── Grocery / Kirana Shopping Flow ──
  GROCERY: {
    name: 'grocery',
    states: {
      ASK_LOCATION: {
        step: 0,
        prompt: 'askLocation',
        expects: 'items_list'  // Also accepts location messages
      },
      SEARCH_CATALOG: {
        step: 1,
        action: 'searchCatalog'
      },
      SHOW_MERCHANTS: {
        step: 2,
        prompt: 'showMerchants',
        expects: 'merchant_selection'
      },
      SHOW_CATEGORIES: {
        step: 3,
        prompt: 'showCategories',
        expects: 'category_selection'
      },
      SHOW_ITEMS: {
        step: 4,
        prompt: 'showCategoryItems',
        expects: 'item_selection'
      },
      PAYMENT: {
        step: 5,
        prompt: 'orderSummary',
        expects: 'payment_confirmation'
      },
      PROCESS_PAYMENT: {
        step: 6,
        action: 'processPayment'
      },
      COMPLETE: {
        step: 7,
        prompt: 'paymentSuccess'
      }
    }
  },

  // ── Service Booking Flow ──
  SERVICE: {
    name: 'service',
    states: {
      ASK_SERVICE_TYPE: {
        step: 0,
        prompt: 'askServiceType',
        expects: 'service_type'
      },
      SEARCH_PROVIDERS: {
        step: 1,
        action: 'searchProviders'
      },
      SHOW_PROVIDERS: {
        step: 2,
        prompt: 'showProviders',
        expects: 'provider_selection'
      },
      CONFIRM_BOOKING: {
        step: 3,
        prompt: 'bookingConfirmed'
      },
      COMPLETE: {
        step: 4
      }
    }
  }
};

// ── Helper Functions ────────────────────────────────────────

/**
 * Returns the flow definition object for a given flow name.
 * Supports both key names ("GROCERY") and flow names ("grocery").
 *
 * @param {string} flowName - Flow key or name (case-insensitive)
 * @returns {Flow|null} The flow object or null if not found
 */
function getFlow(flowName) {
  if (!flowName) return null;

  const upper = flowName.toUpperCase();

  // Direct key match: "GROCERY", "SERVICE"
  if (FLOWS[upper]) {
    return FLOWS[upper];
  }

  // Match by flow.name: "grocery", "service"
  const lower = flowName.toLowerCase();
  for (const key of Object.keys(FLOWS)) {
    if (FLOWS[key].name === lower) {
      return FLOWS[key];
    }
  }

  return null;
}

/**
 * Returns the state object at a given step number within a flow.
 *
 * @param {string} flowName - Flow key or name
 * @param {number} step - Step number (0-based)
 * @returns {FlowState|null} The state object or null if not found
 */
function getState(flowName, step) {
  const flow = getFlow(flowName);
  if (!flow) return null;

  for (const stateKey of Object.keys(flow.states)) {
    if (flow.states[stateKey].step === step) {
      return { ...flow.states[stateKey], key: stateKey };
    }
  }

  return null;
}

/**
 * Returns the next step number after the current step.
 * Returns -1 if the current step is the last step (flow complete).
 *
 * @param {string} flowName - Flow key or name
 * @param {number} currentStep - Current step number (0-based)
 * @returns {number} Next step number, or -1 if flow is complete
 */
function getNextStep(flowName, currentStep) {
  const flow = getFlow(flowName);
  if (!flow) return -1;

  // Find the max step in this flow
  const allSteps = Object.values(flow.states).map(s => s.step);
  const maxStep = Math.max(...allSteps);

  if (currentStep >= maxStep) {
    return -1; // Flow is complete
  }

  return currentStep + 1;
}

/**
 * Returns the state name/key for a given step number.
 *
 * @param {string} flowName - Flow key or name
 * @param {number} step - Step number
 * @returns {string|null} The state key (e.g., 'ASK_ITEMS') or null
 */
function getStateName(flowName, step) {
  const state = getState(flowName, step);
  return state ? state.key : null;
}

/**
 * Returns the total number of steps in a flow.
 *
 * @param {string} flowName - Flow key or name
 * @returns {number} Total step count, or 0 if flow not found
 */
function getTotalSteps(flowName) {
  const flow = getFlow(flowName);
  if (!flow) return 0;
  return Object.keys(flow.states).length;
}

/**
 * Checks whether a given step is the final step of a flow.
 *
 * @param {string} flowName - Flow key or name
 * @param {number} step - Step number
 * @returns {boolean}
 */
function isFlowComplete(flowName, step) {
  return getNextStep(flowName, step) === -1;
}

// ── Exports ─────────────────────────────────────────────────

module.exports = {
  FLOWS,
  getFlow,
  getState,
  getNextStep,
  getStateName,
  getTotalSteps,
  isFlowComplete
};
