import { TAX_RATE, SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '../config/constants.js';

// Money is calculated in whole cents (integers) because 0.1 + 0.2 !== 0.3 in floating point.
// Phase 9 (checkout) uses these same functions, so the cart and the final order always agree.
const toCents = (amount) => Math.round(Number(amount) * 100);
const fromCents = (cents) => cents / 100;

export const lineTotal = (unitPrice, quantity) => fromCents(toCents(unitPrice) * quantity);

// lines: [{ unitPrice, quantity }]   (unitPrice is the price AFTER discount, before tax)
export function calculateTotals(lines) {
  const subtotalCents = lines.reduce((sum, line) => sum + toCents(line.unitPrice) * line.quantity, 0);
  const thresholdCents = toCents(FREE_SHIPPING_THRESHOLD);

  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const qualifiesForFree = subtotalCents === 0 || subtotalCents >= thresholdCents;
  const shippingCents = qualifiesForFree ? 0 : toCents(SHIPPING_FEE);

  return {
    subtotal: fromCents(subtotalCents),
    taxRate: TAX_RATE,
    tax: fromCents(taxCents),
    shippingFee: fromCents(shippingCents),
    total: fromCents(subtotalCents + taxCents + shippingCents),
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping: subtotalCents > 0 && subtotalCents < thresholdCents
      ? fromCents(thresholdCents - subtotalCents)
      : 0,
  };
}
