import CategoryCard from '../components/CategoryCard';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import { listCategories } from '../services/categoryService';

export default function Categories() {
  usePageTitle('Categories');
  const { data, loading, error, reload } = useFetch(listCategories, []);

  return (
    <div className="container page-section">
      <h1 className="page-title">Categories</h1>
      <p className="page-subtitle">Pick a category to start browsing.</p>

      {error && <ErrorState title="Unable to load categories" message={error.message} onRetry={reload} />}

      {!error && (
        <div className="row g-3 g-lg-4 row-cols-1 row-cols-sm-2 row-cols-lg-3">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <div className="col" key={i}><Skeleton height={150} radius="20px" /></div>)
            : data.map((category) => <div className="col" key={category.id}><CategoryCard category={category} /></div>)}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <EmptyState title="No categories yet." message="Run seed.sql in pgAdmin to add demo data." />
      )}
    </div>
  );
}
