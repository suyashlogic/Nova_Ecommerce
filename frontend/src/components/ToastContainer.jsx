import Icon from './Icon';

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    // aria-live makes screen readers announce new toasts
    <div className="nova-toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`nova-toast ${toast.type}`} role="status">
          <Icon name={toast.type === 'success' ? 'check' : 'alert'} size={18} className="toast-icon" />
          <span>{toast.message}</span>
          <button type="button" className="nova-toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
