import { useState } from 'react';

// One labelled input with its error message. Used by every form so they all look
// and behave the same. Extra props (name, value, onChange...) go to the <input>.
// Password fields get a Show/Hide button, which helps a lot on phones.
export default function FormField({ id, label, error, hint, type = 'text', ...inputProps }) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const input = (
    <input
      id={id}
      type={isPassword && revealed ? 'text' : type}
      className={`form-control ${error ? 'is-invalid' : ''}`}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
      {...inputProps}
    />
  );

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      {isPassword ? (
        <div className="password-wrap">
          {input}
          <button
            type="button"
            className="password-toggle"
            onClick={() => setRevealed((value) => !value)}
            aria-pressed={revealed}
            aria-label={revealed ? 'Hide password' : 'Show password'}
          >
            {revealed ? 'Hide' : 'Show'}
          </button>
        </div>
      ) : (
        input
      )}
      {error && <div id={`${id}-error`} className="field-error">{error}</div>}
      {!error && hint && <div id={`${id}-hint`} className="field-hint">{hint}</div>}
    </div>
  );
}
