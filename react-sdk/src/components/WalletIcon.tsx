// src/components/WalletIcon.tsx - NEW FILE

import React, { useState } from 'react';
import { FALLBACK_ICON } from '../config/icons';

interface WalletIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export const WalletIcon: React.FC<WalletIconProps> = ({ 
  src, 
  alt, 
  size = 32, 
  className = '' 
}) => {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? FALLBACK_ICON : src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={() => setError(true)}
      style={{ 
        display: 'block',
        objectFit: 'contain'
      }}
    />
  );
};