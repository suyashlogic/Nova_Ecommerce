// A grey shimmering placeholder shown while data loads.
export default function Skeleton({ height = 16, width = '100%', radius, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width, ...(radius ? { borderRadius: radius } : {}) }}
      aria-hidden="true"
    />
  );
}
