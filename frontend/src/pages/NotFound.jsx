import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div className="container page-section">
      <EmptyState
        icon="search"
        title="Page not found"
        message="The page you are looking for does not exist or has moved."
        action={{ to: '/', label: 'Back to home' }}
      />
    </div>
  );
}
