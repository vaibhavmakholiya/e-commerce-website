import React from 'react';

/**
 * RatingStars — Display read-only star rating from 0–5.
 * Renders filled, half-filled, or empty star SVGs with ARIA label.
 */
const RatingStars = ({ rating = 0, count, size = 16 }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = rating >= i + 1;
    const half = !filled && rating >= i + 0.5;
    return { filled, half };
  });

  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
      aria-label={`Rating: ${rating} out of 5${count ? `, ${count} reviews` : ''}`}
    >
      <span style={{ display: 'flex', gap: '2px' }} aria-hidden="true">
        {stars.map(({ filled, half }, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={filled ? '#f59e0b' : half ? 'url(#half)' : 'none'}
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            {half && (
              <defs>
                <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
          </svg>
        ))}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '2px' }}>
          ({count})
        </span>
      )}
    </span>
  );
};

export default RatingStars;
