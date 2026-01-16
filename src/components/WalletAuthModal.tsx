// src/components/WalletAuthModal.tsx - FINAL CORRECT VERSION
import React, { useState, useEffect } from 'react';
import { WalletDetector } from '../core/WalletDetector';
import { WalletConnector } from '../core/WalletConnector';
import type { WalletInfo, ChainType } from '../types';

export interface WalletAuthModalProps {
  apiUrl: string;
  clientId?: string;
  clientSecret?: string;
  open: boolean;
  onClose: () => void;
  onAuthenticated?: (address: string, chainType: ChainType, token: string) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// API CLIENT
// ============================================================================
class AuthApiClient {
  constructor(
    private baseUrl: string,
    private clientId: string = '',
    private clientSecret: string = ''
  ) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.clientId) h['X-Client-ID'] = this.clientId;
    if (this.clientSecret) h['X-Client-Secret'] = this.clientSecret;
    return h;
  }

  async post(endpoint: string, data: any): Promise<any> {
    const body = { ...data };
    if (this.clientId) body.client_id = this.clientId;
    
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }

  async get(endpoint: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.headers()
    });
    
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }
}

// ============================================================================
// STYLES
// ============================================================================
if (typeof document !== 'undefined') {
  const styleId = 'gsso-final-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .gsso-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
      .gsso-modal{background:#fff;border-radius:16px;width:560px;max-height:90vh;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);position:relative}
      .gsso-close{position:absolute;top:12px;right:12px;background:transparent;border:none;font-size:20px;color:#999;cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all 0.2s;z-index:10}
      .gsso-close:hover{background:rgba(0,0,0,0.05);color:#000}
      .gsso-header{padding:20px 24px 16px;text-align:center;border-bottom:1px solid #f0f0f0}
      .gsso-logo{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px}
      .gsso-logo-icon{width:28px;height:28px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px}
      .gsso-title{font-size:20px;font-weight:700;color:#111;margin:0}
      .gsso-subtitle{font-size:12px;color:#999;margin:6px 0 16px}
      .gsso-tabs{display:flex;gap:8px}
      .gsso-tab{flex:1;padding:10px;background:#fff;border:2px solid #e5e5e5;border-radius:8px;font-size:14px;font-weight:600;color:#666;cursor:pointer;transition:all 0.2s;font-family:inherit}
      .gsso-tab:hover{border-color:#667eea;color:#667eea}
      .gsso-tab.active{background:linear-gradient(135deg,#5469e9,#6b4ba2);border-color:transparent;color:#fff;box-shadow:0 4px 12px rgba(102,126,234,0.3)}
      .gsso-body{padding:20px;max-height:500px;overflow-y:auto}
      .gsso-success-banner{background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:2px solid #6ee7b7;border-radius:12px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:12px}
      .gsso-success-icon{font-size:24px;color:#059669}
      .gsso-success-info{flex:1}
      .gsso-success-title{font-size:16px;font-weight:700;color:#065f46;margin:0 0 4px}
      .gsso-success-address{font-family:monospace;font-size:11px;color:#047857;margin:0 0 4px}
      .gsso-success-chain{display:inline-block;padding:3px 10px;background:#10b981;color:#fff;border-radius:12px;font-size:10px;font-weight:700}
      .gsso-grid{display:grid;grid-template-columns:240px 1fr;gap:16px}
      .gsso-qr-box{background:linear-gradient(135deg,#e8f0fe,#f0e7fd);border:2px solid #d0d9f7;border-radius:12px;padding:16px;text-align:center}
      .gsso-qr-label{font-size:11px;font-weight:700;color:#5469e9;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px}
      .gsso-qr-code{position:relative;display:inline-block;padding:12px;background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
      .gsso-qr-code img{display:block;width:160px;height:160px;border-radius:8px}
      .gsso-qr-logo{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;background:#fff;border-radius:50%;padding:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15)}
      .gsso-qr-logo img{width:100%;height:100%;border-radius:50%}
      .gsso-ready{background:#fff;border-radius:12px}
      .gsso-ready-title{font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px}
      .gsso-wallet-card{display:flex;align-items:center;gap:12px;padding:12px;background:#f9f9f9;border:2px solid #e5e5e5;border-radius:10px;cursor:pointer;transition:all 0.2s;margin-bottom:8px;font-family:inherit;width:100%;text-align:left}
      .gsso-wallet-card:hover{background:#fff;border-color:#667eea;transform:translateX(2px);box-shadow:0 2px 8px rgba(102,126,234,0.15)}
      .gsso-wallet-card:disabled{cursor:not-allowed;opacity:0.6}
      .gsso-wallet-icon{font-size:28px;line-height:1}
      .gsso-wallet-info{flex:1;min-width:0}
      .gsso-wallet-name{font-size:14px;font-weight:600;color:#111;margin-bottom:2px}
      .gsso-wallet-chain{font-size:11px;color:#666;text-transform:capitalize}
      .gsso-wallet-check{width:20px;height:20px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
      .gsso-expand{width:100%;padding:12px;background:#fff;border:2px solid #e5e5e5;border-radius:10px;font-size:13px;font-weight:600;color:#667eea;cursor:pointer;transition:all 0.2s;margin-top:12px;font-family:inherit}
      .gsso-expand:hover{border-color:#667eea;background:#f8f9ff}
      .gsso-all-wallets{margin-top:16px;padding-top:16px;border-top:2px solid #f0f0f0}
      .gsso-all-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .gsso-all-title{font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.5px}
      .gsso-hide{padding:6px 14px;background:#f0f0f0;border:none;border-radius:6px;font-size:11px;font-weight:600;color:#666;cursor:pointer;transition:all 0.2s;font-family:inherit}
      .gsso-hide:hover{background:#667eea;color:#fff}
      .gsso-search{margin-bottom:12px}
      .gsso-search input{width:100%;padding:10px 12px;border:2px solid #e5e5e5;border-radius:8px;font-size:13px;outline:none;transition:all 0.2s;font-family:inherit}
      .gsso-search input:focus{border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,0.1)}
      .gsso-filters{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto}
      .gsso-filter{padding:6px 12px;background:#fff;border:2px solid #e5e5e5;border-radius:16px;font-size:11px;font-weight:600;color:#666;cursor:pointer;white-space:nowrap;transition:all 0.2s;font-family:inherit}
      .gsso-filter:hover{border-color:#667eea;color:#667eea}
      .gsso-filter.active{background:linear-gradient(135deg,#667eea,#764ba2);border-color:transparent;color:#fff;box-shadow:0 2px 6px rgba(102,126,234,0.25)}
      .gsso-wallet-list{max-height:280px;overflow-y:auto}
      .gsso-wallet-item{display:flex;align-items:center;gap:12px;padding:12px;background:#fff;border:2px solid #e5e5e5;border-radius:10px;cursor:pointer;transition:all 0.2s;margin-bottom:8px;font-family:inherit;width:100%;text-align:left}
      .gsso-wallet-item:hover{border-color:#667eea;transform:translateX(2px);box-shadow:0 2px 8px rgba(102,126,234,0.1)}
      .gsso-wallet-item .gsso-wallet-icon{font-size:32px}
      .gsso-wallet-item .gsso-wallet-name{display:flex;align-items:center;gap:6px}
      .gsso-wallet-desc{font-size:11px;color:#666;margin-top:2px}
      .gsso-installed{display:inline-block;width:16px;height:16px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:50%;font-size:10px;line-height:16px;text-align:center;font-weight:700}
      .gsso-footer{text-align:center;padding:12px;border-top:1px solid #f0f0f0;font-size:11px;color:#999}
      .gsso-footer a{color:#667eea;text-decoration:none;font-weight:600}
      .gsso-footer a:hover{text-decoration:underline}
      .gsso-loading{text-align:center;padding:60px 20px}
      .gsso-spinner{width:48px;height:48px;border:4px solid #f0f0f0;border-top-color:#667eea;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px}
      @keyframes spin{to{transform:rotate(360deg)}}
      .gsso-loading-text{font-size:15px;font-weight:600;color:#333;margin:0 0 6px}
      .gsso-loading-sub{font-size:12px;color:#999;margin:0}
      .gsso-verify-item{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
      .gsso-verify-check{font-size:18px;color:#10b981;margin-top:2px}
      .gsso-verify-info{flex:1}
      .gsso-verify-title{font-size:14px;font-weight:600;color:#111;margin-bottom:2px}
      .gsso-verify-desc{font-size:12px;color:#666}
      .gsso-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}
      .gsso-stat{background:#f9f9f9;border:1px solid #e5e5e5;border-radius:10px;padding:16px;text-align:center}
      .gsso-stat-label{font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px}
      .gsso-stat-value{font-size:28px;font-weight:700}
      .gsso-contracts{margin-top:20px}
      .gsso-contracts-title{font-size:11px;font-weight:700;color:#111;margin-bottom:12px}
      .gsso-contract-item{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;margin-bottom:8px}
      .gsso-contract-address{font-family:monospace;font-size:12px;color:#666}
      .gsso-contract-copy{background:transparent;border:none;color:#06b6d4;cursor:pointer;font-size:14px;padding:4px}
      .gsso-verify-link{display:inline-flex;align-items:center;gap:6px;color:#06b6d4;font-size:13px;font-weight:600;text-decoration:none}
      .gsso-verify-link:hover{text-decoration:underline}
      @media (max-width:640px){
        .gsso-modal{width:95%;margin:16px}
        .gsso-grid{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }
}

const LOGO_SVG = `data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='28' height='28' rx='6' fill='url(%23a)'/%3E%3Cpath d='M14 7c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm1.313 10.5h-2.625V10h2.625v7.5z' fill='%23fff'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='28' y2='28'%3E%3Cstop stop-color='%23667eea'/%3E%3Cstop offset='1' stop-color='%23764ba2'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E`;

const CHAINS = [
  { id: 'all', name: 'All', icon: '' },
  { id: 'ethereum', name: 'ETH', icon: '⟠' },
  { id: 'solana', name: 'SOL', icon: '◎' },
  { id: 'bitcoin', name: 'BTC', icon: '₿' },
  { id: 'polkadot', name: 'DOT', icon: '🔴' },
  { id: 'cardano', name: 'ADA', icon: '₳' }
];

// ============================================================================
// COMPONENT
// ============================================================================
export const WalletAuthModal: React.FC<WalletAuthModalProps> = ({
  apiUrl,
  clientId = '',
  clientSecret = '',
  open,
  onClose,
  onAuthenticated,
  onError
}) => {
  const [tab, setTab] = useState<'connect' | 'verify'>('connect');
  const [state, setState] = useState<'loading' | 'ready' | 'signing' | 'authenticated'>('loading');
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [qrSession, setQrSession] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState<ChainType | null>(null);
  const [token, setToken] = useState('');
  const [api] = useState(() => new AuthApiClient(apiUrl, clientId, clientSecret));

  useEffect(() => {
    if (open) {
      detectWallets();
      initQR();
    }
  }, [open]);

  const detectWallets = async () => {
    const detected = await WalletDetector.detectAll();
    setWallets(detected);
    setState('ready');
  };

  const initQR = async () => {
    try {
      const data = await api.post('/auth/qr/init', {});
      setQrSession(data);
    } catch (err) {
      console.error('QR init failed:', err);
    }
  };

  const handleConnect = async (wallet: WalletInfo) => {
    if (!wallet.installed) {
      window.open(wallet.downloadUrl, '_blank');
      return;
    }

    setState('signing');
    
    try {
      // Fix Phantom connection
      let addr: string;
      if (wallet.chain === 'solana') {
        const provider = (window as any).phantom?.solana || (window as any).solana;
        if (!provider) throw new Error('Phantom not found');
        
        try {
          const resp = await provider.connect({ onlyIfTrusted: false });
          addr = resp.publicKey.toString();
        } catch (err: any) {
          if (err.code === 4001) {
            throw new Error('Connection rejected by user');
          }
          throw err;
        }
      } else {
        addr = await WalletConnector.connect(wallet);
      }

      const { message, nonce } = await api.post('/auth/challenge', {
        address: addr,
        chainType: wallet.chain
      });
      
      const sig = await WalletConnector.signMessage(wallet, message);
      
      const { authenticated, token: authToken } = await api.post('/auth/verify', {
        address: addr,
        signature: sig,
        nonce,
        chainType: wallet.chain
      });

      if (authenticated && authToken) {
        setAddress(addr);
        setChain(wallet.chain);
        setToken(authToken);
        setState('authenticated');
        onAuthenticated?.(addr, wallet.chain, authToken);
      }
    } catch (err: any) {
      setState('ready');
      const errorMsg = err.message || 'Connection failed';
      alert(`Connection failed: ${errorMsg}`);
      onError?.(err);
    }
  };

  const installed = wallets.filter(w => w.installed);
  const filtered = wallets.filter(w => {
    if (filter !== 'all' && w.chain !== filter) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getQRUrl = () => {
    if (!qrSession) return '';
    const mobileAuthUrl = `${window.location.origin}/mobile-auth?session=${qrSession.sessionId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(mobileAuthUrl)}&color=667eea`;
  };

  if (!open) return null;

  return (
    <div className="gsso-overlay" onClick={onClose}>
      <div className="gsso-modal" onClick={e => e.stopPropagation()}>
        <button className="gsso-close" onClick={onClose}>×</button>

        <div className="gsso-header">
          <div className="gsso-logo">
            <div className="gsso-logo-icon">G</div>
            <h2 className="gsso-title">Go2Glory</h2>
          </div>
          <p className="gsso-subtitle">Multi-chain wallet authentication</p>
          
          <div className="gsso-tabs">
            <button 
              className={`gsso-tab ${tab === 'connect' ? 'active' : ''}`}
              onClick={() => setTab('connect')}
            >
              🔗 Connect
            </button>
            <button 
              className={`gsso-tab ${tab === 'verify' ? 'active' : ''}`}
              onClick={() => setTab('verify')}
            >
              ✓ Verify
            </button>
          </div>
        </div>

        <div className="gsso-body">
          {tab === 'connect' && (
            <>
              {state === 'loading' && (
                <div className="gsso-loading">
                  <div className="gsso-spinner"></div>
                  <p className="gsso-loading-text">Detecting wallets...</p>
                  <p className="gsso-loading-sub">Checking browser extensions</p>
                </div>
              )}

              {(state === 'ready' || state === 'authenticated') && (
                <>
                  {state === 'authenticated' && (
                    <div className="gsso-success-banner">
                      <div className="gsso-success-icon">✓</div>
                      <div className="gsso-success-info">
                        <div className="gsso-success-title">Authenticated!</div>
                        <div className="gsso-success-address">{address.substring(0, 6)}...{address.substring(address.length - 4)}</div>
                        <span className="gsso-success-chain">● {chain?.toUpperCase()}</span>
                      </div>
                    </div>
                  )}

                  <div className="gsso-grid">
                    <div className="gsso-qr-box">
                      <div className="gsso-qr-label">Scan QR</div>
                      <div className="gsso-qr-code">
                        {qrSession ? (
                          <img src={getQRUrl()} alt="QR Code" />
                        ) : (
                          <div style={{ width: '160px', height: '160px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#999' }}>Loading...</span>
                          </div>
                        )}
                        <div className="gsso-qr-logo">
                          <img src={LOGO_SVG} alt="Logo" />
                        </div>
                      </div>
                    </div>

                    <div className="gsso-ready">
                      <h3 className="gsso-ready-title">Ready to Connect</h3>
                      {installed.length > 0 ? (
                        installed.slice(0, 2).map(w => (
                          <button 
                            key={w.id}
                            className="gsso-wallet-card"
                            onClick={() => handleConnect(w)}
                            disabled={state === 'authenticated'}
                          >
                            <span className="gsso-wallet-icon">{w.icon}</span>
                            <div className="gsso-wallet-info">
                              <div className="gsso-wallet-name">{w.name}</div>
                              <div className="gsso-wallet-chain">{w.chain}</div>
                            </div>
                            {state === 'authenticated' && w.chain === chain && (
                              <span className="gsso-wallet-check">✓</span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                          No wallets detected
                        </div>
                      )}
                    </div>
                  </div>

                  {!showAll && (
                    <button 
                      className="gsso-expand"
                      onClick={() => setShowAll(true)}
                    >
                      View all supported wallets ▼
                    </button>
                  )}

                  {showAll && (
                    <div className="gsso-all-wallets">
                      <div className="gsso-all-header">
                        <span className="gsso-all-title">All Wallets</span>
                        <button 
                          className="gsso-hide"
                          onClick={() => setShowAll(false)}
                        >
                          Hide ▲
                        </button>
                      </div>

                      <div className="gsso-search">
                        <input 
                          type="text"
                          placeholder="Search..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                        />
                      </div>

                      <div className="gsso-filters">
                        {CHAINS.map(c => (
                          <button
                            key={c.id}
                            className={`gsso-filter ${filter === c.id ? 'active' : ''}`}
                            onClick={() => setFilter(c.id)}
                          >
                            {c.icon} {c.name}
                          </button>
                        ))}
                      </div>

                      <div className="gsso-wallet-list">
                        {filtered.map(w => (
                          <button
                            key={w.id}
                            className="gsso-wallet-item"
                            onClick={() => handleConnect(w)}
                          >
                            <span className="gsso-wallet-icon">{w.icon}</span>
                            <div className="gsso-wallet-info">
                              <div className="gsso-wallet-name">
                                {w.name}
                                {w.installed && <span className="gsso-installed">✓</span>}
                              </div>
                              <div className="gsso-wallet-desc">{w.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {state === 'signing' && (
                <div className="gsso-loading">
                  <div className="gsso-spinner"></div>
                  <p className="gsso-loading-text">Sign the message...</p>
                  <p className="gsso-loading-sub">Please approve in your wallet</p>
                </div>
              )}
            </>
          )}

          {tab === 'verify' && (
            <div>
              <div className="gsso-verify-item">
                <span className="gsso-verify-check">✓</span>
                <div className="gsso-verify-info">
                  <div className="gsso-verify-title">ENS Ownership</div>
                  <div className="gsso-verify-desc">Contra_e053</div>
                </div>
              </div>
              
              <div className="gsso-verify-item">
                <span className="gsso-verify-check">✓</span>
                <div className="gsso-verify-info">
                  <div className="gsso-verify-title">Contract Verified</div>
                  <div className="gsso-verify-desc">Matches go2glory.eth</div>
                </div>
              </div>
              
              <div className="gsso-verify-item">
                <span className="gsso-verify-check">✓</span>
                <div className="gsso-verify-info">
                  <div className="gsso-verify-title">Contract Age</div>
                  <div className="gsso-verify-desc">62 days</div>
                </div>
              </div>

              <div className="gsso-stats">
                <div className="gsso-stat">
                  <div className="gsso-stat-label">Total</div>
                  <div className="gsso-stat-value" style={{ color: '#06b6d4' }}>7</div>
                </div>
                
                <div className="gsso-stat">
                  <div className="gsso-stat-label">Success</div>
                  <div className="gsso-stat-value" style={{ color: '#10b981' }}>100%</div>
                </div>
                
                <div className="gsso-stat">
                  <div className="gsso-stat-label">Uptime</div>
                  <div className="gsso-stat-value" style={{ color: '#10b981' }}>99.9%</div>
                </div>
                
                <div className="gsso-stat">
                  <div className="gsso-stat-label">Sites</div>
                  <div className="gsso-stat-value" style={{ color: '#06b6d4' }}>2</div>
                </div>
              </div>

              <div className="gsso-contracts">
                <div className="gsso-contracts-title">Contracts</div>
                
                <div className="gsso-contract-item">
                  <span className="gsso-contract-address">0xa9e5...8190</span>
                  <button className="gsso-contract-copy">📋</button>
                </div>
                
                <div className="gsso-contract-item">
                  <span className="gsso-contract-address">0xFe96...4c4C</span>
                  <button className="gsso-contract-copy">📋</button>
                </div>

                <a 
                  href="https://etherscan.io/address/0xa9e5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gsso-verify-link"
                >
                  🔍 Verify on Etherscan ↗
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="gsso-footer">
          Protected by <a href="https://go2glory.eth" target="_blank" rel="noopener noreferrer">go2glory.eth</a>
        </div>
      </div>
    </div>
  );
};