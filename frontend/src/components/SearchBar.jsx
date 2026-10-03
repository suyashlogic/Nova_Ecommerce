import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

// Sends the visitor to /shop?search=... (the Shop page reads it in Phase 7).
export default function SearchBar({ large = false, placeholder = 'Search products', onSearch }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop');
    onSearch?.(); // lets the mobile menu close itself
  }

  return (
    <form className={`nova-search ${large ? 'large' : ''}`} role="search" onSubmit={handleSubmit}>
      <Icon name="search" size={18} className="nova-search-icon" />
      <input
        type="search"
        className="form-control"
        placeholder={placeholder}
        aria-label="Search products"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        maxLength={100}
      />
      {large && <button type="submit" className="btn btn-nova-primary">Search</button>}
    </form>
  );
}
