// Star rating. Two layers of stars: grey underneath, gold on top clipped to the right width.
export default function Rating({ value, count = 0, showCount = true }) {
  if (value === null || value === undefined) {
    return <span className="rating-none">No reviews yet</span>;
  }
  return (
    <span className="rating" aria-label={`Rated ${value} out of 5 from ${count} reviews`}>
      <span className="stars" aria-hidden="true">
        <span className="stars-fill" style={{ width: `${(value / 5) * 100}%` }}>★★★★★</span>
        ★★★★★
      </span>
      <span className="rating-value" aria-hidden="true">{value.toFixed(1)}</span>
      {showCount && <span className="rating-count" aria-hidden="true">({count})</span>}
    </span>
  );
}
