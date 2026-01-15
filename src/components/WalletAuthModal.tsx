// src/components/WalletAuthModal.tsx - Premium Design
import React, { useState, useEffect } from 'react';
import { WalletDetector } from '../core/WalletDetector';
import { WalletConnector } from '../core/WalletConnector';
import type { WalletInfo, ChainType } from '../types';

interface WalletAuthModalProps {
  apiUrl: string;
  open: boolean;
  onClose: () => void;
  onAuthenticated?: (address: string, chainType: ChainType, token: string) => void;
  onError?: (error: Error) => void;
}

type ConnectionState = 'loading' | 'qr' | 'connecting' | 'signing' | 'success' | 'error';

interface QRSession {
  sessionId: string;
  expiresAt: string;
  status: 'pending' | 'completed' | 'expired';
}

const CHAIN_INFO = {
  ethereum: { name: 'ETH', icon: '⟠', color: '#627EEA' },
  solana: { name: 'SOL', icon: '◎', color: '#14F195' },
  bitcoin: { name: 'BTC', icon: '₿', color: '#F7931A' },
  polkadot: { name: 'DOT', icon: '🔴', color: '#E6007A' },
  cardano: { name: 'ADA', icon: '₳', color: '#0033AD' }
};

// Premium styles with modern design
if (typeof document !== 'undefined') {
  const styleId = 'g2g-modal-styles-premium';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `
      .g2g-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:9999;animation:fadeIn 0.2s;padding:16px}
      .g2g-modal{background:#fff;border-radius:24px;width:100%;max-width:900px;max-height:90vh;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);animation:slideUp 0.3s;position:relative}
      .g2g-modal-close{position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.05);border:none;font-size:20px;color:#666;cursor:pointer;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all 0.2s;z-index:10}
      .g2g-modal-close:hover{background:rgba(0,0,0,0.1);transform:rotate(90deg);color:#000}
      .g2g-modal-header{padding:32px 32px 24px 32px;text-align:center;border-bottom:1px solid #f0f0f0}
      .g2g-modal-header h2{margin:0 0 8px 0;font-size:28px;font-weight:700;color:#111;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .g2g-modal-header p{margin:0;font-size:14px;color:#666}
      .g2g-modal-body{padding:32px;max-height:calc(90vh - 120px);overflow-y:auto}
      .g2g-loading{text-align:center;padding:60px 20px}
      .g2g-spinner{width:56px;height:56px;border:5px solid #f0f0f0;border-top-color:#667eea;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 20px}
      @keyframes spin{to{transform:rotate(360deg)}}
      .g2g-loading p{margin:0;color:#666;font-size:16px;font-weight:500}
      .g2g-qr-section{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
      .g2g-qr-wrapper{background:linear-gradient(135deg,#667eea15 0%,#764ba215 100%);border:2px solid #667eea30;border-radius:20px;padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px}
      .g2g-qr-code{position:relative;padding:16px;border-radius:16px;background:#fff;box-shadow:0 10px 25px rgba(102,126,234,0.15)}
      .g2g-qr-code img{display:block;border-radius:12px;width:200px;height:200px}
      .g2g-qr-logo{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:8px;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.15);width:56px;height:56px;display:flex;align-items:center;justify-content:center}
      .g2g-qr-logo img{width:40px;height:40px;border-radius:50%}
      .g2g-qr-text{text-align:center;margin-top:16px;font-size:13px;color:#666;font-weight:500}
      .g2g-backend-error{background:#fee;border:2px solid #fcc;color:#c00;padding:12px;border-radius:12px;font-size:12px;margin-top:12px;text-align:center;font-weight:500}
      .g2g-ready-section{background:#fff;border-radius:16px;padding:20px;border:2px solid #f0f0f0}
      .g2g-ready-section h3{margin:0 0 16px 0;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px}
      .g2g-ready-wallet{width:100%;padding:14px 16px;background:#f9f9f9;border:2px solid #f0f0f0;border-radius:12px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all 0.2s;margin-bottom:10px;text-align:left}
      .g2g-ready-wallet:hover{background:#fff;border-color:#667eea;transform:translateX(4px);box-shadow:0 4px 12px rgba(102,126,234,0.15)}
      .g2g-ready-wallet .wallet-icon{font-size:28px}
      .g2g-ready-wallet .wallet-info{flex:1}
      .g2g-ready-wallet .wallet-name{font-size:14px;font-weight:600;color:#111;margin-bottom:3px}
      .g2g-ready-wallet .wallet-chain{font-size:11px;color:#666;text-transform:capitalize}
      .g2g-ready-wallet .wallet-check{width:24px;height:24px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(16,185,129,0.3)}
      .g2g-all-wallets-toggle{width:100%;padding:14px;background:#fff;border:2px solid #f0f0f0;border-radius:12px;color:#667eea;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;margin-top:12px}
      .g2g-all-wallets-toggle:hover{background:#667eea;border-color:#667eea;color:#fff;transform:translateY(-2px);box-shadow:0 4px 12px rgba(102,126,234,0.25)}
      .g2g-all-wallets{border-top:2px solid #f0f0f0;padding-top:24px;margin-top:24px}
      .g2g-all-wallets-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
      .g2g-all-wallets-title{font-size:12px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px}
      .g2g-hide-btn{padding:8px 16px;background:#f9f9f9;border:2px solid #f0f0f0;border-radius:10px;font-size:12px;color:#666;cursor:pointer;transition:all 0.2s;font-weight:600}
      .g2g-hide-btn:hover{background:#667eea;border-color:#667eea;color:#fff}
      .g2g-search{margin-bottom:16px}
      .g2g-search input{width:100%;padding:14px 16px;border:2px solid #f0f0f0;border-radius:12px;font-size:14px;outline:none;transition:all 0.2s;background:#f9f9f9}
      .g2g-search input:focus{border-color:#667eea;box-shadow:0 0 0 4px rgba(102,126,234,0.1);background:#fff}
      .g2g-chain-filters{display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px}
      .g2g-chain-filters button{padding:8px 16px;background:#fff;border:2px solid #f0f0f0;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s;color:#666}
      .g2g-chain-filters button:hover{border-color:#667eea;color:#667eea;transform:translateY(-2px)}
      .g2g-chain-filters button.active{background:linear-gradient(135deg,#667eea,#764ba2);border-color:#667eea;color:#fff;box-shadow:0 4px 12px rgba(102,126,234,0.25)}
      .g2g-wallet-list{max-height:320px;overflow-y:auto}
      .g2g-wallet-item{width:100%;padding:14px 16px;background:#fff;border:2px solid #f0f0f0;border-radius:12px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all 0.2s;margin-bottom:10px;text-align:left}
      .g2g-wallet-item:hover{border-color:#667eea;transform:translateX(4px);box-shadow:0 4px 12px rgba(102,126,234,0.1)}
      .g2g-wallet-item .wallet-icon{font-size:32px}
      .g2g-wallet-item .wallet-info{flex:1;text-align:left}
      .g2g-wallet-item .wallet-name{font-size:15px;font-weight:600;color:#111;margin-bottom:4px;display:flex;align-items:center;gap:8px}
      .g2g-wallet-item .installed-badge{display:inline-block;width:20px;height:20px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:50%;font-size:11px;line-height:20px;text-align:center;font-weight:700;box-shadow:0 2px 6px rgba(16,185,129,0.3)}
      .g2g-wallet-item .wallet-desc{font-size:12px;color:#666}
      .g2g-success{text-align:center;padding:60px 20px}
      .g2g-success .success-icon{width:80px;height:80px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 24px;box-shadow:0 10px 25px rgba(16,185,129,0.25)}
      .g2g-success h3{margin:0 0 16px 0;font-size:28px;font-weight:700;background:linear-gradient(135deg,#10b981,#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .g2g-success .success-address{font-family:monospace;font-size:14px;color:#666;padding:14px;background:#f0fdf4;border:2px solid #d1fae5;border-radius:12px;margin:0;font-weight:500}
      .g2g-error{text-align:center;padding:60px 20px}
      .g2g-error .error-icon{width:80px;height:80px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 24px;box-shadow:0 10px 25px rgba(239,68,68,0.25)}
      .g2g-error h3{margin:0 0 16px 0;font-size:28px;font-weight:700;background:linear-gradient(135deg,#ef4444,#dc2626);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .g2g-error p{color:#666;font-size:15px;margin:0 0 24px 0}
      .g2g-error button{padding:14px 32px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(102,126,234,0.25)}
      .g2g-error button:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.35)}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
      @media (max-width:768px){.g2g-qr-section{grid-template-columns:1fr}.g2g-modal{width:95%;max-height:95vh;border-radius:20px}.g2g-modal-body{padding:24px}.g2g-qr-code img{width:180px;height:180px}.g2g-modal-header{padding:24px 24px 20px 24px}.g2g-modal-header h2{font-size:24px}}
    `;
    document.head.appendChild(styleEl);
  }
}

