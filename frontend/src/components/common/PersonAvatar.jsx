import React from 'react';
import './PersonAvatar.css';

/**
 * PersonAvatar
 * Corporate default person silhouette avatar with multi-size support.
 */
export default function PersonAvatar({
  name = '',
  gender = '',
  photo = null,
  size = 'md', // 'xs' (20px) | 'sm' (26px) | 'md' (34px) | 'lg' (48px) | 'xl' (64px)
  className = '',
  style = {},
  variant = 'default', // 'default' | 'blue' | 'emerald' | 'amber' | 'slate'
}) {
  const isFemale = (gender || '').toLowerCase().includes('female');

  return (
    <div
      className={`person-avatar-box size-${size} variant-${variant} ${className}`}
      style={style}
      title={name ? `${name}` : 'Candidate Profile'}
      aria-label={name ? `${name}'s Profile` : 'Candidate Profile'}
    >
      {photo ? (
        <img
          src={photo}
          alt={name || 'Candidate'}
          className="person-avatar-img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="person-avatar-svg"
          aria-hidden="true"
        >
          {isFemale ? (
            // Professional female silhouette vector
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.9.9 3.5 2.3 4.5A7.5 7.5 0 0 0 4 18.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1 7.5 7.5 0 0 0-5.8-7.5c1.4-1 2.3-2.6 2.3-4.5A4.5 4.5 0 0 0 12 2Zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"
            />
          ) : (
            // Professional universal/male silhouette vector
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm-2 10a7 7 0 0 0-7 7v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1a7 7 0 0 0-7-7h-4Z"
            />
          )}
        </svg>
      )}
    </div>
  );
}
