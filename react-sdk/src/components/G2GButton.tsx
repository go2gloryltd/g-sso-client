// src/components/G2GButton.tsx

import React, { useState } from 'react';
import { useG2G } from '../useG2G';
import { LoaderIcon } from '../icons';

interface G2GButtonProps {
  onSuccess?: () => void;
  onErrorCallback?: (error: string) => void;
  loginText?: string;
  logoutText?: string;
  loadingText?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
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
}) => {
  const { isAuthenticated, loading, logout } = useG2G();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    if (isAuthenticated) {
      try {
        await logout();
      } catch (err: any) {
        onErrorCallback?.(err.message);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (isAuthenticated) {
      onSuccess?.();
    }
  };

  const buttonText = loading 
    ? loadingText 
    : isAuthenticated 
      ? logoutText 
      : loginText;

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={style}
      >
        {loading && <LoaderIcon size={16} />}
        {buttonText}
      </button>
    </>
  );
};