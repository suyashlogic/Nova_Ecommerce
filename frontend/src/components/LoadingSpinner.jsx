export default function LoadingSpinner({ label = 'Loading...', inline = false }) {
  if (inline) {
    return <span className="nova-spinner sm d-inline-block align-middle" role="status" aria-label={label} />;
  }
  return (
    <div className="nova-center" role="status">
      <div className="nova-spinner" />
      <span className="text-muted-nova">{label}</span>
    </div>
  );
}
