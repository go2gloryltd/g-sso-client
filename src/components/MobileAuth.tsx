// src/components/MobileAuth.tsx - Clean, zero dependencies
import React, { useState, useEffect } from 'react';
import { WalletDetector } from '../core/WalletDetector';
import { WalletConnector } from '../core/WalletConnector';
import type { WalletInfo, ChainType } from '../types';

interface MobileAuthProps {
  /** Backend API URL */
  apiUrl: string;
  
  /** Optional: Custom logo URL */
  logoUrl?: string;
  
  /** Optional: Callback on success */
  onSuccess?: (address: string, chainType: ChainType) => void;
  
  /** Optional: Callback on error */
  onError?: (error: Error) => void;
}

type AuthState = 'loading' | 'select' | 'connecting' | 'signing' | 'success' | 'error';

const CHAIN_INFO = {
  ethereum: { name: 'Ethereum', icon: '⟠', color: '#627EEA' },
  solana: { name: 'Solana', icon: '◎', color: '#14F195' },
  bitcoin: { name: 'Bitcoin', icon: '₿', color: '#F7931A' },
  polkadot: { name: 'Polkadot', icon: '🔴', color: '#E6007A' },
  cardano: { name: 'Cardano', icon: '₳', color: '#0033AD' }
};

/**
 * MobileAuth - Mobile authentication page
 * 
 * Usage in Next.js:
 * ```tsx
 * // app/mobile-auth/page.tsx
 * import { MobileAuth } from 'gsso-sdk'
 * 
 * export default function Page() {
 *   return <MobileAuth apiUrl="https://g-sso.com" />
 * }
 * ```
 * 
 * Usage in React Router:
 * ```tsx
 * // routes.tsx
 * import { MobileAuth } from 'gsso-sdk'
 * 
 * <Route path="/mobile-auth" element={<MobileAuth apiUrl="https://g-sso.com" />} />
 * ```
 */
