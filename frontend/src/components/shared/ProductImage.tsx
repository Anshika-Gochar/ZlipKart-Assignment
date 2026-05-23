/**
 * ProductImage — Global image component with fallback.
 *
 * Handles:
 * - Broken/missing image URLs → shows placeholder SVG
 * - Consistent aspect ratio container
 * - object-contain for clean product display
 * - Lazy loading
 */

import { useState } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  /** 'contain' (default) for electronics/books, 'cover' for fashion */
  fit?: 'contain' | 'cover';
}

// Inline SVG placeholder — no external dependency
const PlaceholderSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    className="w-full h-full text-gray-300"
    aria-hidden="true"
  >
    <rect width="200" height="200" fill="#f8f9fa" />
    {/* Shopping bag icon */}
    <g transform="translate(60, 50)">
      <rect x="10" y="30" width="60" height="60" rx="4" fill="none" stroke="#d0d0d0" strokeWidth="4" />
      <path d="M20 30 C20 16 60 16 60 30" fill="none" stroke="#d0d0d0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="30" cy="55" r="3" fill="#d0d0d0" />
      <circle cx="50" cy="55" r="3" fill="#d0d0d0" />
    </g>
    <text x="100" y="145" textAnchor="middle" fontSize="11" fill="#d0d0d0" fontFamily="Arial, sans-serif">
      Image not available
    </text>
  </svg>
);

export const ProductImage = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fit = 'contain',
}: ProductImageProps) => {
  const [hasError, setHasError] = useState(false);

  const isValid = src && src.trim() !== '' && !src.includes('placeholder') && !hasError;

  return (
    <div className={`relative overflow-hidden bg-gray-50 ${containerClassName}`}>
      {isValid ? (
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          onError={() => setHasError(true)}
          className={`w-full h-full transition-opacity duration-200 ${
            fit === 'contain' ? 'object-contain p-2' : 'object-cover'
          } ${className}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <PlaceholderSVG />
        </div>
      )}
    </div>
  );
};
