// Client-side mirror of the server's checkout rules (the server always re-checks).
export const PAYMENT_OPTIONS = [
  { value: 'card', label: 'Credit or debit card', note: 'Demo only. No card details are collected.' },
  { value: 'upi', label: 'UPI', note: 'Demo only. No payment is taken.' },
  { value: 'cod', label: 'Cash on delivery', note: 'Pay when your order arrives. The order stays pending until confirmed.' },
];

export function validateShipping(form) {
  const errors = {};
  const len = (v) => v.trim().length;
  if (len(form.name) < 2 || len(form.name) > 100) errors.name = 'Name must be 2 to 100 characters';
  if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  if (len(form.line1) < 3) errors.line1 = 'Enter your street address';
  if (len(form.city) < 2) errors.city = 'Enter your city';
  if (len(form.state) < 2) errors.state = 'Enter your state';
  if (len(form.postalCode) < 3) errors.postalCode = 'Enter a valid postal code';
  if (len(form.country) < 2) errors.country = 'Enter your country';
  return errors;
}

// The server reports field errors as "shipping.name"; the form uses plain "name"
export function stripShippingPrefix(fieldErrors = {}) {
  return Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k.replace(/^shipping\./, ''), v]));
}
