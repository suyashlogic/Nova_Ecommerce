// Business rules shared by pricing, cart and checkout.
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

// Payments are SIMULATED in this project. No card details are ever collected or stored.
export const PAYMENT_METHODS = ['card', 'upi', 'cod'];
