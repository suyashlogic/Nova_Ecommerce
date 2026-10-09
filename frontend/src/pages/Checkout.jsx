import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import FormField from '../components/FormField';
import useFocusFirstInvalid from '../hooks/useFocusFirstInvalid';
import OrderTotals from '../components/OrderTotals';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';
import Skeleton from '../components/Skeleton';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import usePageTitle from '../hooks/usePageTitle';
import { placeOrder } from '../services/orderService';
import { PAYMENT_OPTIONS, stripShippingPrefix, validateShipping } from '../utils/shippingValidation';
import formatCurrency from '../utils/formatCurrency';
import imageUrl from '../utils/imageUrl';

// Compact read-only list of what is being bought
function ItemList({ items }) {
  return (
    <ul className="detail-items">
      {items.map((item) => (
        <li key={item.productId}>
          <img src={imageUrl(item.imageUrl)} alt="" loading="lazy" />
          <div className="flex-grow-1">
            <div className="fw-medium">{item.name}</div>
            <div className="text-muted-nova small">{formatCurrency(item.unitPrice)} &times; {item.quantity}</div>
          </div>
          <div className="fw-semibold">{formatCurrency(item.lineTotal)}</div>
        </li>
      ))}
    </ul>
  );
}

export default function Checkout() {
  usePageTitle('Checkout');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, summary, adjustments, loading, error, reload, dismissAdjustments } = useCart();

  // 1 Cart -> 2 Shipping -> 3 Summary -> 4 Payment -> (order placed) 5 Confirmation page
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState(() => ({
    name: user.name ?? '',
    phone: user.phone ?? '',
    line1: user.addressLine1 ?? '',
    line2: user.addressLine2 ?? '',
    city: user.city ?? '',
    state: user.state ?? '',
    postalCode: user.postalCode ?? '',
    country: user.country ?? 'India',
  }));
  const [errors, setErrors] = useState({});
  useFocusFirstInvalid(errors);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [formError, setFormError] = useState('');

  // Start each step at the top of the page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleChange = (event) => setShipping({ ...shipping, [event.target.name]: event.target.value });

  function submitShipping(event) {
    event.preventDefault();
    const found = validateShipping(shipping);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(3);
  }

  async function handlePlaceOrder() {
    setPlacing(true);
    setFormError('');
    try {
      // We send ONLY the address and payment choice. Items and prices are read from the
      // saved cart on the server, so the browser cannot change what it is charged.
      const order = await placeOrder({
        shipping: Object.fromEntries(Object.entries(shipping).map(([k, v]) => [k, v.trim()])),
        paymentMethod,
      });
      setPlaced(true);
      reload(); // the server emptied the cart, so refresh our copy and the navbar badge
      navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } });
    } catch (err) {
      if (err.status === 409) {
        // Stock changed or cart empty: explain, refresh the cart and go back to review
        setFormError(err.message);
        reload();
        setStep(1);
      } else if (Object.keys(err.fieldErrors ?? {}).length > 0) {
        setErrors(stripShippingPrefix(err.fieldErrors));
        setStep(2);
      } else {
        setFormError(err.message);
      }
      setPlacing(false);
    }
  }

  if (placed) return null; // navigating to the confirmation page

  if (loading) {
    return (
      <div className="container page-section" aria-hidden="true">
        <Skeleton height={44} width="50%" className="mb-4" />
        <Skeleton height={320} radius="20px" />
      </div>
    );
  }

  if (error) {
    return <div className="container page-section"><ErrorState title="Unable to load your cart" message={error.message} onRetry={reload} /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="container page-section">
        {formError && <div className="alert alert-danger" role="alert">{formError}</div>}
        <EmptyState icon="cart" title="Your cart is empty." message="Add something to your cart before checking out." action={{ to: '/shop', label: 'Continue shopping' }} />
      </div>
    );
  }

  const selectedPayment = PAYMENT_OPTIONS.find((o) => o.value === paymentMethod);

  return (
    <div className="container page-section">
      <h1 className="page-title">Checkout</h1>
      <CheckoutSteps current={step} />

      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <div className="nova-card nova-card-pad">
            {formError && <div className="alert alert-danger" role="alert">{formError}</div>}

            {/* ---------- Step 1: cart review ---------- */}
            {step === 1 && (
              <>
                <h2 className="h4 mb-3">Review your cart</h2>
                {adjustments.length > 0 && (
                  <div className="alert alert-warning d-flex justify-content-between gap-3" role="alert">
                    <ul className="mb-0 ps-3">{adjustments.map((a, i) => <li key={`${a.productId}-${i}`}>{a.message}</li>)}</ul>
                    <button type="button" className="btn-close" aria-label="Dismiss notice" onClick={dismissAdjustments} />
                  </div>
                )}
                <ItemList items={items} />
                <div className="d-flex flex-wrap justify-content-between gap-2 mt-4">
                  <Link to="/cart" className="btn btn-nova-ghost">Edit cart</Link>
                  <button type="button" className="btn btn-nova-primary" onClick={() => { setFormError(''); setStep(2); }}>Continue to shipping</button>
                </div>
              </>
            )}

            {/* ---------- Step 2: shipping ---------- */}
            {step === 2 && (
              <form onSubmit={submitShipping} noValidate>
                <h2 className="h4 mb-3">Shipping information</h2>
                <div className="row">
                  <div className="col-md-6"><FormField id="name" name="name" label="Full name" autoComplete="name" value={shipping.name} onChange={handleChange} error={errors.name} /></div>
                  <div className="col-md-6"><FormField id="phone" name="phone" type="tel" label="Phone" autoComplete="tel" value={shipping.phone} onChange={handleChange} error={errors.phone} /></div>
                </div>
                <FormField id="line1" name="line1" label="Address line 1" autoComplete="address-line1" value={shipping.line1} onChange={handleChange} error={errors.line1} />
                <FormField id="line2" name="line2" label="Address line 2 (optional)" autoComplete="address-line2" value={shipping.line2} onChange={handleChange} error={errors.line2} />
                <div className="row">
                  <div className="col-md-6"><FormField id="city" name="city" label="City" autoComplete="address-level2" value={shipping.city} onChange={handleChange} error={errors.city} /></div>
                  <div className="col-md-6"><FormField id="state" name="state" label="State" autoComplete="address-level1" value={shipping.state} onChange={handleChange} error={errors.state} /></div>
                  <div className="col-md-6"><FormField id="postalCode" name="postalCode" label="Postal code" autoComplete="postal-code" value={shipping.postalCode} onChange={handleChange} error={errors.postalCode} /></div>
                  <div className="col-md-6"><FormField id="country" name="country" label="Country" autoComplete="country-name" value={shipping.country} onChange={handleChange} error={errors.country} /></div>
                </div>
                <div className="d-flex justify-content-between gap-2 mt-2">
                  <button type="button" className="btn btn-nova-ghost" onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className="btn btn-nova-primary">Continue to summary</button>
                </div>
              </form>
            )}

            {/* ---------- Step 3: order summary ---------- */}
            {step === 3 && (
              <>
                <h2 className="h4 mb-3">Order summary</h2>
                <ItemList items={items} />
                <div className="summary-address">
                  <div>
                    <div className="filter-title">Shipping to</div>
                    <address className="address-block mb-0">
                      <strong>{shipping.name}</strong><br />
                      {shipping.line1}{shipping.line2 && `, ${shipping.line2}`}<br />
                      {shipping.city}, {shipping.state} {shipping.postalCode}, {shipping.country}<br />
                      <span className="text-muted-nova">{shipping.phone}</span>
                    </address>
                  </div>
                  <button type="button" className="btn btn-nova-ghost btn-sm" onClick={() => setStep(2)}>Edit</button>
                </div>
                <div className="d-flex justify-content-between gap-2 mt-4">
                  <button type="button" className="btn btn-nova-ghost" onClick={() => setStep(2)}>Back</button>
                  <button type="button" className="btn btn-nova-primary" onClick={() => setStep(4)}>Continue to payment</button>
                </div>
              </>
            )}

            {/* ---------- Step 4: payment and place order ---------- */}
            {step === 4 && (
              <>
                <h2 className="h4 mb-3">Payment</h2>
                <div className="alert alert-success" role="note">
                  This is a demo store. No real payment is taken and no card details are collected.
                </div>
                <div className="pay-options" role="radiogroup" aria-label="Payment method">
                  {PAYMENT_OPTIONS.map((option) => (
                    <label key={option.value} className={`pay-option ${paymentMethod === option.value ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value={option.value} checked={paymentMethod === option.value} onChange={() => setPaymentMethod(option.value)} />
                      <span>
                        <strong>{option.label}</strong>
                        <small>{option.note}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="d-flex flex-wrap justify-content-between gap-2 mt-4">
                  <button type="button" className="btn btn-nova-ghost" onClick={() => setStep(3)} disabled={placing}>Back</button>
                  <button type="button" className="btn btn-nova-primary btn-lg" onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? <LoadingSpinner inline label="Placing order" /> : `Place order \u00b7 ${formatCurrency(summary.total)}`}
                  </button>
                </div>
                <p className="field-hint mt-3 mb-0">Paying with: {selectedPayment.label}</p>
              </>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <aside className="nova-card nova-card-pad cart-summary" aria-label="Order total">
            <h2 className="h5 mb-2">Order total</h2>
            <OrderTotals subtotal={summary.subtotal} tax={summary.tax} taxRate={summary.taxRate} shippingFee={summary.shippingFee} total={summary.total} />
            <div className="text-muted-nova small">{summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}. Final prices are confirmed when you place the order.</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
