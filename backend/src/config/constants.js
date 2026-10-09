// Business rules shared by pricing, cart, checkout and the admin area.
// Prices are stored WITHOUT tax; tax is added on the subtotal at checkout.
export const TAX_RATE = 0.18; // 18% (GST-style)
export const SHIPPING_FEE = 99; // flat fee...
export const FREE_SHIPPING_THRESHOLD = 5000; // ...waived at or above this subtotal

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

// Which status an order may move to next. An admin cannot skip steps or reopen a finished order.
export const ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// Payments are SIMULATED in this project. No card details are ever collected or stored.
export const PAYMENT_METHODS = ['card', 'upi', 'cod'];

// At or below this many units a product counts as "low stock"
export const LOW_STOCK_LIMIT = 5;
