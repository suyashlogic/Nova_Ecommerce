import Icon from './Icon';

const STEPS = ['Cart', 'Shipping', 'Summary', 'Payment', 'Confirmation'];

// `current` is 1 to 4 while checking out. Step 5 is the order page shown after placing the order.
export default function CheckoutSteps({ current }) {
  return (
    <ol className="steps" aria-label="Checkout progress">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const done = number < current;
        return (
          <li key={label} className={done ? 'done' : number === current ? 'current' : ''} aria-current={number === current ? 'step' : undefined}>
            <span className="steps-dot">{done ? <Icon name="check" size={14} /> : number}</span>
            <span className="steps-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
