import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// A modal "Are you sure?" with proper keyboard behaviour:
//  - focus moves into the dialog when it opens and returns to the trigger when it closes
//  - Tab and Shift+Tab stay inside the dialog (focus trap)
//  - Escape cancels, and the page behind does not scroll
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  // The effect below only depends on `open`, so it reads the latest props through refs.
  // (Otherwise it would re-run on every parent render and keep resetting focus.)
  const busyRef = useRef(busy);
  const cancelRef = useRef(onCancel);
  useEffect(() => {
    busyRef.current = busy;
    cancelRef.current = onCancel;
  });

  useEffect(() => {
    if (!open) return undefined;

    const trigger = document.activeElement; // remember who opened us
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('[data-autofocus]')?.focus(); // safest button first

    const handleKey = (event) => {
      if (event.key === 'Escape' && !busyRef.current) {
        cancelRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <div ref={dialogRef} className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-message">
        <h2 id="dialog-title" className="h5">{title}</h2>
        <p id="dialog-message" className="text-muted-nova">{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-nova-outline" onClick={onCancel} disabled={busy} data-autofocus>Keep it</button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-nova-primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