export const WalletAuthModal: React.FC<WalletAuthModalProps> = ({
  apiUrl,
  open,
  onClose,
  onAuthenticated,
  onError
}) => {
  const [state, setState] = useState<ConnectionState>('loading');
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<ChainType | 'all'>('all');
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [qrSession, setQrSession] = useState<QRSession | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [backendError, setBackendError] = useState<string>('');

  useEffect(() => {
    if (open) {
      detectWallets();
    }
    return () => {
      if (websocket) websocket.close();
    };
  }, [open]);

  useEffect(() => {
    if (state === 'loading' && wallets.length > 0) {
      const installed = wallets.filter(w => w.installed);
      if (installed.length === 1) {
        handleConnectWallet(installed[0]);
      } else {
        setState('qr');
        initQrSession();
      }
    }
  }, [state, wallets]);

  const detectWallets = async () => {
    const detected = await WalletDetector.detectAll();
    setWallets(detected);
    setState('loading');
  };

  const initQrSession = async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/qr/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const data = await response.json();
      setQrSession({
        sessionId: data.sessionId,
        expiresAt: data.expiresAt,
        status: 'pending'
      });
      setBackendError('');
      connectWebSocket(data.sessionId);
    } catch (error: any) {
      console.error('QR init failed:', error);
      if (error.message.includes('Failed to fetch')) {
        setBackendError(`⚠️ Backend not running at ${apiUrl}`);
      } else {
        setBackendError(`⚠️ ${error.message}`);
      }
    }
  };

  const connectWebSocket = (sessionId: string) => {
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    const ws = new WebSocket(`${wsUrl}/ws/auth?sessionId=${sessionId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'auth_success') {
        handleAuthSuccess(data.user.address, data.user.chainType, data.token);
        ws.close();
      }
    };
    
    ws.onerror = () => {
      startPolling(sessionId);
    };
    
    setWebsocket(ws);
  };

  const startPolling = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/auth/qr/status/${sessionId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          clearInterval(interval);
          handleAuthSuccess(data.user.address, data.user.chainType, data.token);
        } else if (data.status === 'expired') {
          clearInterval(interval);
          setQrSession(null);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  };

  const handleConnectWallet = async (wallet: WalletInfo) => {
    if (!wallet.installed || !wallet.provider) {
      window.open(wallet.downloadUrl, '_blank');
      return;
    }

    setSelectedWallet(wallet);
    setState('connecting');

    try {
      const address = await WalletConnector.connect(wallet);
      setState('signing');

      const challengeRes = await fetch(`${apiUrl}/auth/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, chainType: wallet.chain })
      });
      const { message, nonce } = await challengeRes.json();

      const signature = await WalletConnector.signMessage(wallet, message);

      const verifyRes = await fetch(`${apiUrl}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, nonce, chainType: wallet.chain })
      });
      const { authenticated, token } = await verifyRes.json();

      if (authenticated && token) {
        handleAuthSuccess(address, wallet.chain, token);
      }
    } catch (error: any) {
      setState('error');
      setErrorMessage(error.message || 'Connection failed');
      onError?.(error);
    }
  };

  const handleAuthSuccess = (address: string, chainType: ChainType, token: string) => {
    setConnectedAddress(address);
    setState('success');
    onAuthenticated?.(address, chainType, token);
    setTimeout(() => onClose(), 2000);
  };

  const filteredWallets = wallets.filter(w => {
    if (selectedChain !== 'all' && w.chain !== selectedChain) return false;
    if (searchQuery && !w.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const installedWallets = wallets.filter(w => w.installed);

  const getQRUrl = () => {
    if (!qrSession) return '';
    const mobileAuthUrl = `${window.location.origin}/mobile-auth?session=${qrSession.sessionId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileAuthUrl)}&color=667eea`;
  };

  if (!open) return null;

  return (
    <div className="g2g-modal-overlay" onClick={onClose}>
      <div className="g2g-modal" onClick={e => e.stopPropagation()}>
        <button className="g2g-modal-close" onClick={onClose}>✕</button>

        <div className="g2g-modal-header">
          <h2>Connect Wallet</h2>
          <p>Multi-chain wallet authentication</p>
        </div>

        <div className="g2g-modal-body">
          {state === 'loading' && (
            <div className="g2g-loading">
              <div className="g2g-spinner"></div>
              <p>Detecting wallets...</p>
            </div>
          )}

          {state === 'qr' && (
            <>
              <div className="g2g-qr-section">
                <div className="g2g-qr-wrapper">
                  <div className="g2g-qr-code">
                    {qrSession ? (
                      <img 
                        src={getQRUrl()}
                        alt="QR Code"
                      />
                    ) : (
                      <div style={{ width: '200px', height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#999' }}>Loading...</span>
                      </div>
                    )}
                    <div className="g2g-qr-logo">
                      <img src="https://via.placeholder.com/40/667eea/ffffff?text=DAO" alt="Logo" />
                    </div>
                  </div>
                  <div className="g2g-qr-text">Scan with mobile camera</div>
                  {backendError && (
                    <div className="g2g-backend-error">{backendError}</div>
                  )}
                </div>

                <div className="g2g-ready-section">
                  <h3>Ready to Connect</h3>
                  {installedWallets.slice(0, 2).map(wallet => (
                    <button
                      key={wallet.id}
                      className="g2g-ready-wallet"
                      onClick={() => handleConnectWallet(wallet)}
                    >
                      <span className="wallet-icon">{wallet.icon}</span>
                      <div className="wallet-info">
                        <div className="wallet-name">{wallet.name}</div>
                        <div className="wallet-chain">{wallet.chain}</div>
                      </div>
                      <span className="wallet-check">✓</span>
                    </button>
                  ))}
                </div>
              </div>

              {!showAllWallets && (
                <button 
                  className="g2g-all-wallets-toggle"
                  onClick={() => setShowAllWallets(true)}
                >
                  View All Wallets ({wallets.length})
                </button>
              )}

              {showAllWallets && (
                <div className="g2g-all-wallets">
                  <div className="g2g-all-wallets-header">
                    <span className="g2g-all-wallets-title">All Wallets</span>
                    <button 
                      className="g2g-hide-btn"
                      onClick={() => setShowAllWallets(false)}
                    >
                      Hide ▲
                    </button>
                  </div>

                  <div className="g2g-search">
                    <input
                      type="text"
                      placeholder="Search wallets..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="g2g-chain-filters">
                    <button
                      className={selectedChain === 'all' ? 'active' : ''}
                      onClick={() => setSelectedChain('all')}
                    >
                      All Chains
                    </button>
                    {Object.entries(CHAIN_INFO).map(([key, info]) => (
                      <button
                        key={key}
                        className={selectedChain === key ? 'active' : ''}
                        onClick={() => setSelectedChain(key as ChainType)}
                      >
                        {info.icon} {info.name}
                      </button>
                    ))}
                  </div>

                  <div className="g2g-wallet-list">
                    {filteredWallets.map(wallet => (
                      <button
                        key={wallet.id}
                        className="g2g-wallet-item"
                        onClick={() => handleConnectWallet(wallet)}
                      >
                        <span className="wallet-icon">{wallet.icon}</span>
                        <div className="wallet-info">
                          <div className="wallet-name">
                            {wallet.name}
                            {wallet.installed && <span className="installed-badge">✓</span>}
                          </div>
                          <div className="wallet-desc">{wallet.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {state === 'connecting' && (
            <div className="g2g-loading">
              <div className="g2g-spinner"></div>
              <p>Connecting to {selectedWallet?.name}...</p>
            </div>
          )}

          {state === 'signing' && (
            <div className="g2g-loading">
              <div className="g2g-spinner"></div>
              <p>Please sign the message in {selectedWallet?.name}...</p>
            </div>
          )}

          {state === 'success' && (
            <div className="g2g-success">
              <div className="success-icon">✓</div>
              <h3>Connected!</h3>
              <p className="success-address">{connectedAddress}</p>
            </div>
          )}

          {state === 'error' && (
            <div className="g2g-error">
              <div className="error-icon">✕</div>
              <h3>Connection Failed</h3>
              <p>{errorMessage}</p>
              <button onClick={() => setState('qr')}>Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};