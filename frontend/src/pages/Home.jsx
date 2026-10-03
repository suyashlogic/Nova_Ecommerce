import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import HeroVisual from '../components/HeroVisual';
import ProductGrid from '../components/ProductGrid';
import CategoryCard from '../components/CategoryCard';
import SectionHeader from '../components/SectionHeader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import Icon from '../components/Icon';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import { listProducts } from '../services/productService';
import { listCategories } from '../services/categoryService';

const REASONS = [
  { icon: 'sparkle', title: 'Curated products', text: 'Every item is chosen for quality and usefulness. Fewer, better things.' },
  { icon: 'shield', title: 'Secure checkout', text: 'Your account is protected with hashed passwords and secure sessions.' },
  { icon: 'bolt', title: 'Fast order processing', text: 'Orders are confirmed instantly and tracked from payment to delivery.' },
  { icon: 'refresh', title: 'Easy returns', text: 'Changed your mind? Our returns process is simple and straightforward.' },
];

// One product row with all four states handled (loading, error, empty, success)
function ProductSection({ title, subtitle, linkTo, state }) {
  const { data, loading, error, reload } = state;
  return (
    <section className="page-section pt-0">
      <SectionHeader title={title} subtitle={subtitle} linkTo={linkTo} />
      {error ? (
        <ErrorState title="Unable to load products" message={error.message} onRetry={reload} />
      ) : !loading && data.products.length === 0 ? (
        <EmptyState title="No products found." message="Run seed.sql in pgAdmin to add demo products." />
      ) : (
        <ProductGrid products={data?.products} loading={loading} skeletonCount={4} cols="row-cols-2 row-cols-lg-4" />
      )}
    </section>
  );
}

export default function Home() {
  usePageTitle();

  // Three independent requests: one failing doesn't break the rest of the page
  const trending = useFetch(() => listProducts({ sort: 'rating', limit: 4, inStock: true }), []);
  const featured = useFetch(() => listProducts({ featured: true, limit: 4 }), []);
  const categories = useFetch(listCategories, []);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <p className="eyebrow">Product discovery</p>
              <h1 className="mb-3">Find something worth keeping.</h1>
              <p className="hero-lead">
                Explore carefully selected products for work, play and everyday life.
              </p>
              <div className="hero-search"><SearchBar large placeholder="Search headphones, desks, keyboards..." /></div>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link to="/shop" className="btn btn-nova-primary btn-lg">Browse the shop</Link>
                <Link to="/categories" className="btn btn-nova-outline btn-lg">Explore categories</Link>
              </div>
            </div>
            <div className="col-lg-6">
              <HeroVisual products={trending.data?.products} loading={trending.loading} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Category explorer ---------- */}
      <section className="page-section">
        <div className="container">
          <SectionHeader title="Browse by category" subtitle="Start with what you need today." linkTo="/categories" linkLabel="All categories" />
          {categories.error ? (
            <ErrorState title="Unable to load categories" message={categories.error.message} onRetry={categories.reload} />
          ) : (
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3">
              {categories.loading
                ? Array.from({ length: 6 }, (_, i) => (
                    <div className="col" key={i}><Skeleton height={150} radius="20px" /></div>
                  ))
                : categories.data.map((category) => (
                    <div className="col" key={category.id}><CategoryCard category={category} /></div>
                  ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Trending ---------- */}
      <div className="container">
        <ProductSection title="Trending now" subtitle="Top-rated and in stock." linkTo="/shop?sort=rating" state={trending} />
      </div>

      {/* ---------- Why NOVA ---------- */}
      <section className="why-section">
        <div className="container">
          <div className="text-center mb-5">
            <p className="eyebrow">Why NOVA</p>
            <h2>Shopping, without the noise</h2>
          </div>
          <div className="row g-4">
            {REASONS.map((reason) => (
              <div className="col-sm-6 col-lg-3" key={reason.title}>
                <div className="why-item">
                  <div className="why-icon"><Icon name={reason.icon} size={22} /></div>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Featured ---------- */}
      <div className="container pt-5">
        <ProductSection title="Featured picks" subtitle="Our team's current favourites." linkTo="/shop" state={featured} />
      </div>
    </>
  );
}
