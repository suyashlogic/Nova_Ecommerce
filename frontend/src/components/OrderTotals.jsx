import formatCurrency from '../utils/formatCurrency';

// Subtotal / tax / shipping / total. Used by checkout and the order details page.
// Pass taxRate (0.18) to label the tax line "Tax (18%)".
export default function OrderTotals({ subtotal, tax, taxRate, shippingFee, total }) {
  return (
    <dl className="summary-rows">
      <div><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
      <div><dt>Tax{taxRate ? ` (${Math.round(taxRate * 100)}%)` : ''}</dt><dd>{formatCurrency(tax)}</dd></div>
      <div><dt>Shipping</dt><dd>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</dd></div>
      <div className="summary-total"><dt>Total</dt><dd>{formatCurrency(total)}</dd></div>
    </dl>
  );
}
