import EmptyState from '../components/EmptyState';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
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
