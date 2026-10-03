import Icon from './Icon';

// [-] 2 [+] with limits. `max` is the available stock, so shoppers can't ask for more.
export default function QuantitySelector({ value, max, onChange, disabled = false }) {
  const set = (next) => onChange(Math.min(Math.max(1, next), max));
  return (
    <div className="qty" role="group" aria-label="Quantity">
      <button type="button" className="qty-btn" onClick={() => set(value - 1)} disabled={disabled || value <= 1} aria-label="Decrease quantity">
        <Icon name="minus" size={16} />
      </button>
      <span className="qty-value" aria-live="polite">{value}</span>
      <button type="button" className="qty-btn" onClick={() => set(value + 1)} disabled={disabled || value >= max} aria-label="Increase quantity">
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