export const MobileAuth: React.FC<MobileAuthProps> = ({
  apiUrl,
  logoUrl,
  onSuccess,
  onError
}) => {
  const [state, setState] = useState<AuthState>('loading');
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [challengeMessage, setChallengeMessage] = useState<string>('');
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Get session ID from URL
  const getSessionId = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('session');
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const sessionId = getSessionId();
    
    if (!sessionId) {
      setErrorMessage('Invalid session ID');
      setState('error');
      return;
    }

    try {
      // Fetch session data from backend
      const response = await fetch(`${apiUrl}/auth/qr/session-data/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Session not found or expired');
      }

      const data = await response.json();
      setChallengeMessage(data.challenge_message);

      // Detect wallets
      const detected = await WalletDetector.detectAll();
      setWallets(detected);

      setState('select');
    } catch (error: any) {
      console.error('Initialization error:', error);
      setErrorMessage(error.message || 'Failed to initialize');
      setState('error');
      onError?.(error);
    }
  };

  const handleWalletSelect = async (wallet: WalletInfo) => {
    if (!wallet.installed) {
      window.location.href = wallet.downloadUrl;
      return;
    }

    setSelectedWallet(wallet);
    setState('connecting');

    try {
      // Connect to wallet
      const address = await WalletConnector.connect(wallet);
      setConnectedAddress(address);
      
      setState('signing');

      // Sign message
      const signature = await WalletConnector.signMessage(wallet, challengeMessage);

      // Submit to backend
      const sessionId = getSessionId();
      const response = await fetch(`${apiUrl}/auth/qr/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          address,
          signature,
          chainType: wallet.chain
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Authentication failed');
      }

      setState('success');
      onSuccess?.(address, wallet.chain);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      let errorMsg = error.message || 'Connection failed';
      
      if (errorMsg.includes('rejected') || errorMsg.includes('User rejected')) {
        errorMsg = 'You rejected the request';
      }
      
      setErrorMessage(errorMsg);
      setState('error');
      onError?.(error);
    }
  };

  const installedWallets = wallets.filter(w => w.installed);
  const notInstalledWallets = wallets.filter(w => !w.installed);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={styles.logo} />
          ) : (
            <div style={styles.defaultLogo}>🔐</div>
          )}
          <h2 style={styles.title}>Mobile Authentication</h2>
          <p style={styles.subtitle}>Connect your wallet to authenticate</p>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* LOADING */}
          {state === 'loading' && (
            <div style={styles.centerContent}>
              <div style={styles.spinner}></div>
              <p style={styles.text}>Initializing session...</p>
            </div>
          )}

          {/* WALLET SELECTION */}
          {state === 'select' && (
            <>
              {installedWallets.length > 0 ? (
                <>
                  <div style={styles.sectionTitle}>INSTALLED WALLETS ({installedWallets.length})</div>
                  <div style={styles.walletList}>
                    {installedWallets.map(wallet => (
                      <button
                        key={wallet.id}
                        onClick={() => handleWalletSelect(wallet)}
                        style={styles.walletButton}
                      >
                        <span style={styles.walletIcon}>{wallet.icon}</span>
                        <div style={styles.walletInfo}>
                          <div style={styles.walletName}>{wallet.name}</div>
                          <div style={styles.walletDesc}>{wallet.description}</div>
                        </div>
                        <span style={{ ...styles.badge, backgroundColor: wallet.color }}>
                          {CHAIN_INFO[wallet.chain].icon}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={styles.noWalletBox}>
                  <div style={styles.noWalletIcon}>📱</div>
                  <div style={styles.noWalletTitle}>No Wallet Detected</div>
                  <div style={styles.noWalletText}>Please install a wallet to continue</div>
                </div>
              )}

              {notInstalledWallets.length > 0 && (
                <>
                  <div style={{ ...styles.sectionTitle, marginTop: '24px' }}>
                    AVAILABLE WALLETS ({notInstalledWallets.length})
                  </div>
                  <div style={styles.walletList}>
                    {notInstalledWallets.map(wallet => (
                      <button
                        key={wallet.id}
                        onClick={() => handleWalletSelect(wallet)}
                        style={styles.walletButton}
                      >
                        <span style={styles.walletIcon}>{wallet.icon}</span>
                        <div style={styles.walletInfo}>
                          <div style={styles.walletName}>{wallet.name}</div>
                          <div style={styles.walletDesc}>{wallet.description}</div>
                        </div>
                        <span style={styles.downloadIcon}>↓</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* CONNECTING */}
          {state === 'connecting' && selectedWallet && (
            <div style={styles.centerContent}>
              <div style={styles.spinner}></div>
              <p style={styles.text}>Connecting to {selectedWallet.name}...</p>
              <p style={styles.smallText}>Please approve the connection request</p>
            </div>
          )}

          {/* SIGNING */}
          {state === 'signing' && selectedWallet && (
            <div style={styles.centerContent}>
              <div style={styles.spinner}></div>
              <p style={styles.text}>Sign the message...</p>
              <p style={styles.smallText}>Please approve in {selectedWallet.name}</p>
              <div style={styles.warningBox}>
                <p style={styles.warningTitle}>🔐 SIGNATURE REQUIRED</p>
                <p style={styles.warningText}>This proves wallet ownership</p>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {state === 'success' && (
            <div style={styles.centerContent}>
              <div style={styles.successIcon}>✓</div>
              <p style={styles.successTitle}>Success!</p>
              <p style={styles.text}>Authentication complete</p>
              <div style={styles.addressBox}>
                <p style={styles.addressLabel}>Connected Address</p>
                <p style={styles.address}>{connectedAddress}</p>
              </div>
              <p style={styles.smallText}>You can now close this window</p>
            </div>
          )}

          {/* ERROR */}
          {state === 'error' && (
            <div style={styles.centerContent}>
              <div style={styles.errorIcon}>✕</div>
              <p style={styles.errorTitle}>Error</p>
              <p style={styles.text}>{errorMessage}</p>
              <button
                onClick={initializeAuth}
                style={styles.retryButton}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Inline styles (no external dependencies)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden'
  },
  header: {
    padding: '32px 24px',
    textAlign: 'center',
    borderBottom: '1px solid #e5e5e5'
  },
  logo: {
    width: '64px',
    height: '64px',
    marginBottom: '16px'
  },
  defaultLogo: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#111'
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#999'
  },
  body: {
    padding: '24px'
  },
  centerContent: {
    textAlign: 'center',
    padding: '24px 0'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f0f0f0',
    borderTopColor: '#06b6d4',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px'
  },
  text: {
    margin: '0 0 8px 0',
    color: '#666',
    fontSize: '14px'
  },
  smallText: {
    margin: 0,
    color: '#999',
    fontSize: '12px'
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '12px'
  },
  walletList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  walletButton: {
    width: '100%',
    padding: '16px',
    background: 'white',
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const
  },
  walletIcon: {
    fontSize: '32px'
  },
  walletInfo: {
    flex: 1
  },
  walletName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111',
    marginBottom: '4px'
  },
  walletDesc: {
    fontSize: '11px',
    color: '#666'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white'
  },
  downloadIcon: {
    fontSize: '20px',
    color: '#999'
  },
  noWalletBox: {
    textAlign: 'center' as const,
    padding: '32px 24px',
    background: '#f0f9ff',
    borderRadius: '12px',
    border: '2px solid #bae6fd'
  },
  noWalletIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  noWalletTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: '8px'
  },
  noWalletText: {
    fontSize: '13px',
    color: '#075985'
  },
  warningBox: {
    marginTop: '16px',
    padding: '12px',
    background: '#fefce8',
    borderRadius: '8px',
    border: '1px solid #fde047'
  },
  warningTitle: {
    margin: '0 0 4px 0',
    fontSize: '11px',
    fontWeight: '700',
    color: '#854d0e'
  },
  warningText: {
    margin: 0,
    fontSize: '11px',
    color: '#a16207'
  },
  successIcon: {
    width: '64px',
    height: '64px',
    background: '#10b981',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 16px'
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#10b981',
    margin: '0 0 12px 0'
  },
  addressBox: {
    marginTop: '16px',
    padding: '12px',
    background: '#f0fdf4',
    borderRadius: '8px',
    border: '1px solid #bbf7d0'
  },
  addressLabel: {
    margin: '0 0 4px 0',
    fontSize: '10px',
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase' as const
  },
  address: {
    margin: 0,
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#15803d',
    wordBreak: 'break-all' as const
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    background: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 16px'
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ef4444',
    margin: '0 0 12px 0'
  },
  retryButton: {
    marginTop: '16px',
    padding: '12px 24px',
    background: '#06b6d4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};