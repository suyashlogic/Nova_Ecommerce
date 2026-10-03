import { CURRENCY, LOCALE } from './constants';

const formatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

// formatCurrency(14999) -> "Rs 14,999.00" style output for the chosen locale
export default function formatCurrency(amount) {
  return formatter.format(Number(amount) || 0);
}
