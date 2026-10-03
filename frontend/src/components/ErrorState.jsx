import Icon from './Icon';

// Shown when a request FAILED ("Unable to load orders.") with an optional retry button.
export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state-box" role="alert">
      <div className="state-icon danger"><Icon name="alert" size={28} /></div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" className="btn btn-nova-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
