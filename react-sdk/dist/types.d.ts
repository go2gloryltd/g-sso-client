export type ChainType = 'ethereum' | 'solana' | 'bitcoin' | 'polkadot' | 'cardano';
export interface G2GConfig {
    clientId: string;
    clientSecret: string;
    apiUrl?: string;
    redirectUri?: string;
    flow?: 'redirect' | 'popup';
    chains?: ChainType[];
}
export interface G2GUser {
    address: string;
    chainType: ChainType;
    points: number;
    tier: string;
    joinedAt: string;
}
export interface G2GSession {
    token: string;
    user: G2GUser;
    expiresAt: string;
    expiresIn: number;
}
export interface AuthResponse {
    authenticated: boolean;
    token?: string;
    user?: G2GUser;
    error?: string;
    expiresAt?: string;
    expiresIn?: number;
}
export interface G2GContextValue {
    isAuthenticated: boolean;
    user: G2GUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (options?: LoginOptions) => Promise<void>;
    logout: () => Promise<void>;
    getSession: () => G2GSession | null;
}
export interface LoginOptions {
    chainType?: ChainType;
    preferredWallet?: string;
}
export interface WalletProvider {
    isMetaMask?: boolean;
    isPhantom?: boolean;
    isCoinbaseWallet?: boolean;
    request: (args: {
        method: string;
        params?: any[];
    }) => Promise<any>;
}
declare global {
    interface Window {
        ethereum?: WalletProvider;
    }
}
