// src/types.ts - Complete Type Definitions for G-SSO SDK

export type ChainType = 'ethereum' | 'solana' | 'bitcoin' | 'polkadot' | 'cardano';

export type StorageType = 'localStorage' | 'sessionStorage' | 'cookie';

export type ThemeType = 'dark' | 'light' | 'auto';

export type ModalPosition = 'center' | 'top' | 'bottom';

/**
 * Main SDK Configuration
 */
export interface GSSORConfig {
  // ============= REQUIRED =============
  apiUrl: string;

  // ============= OPTIONAL - Authentication =============
  clientId?: string;
  clientSecret?: string;
  autoConnect?: boolean;

  // ============= OPTIONAL - UI/UX =============
  theme?: ThemeType;
  modalPosition?: ModalPosition;
  showVerification?: boolean;

  // ============= OPTIONAL - Session =============
  sessionStorage?: StorageType;
  tokenRefreshInterval?: number; // milliseconds

  // ============= OPTIONAL - Chains =============
  chains?: ChainType[];

  // ============= OPTIONAL - QR Code =============
  enableQR?: boolean;
  qrSize?: number;
  qrTimeout?: number; // seconds

  // ============= OPTIONAL - Analytics =============
  analytics?: boolean;
  onEvent?: (event: string, data?: any) => void;

  // ============= OPTIONAL - Callbacks =============
  onAuthenticated?: (user: User) => void;
  onLogout?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Alias for backward compatibility
 */
export type G2GDAOConfig = GSSORConfig;

/**
 * User Information
 */
export interface User {
  address: string;
  chainType: ChainType;
  points?: number;
  tier?: string;
  joinedAt?: string;
  ensName?: string;
  avatar?: string;
}

/**
 * Session Information
 */
export interface Session {
  user: User;
  token: string;
  expiresAt: string;
  lastActivity?: string;
  isActive?: boolean;
}

/**
 * Authentication Result
 */
export interface AuthResult {
  authenticated: boolean;
  token?: string;
  user?: User;
  wallet?: string;
  chainType?: ChainType;
  error?: string;
  expiresAt?: string;
}

/**
 * Alias for backward compatibility
 */
export type AuthResponse = AuthResult;

/**
 * Challenge Response from Backend
 */
export interface ChallengeResponse {
  message: string;
  nonce: string;
  expiresAt?: string;
}

/**
 * Token Validation Response
 */
export interface TokenValidationResponse {
  valid: boolean;
  user?: User;
  session?: {
    expiresAt: string;
    lastActivity?: string;
    isActive?: boolean;
  };
}

/**
 * QR Session Data
 */
export interface QRSession {
  sessionId: string;
  expiresAt: string;
  status: 'pending' | 'completed' | 'expired';
  qrCodeUrl?: string;
  mobileAuthUrl?: string;
}

/**
 * Wallet Configuration
 */
export interface WalletConfig {
  id: string;
  name: string;
  icon: string;
  chain: ChainType;
  platforms: 'desktop' | 'mobile' | 'both';
  color: string;
  downloadUrl: string;
  mobileDeepLink?: string;
  providerKey: string;
  description: string;
  popular?: boolean;
}

/**
 * Detected Wallet Information
 */
export interface WalletInfo extends WalletConfig {
  installed: boolean;
  provider?: any;
}

/**
 * Recent Activity
 */
export interface RecentActivity {
  id: string;
  type: 'login' | 'logout' | 'token_refresh';
  timestamp: string;
  chainType: ChainType;
  address: string;
  metadata?: Record<string, any>;
}

/**
 * Blockchain Proof
 */
export interface BlockchainProof {
  signature: string;
  message: string;
  address: string;
  chainType: ChainType;
  timestamp: string;
  verified: boolean;
}

/**
 * Event Types
 */
export type EventType = 
  | 'authenticated'
  | 'logout'
  | 'error'
  | 'modal:opened'
  | 'modal:closed'
  | 'wallet:connected'
  | 'wallet:disconnected'
  | 'token:refreshed'
  | 'opened'   // Alias for modal:opened
  | 'closed';  // Alias for modal:closed

/**
 * Event Handler
 */
export type EventHandler = (data?: any) => void;

/**
 * Login Options
 */
export interface LoginOptions {
  wallet?: string;
  chain?: ChainType;
}

/**
 * Wallet Provider Interface
 */
export interface WalletProvider {
  isMetaMask?: boolean;
  isPhantom?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  isTrust?: boolean;
  isRainbow?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (data: any) => void) => void;
  removeListener?: (event: string, handler: (data: any) => void) => void;
}

/**
 * Window Extensions
 */
declare global {
  interface Window {
    ethereum?: WalletProvider;
    solana?: any;
    phantom?: any;
    unisat?: any;
    cardano?: any;
    injectedWeb3?: any;
    GSSO?: any; // Global SDK instance
  }
}