import EmptyState from '../components/EmptyState';

// Placeholder so every route in the plan already exists and can be navigated to.
export default function ComingSoon({ title, phase }) {
  return (
    <div className="container page-section">
      <EmptyState
        title={`${title} is coming in Phase ${phase}`}
        message="This route is wired up and working. The page itself is built in an upcoming phase."
        action={{ to: '/', label: 'Back to home' }}
      />
    </div>
  );
}
