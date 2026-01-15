// src/types/index.ts

export type ChainType = 'ethereum' | 'solana' | 'bitcoin' | 'polkadot' | 'cardano';

export interface User {
  address: string;
  chainType: ChainType;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinedAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
  lastActivity?: string;
  isActive?: boolean;
}

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

export interface WalletInfo extends WalletConfig {
  installed: boolean;
  provider?: any;
}

export interface G2GDAOConfig {
  apiUrl: string;
  clientId?: string;
  clientSecret?: string;
  theme?: 'dark' | 'light' | 'auto';
  modalPosition?: 'center' | 'right' | 'left';
  showVerification?: boolean;
  autoConnect?: boolean;
  sessionStorage?: 'localStorage' | 'sessionStorage' | 'cookie';
  tokenRefreshInterval?: number;
  chains?: ChainType[];
  onAuthenticated?: (user: User) => void;
  onLogout?: () => void;
  onError?: (error: Error) => void;
  enableQR?: boolean;
  qrSize?: number;
  qrTimeout?: number;
  analytics?: boolean;
  onEvent?: (event: string, data: any) => void;
  customStyles?: {
    modalBackground?: string;
    modalBorder?: string;
    modalRadius?: string;
    primaryColor?: string;
    primaryHover?: string;
    textPrimary?: string;
    textSecondary?: string;
    fontFamily?: string;
  };
}

export interface AuthResponse {
  authenticated: boolean;
  token: string;
  tokenType: string;
  chainType: ChainType;
  user: User;
  expiresAt: string;
  expiresIn: number;
}

export interface ChallengeResponse {
  message: string;
  nonce: string;
  chainType: ChainType;
  expiresIn: number;
}

export interface TokenValidationResponse {
  valid: boolean;
  token?: string;
  user?: User;
  session?: {
    expiresAt: string;
    lastActivity: string;
    isActive: boolean;
  };
  error?: string;
  reason?: string;
}

export interface QRSession {
  sessionId: string;
  nonce: string;
  expiresAt: string;
  authUrl: string;
}

export interface RecentActivity {
  timestamp: string;
  client_id: string;
  client_name: string;
  chainType: ChainType;
  success: boolean;
  response_time: number;
}

export interface BlockchainProof {
  ensAddress: string;
  match: boolean;
  ageDays: number;
  isRecent: boolean;
  totalAuths: number;
  successRate: string;
  uptime: string;
  clientCount: number;
}

export type EventType = 
  | 'authenticated'
  | 'logout'
  | 'error'
  | 'opened'
  | 'closed'
  | 'modal:opened'
  | 'modal:closed'
  | 'wallet:connecting'
  | 'wallet:connected'
  | 'wallet:disconnected'
  | 'qr:generated'
  | 'qr:scanned'
  | 'qr:expired'
  | 'token:refreshed';

export type EventHandler = (data?: any) => void;