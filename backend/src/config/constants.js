// Business rules shared by the seed script now, and by checkout in Phase 9.
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
