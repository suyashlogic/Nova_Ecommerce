// One labelled input with its error message. Used by every form so they all look
// and behave the same. Extra props (type, name, value, onChange...) go to the <input>.
export default function FormField({ id, label, error, hint, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <input
        id={id}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error && <div id={`${id}-error`} className="field-error">{error}</div>}
      {!error && hint && <div id={`${id}-hint`} className="field-hint">{hint}</div>}
    </div>
  );
}
