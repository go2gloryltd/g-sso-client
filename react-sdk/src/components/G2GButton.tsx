// src/components/G2GButton.tsx

import React, { ButtonHTMLAttributes } from 'react';
import { useG2G } from '../useG2G';

// ✅ FIX: Remove 'extends' and manually pick the props we need
interface G2GButtonProps {
  onSuccess?: () => void;
  onErrorCallback?: (error: string) => void;  // ✅ Renamed to avoid conflict
  loginText?: string;
  logoutText?: string;
  loadingText?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onClick?: () => void;
}

export const G2GButton: React.FC<G2GButtonProps> = ({
  onSuccess,
  onErrorCallback,
  loginText = '🔐 Sign in with G2GDAO',
  logoutText = 'Logout',
  loadingText = 'Connecting...',
  className = '',
  style,
  disabled,
  ...props
}) => {
  const { isAuthenticated, loading, login, logout, error } = useG2G();

  const handleClick = async () => {
    try {
      if (isAuthenticated) {
        await logout();
      } else {
        await login();
        onSuccess?.();
      }
    } catch (err: any) {
      onErrorCallback?.(err.message);
    }
  };

  const buttonText = loading 
    ? loadingText 
    : isAuthenticated 
      ? logoutText 
      : loginText;

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      className={`g2g-button ${className}`}
      style={style}
      {...props}
    >
      {buttonText}
    </button>
  );
};