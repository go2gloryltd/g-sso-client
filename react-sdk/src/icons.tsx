// src/icons.tsx - COMPLETE FILE (replace everything)

import React from 'react';
import { G2GDAO_LOGO } from './config/icons';

export const CloseIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CheckIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LinkIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArrowRightIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LoaderIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SearchIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ClockIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const AlertIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const DownloadIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ExternalLinkIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = '' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const G2GDAOLogo: React.FC<{ 
  size?: number; 
  className?: string;
}> = ({ 
  size = 48, 
  className = ''
}) => {
  const [error, setError] = React.useState(false);

  if (error) {
    // Fallback SVG if CDN fails
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 48 48" 
        className={className}
      >
        <rect width="48" height="48" rx="8" fill="#8B5CF6"/>
        <text 
          x="24" 
          y="32" 
          fontSize="20" 
          fontWeight="bold" 
          textAnchor="middle" 
          fill="white"
        >
          G2G
        </text>
      </svg>
    );
  }

  return (
    <img
      src={G2GDAO_LOGO}
      alt="G2GDAO"
      width={size}
      height={size}
      className={className}
      onError={() => setError(true)}
      style={{ display: 'block' }}
    />
  );
};