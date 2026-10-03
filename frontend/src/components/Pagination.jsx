import Icon from './Icon';

// 1 ... 4 [5] 6 ... 12  (always first, last, and the pages around the current one)
function buildPageList(current, total) {
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const items = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push(`gap-${page}`);
    items.push(page);
  });
  return items;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-5">
      <ul className="pagination nova-pagination justify-content-center flex-wrap">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page">
            <Icon name="chevronLeft" size={16} />
          </button>
        </li>
        {buildPageList(page, totalPages).map((item) =>
          typeof item === 'string' ? (
            <li key={item} className="page-item disabled"><span className="page-link">…</span></li>
          ) : (
            <li key={item} className={`page-item ${item === page ? 'active' : ''}`}>
              <button type="button" className="page-link" onClick={() => onChange(item)} aria-current={item === page ? 'page' : undefined}>
                {item}
              </button>
            </li>
          )
        )}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
            <Icon name="chevronRight" size={16} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
