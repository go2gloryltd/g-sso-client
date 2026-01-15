// src/components/ConnectWallet.tsx
import React, { useState } from 'react';
import { WalletAuthModal } from './WalletAuthModal';
import type { ChainType } from '../types';

interface ConnectWalletProps {
  /** Backend API URL (e.g., https://g-sso.com or http://localhost:3001) */
  apiUrl: string;
  
  /** Callback when user successfully authenticates */
  onConnect?: (result: {
    address: string;
    chainType: ChainType;
    token: string;
  }) => void;
  
  /** Callback on error */
  onError?: (error: Error) => void;
  
  /** Custom button text */
  buttonText?: string;
  
  /** Custom button className */
  buttonClassName?: string;
  
  /** Children (custom button) */
  children?: React.ReactNode;
}

/**
 * ConnectWallet - Main component developers add to their site
 * 
 * Usage:
 * ```tsx
 * import { ConnectWallet } from 'gsso-sdk'
 * 
 * <ConnectWallet 
 *   apiUrl="https://g-sso.com"
 *   onConnect={(result) => {
 *     console.log('Connected:', result.address)
 *     console.log('Token:', result.token)
 *   }}
 * />
 * ```
 */
export const ConnectWallet: React.FC<ConnectWalletProps> = ({
  apiUrl,
  onConnect,
  onError,
  buttonText = 'Connect Wallet',
  buttonClassName,
  children
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleAuthenticated = (address: string, chainType: ChainType, token: string) => {
    onConnect?.({ address, chainType, token });
  };

  const handleError = (error: Error) => {
    onError?.(error);
  };

  return (
    <>
      {/* Custom button or default */}
      {children ? (
        <div onClick={() => setModalOpen(true)}>{children}</div>
      ) : (
        <button
          onClick={() => setModalOpen(true)}
          className={buttonClassName}
          style={!buttonClassName ? defaultButtonStyle : undefined}
        >
          {buttonText}
        </button>
      )}

      {/* Modal */}
      <WalletAuthModal
        apiUrl={apiUrl}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAuthenticated={handleAuthenticated}
        onError={handleError}
      />
    </>
  );
};

// Default button styles (if no custom className provided)
const defaultButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
};