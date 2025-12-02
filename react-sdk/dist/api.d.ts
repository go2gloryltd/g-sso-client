import { G2GConfig, AuthResponse, G2GSession } from './types';
export declare class G2GAPI {
    private config;
    private apiUrl;
    constructor(config: G2GConfig);
    /**
     * Get authentication challenge
     */
    getChallenge(address: string, chainType: string): Promise<{
        message: string;
        nonce: string;
    }>;
    /**
     * Verify signature and get JWT token
     */
    verifySignature(address: string, signature: string, nonce: string, chainType: string): Promise<AuthResponse>;
    /**
     * Validate existing token
     */
    validateToken(token: string): Promise<{
        valid: boolean;
        user?: any;
    }>;
    /**
     * Get auth status
     */
    getStatus(token: string): Promise<{
        authenticated: boolean;
        user?: any;
    }>;
    /**
     * Logout
     */
    logout(token: string): Promise<void>;
    /**
     * Refresh token
     */
    refreshToken(token: string): Promise<{
        token: string;
    }>;
    /**
     * OAuth redirect flow
     */
    startOAuthFlow(): void;
    /**
     * Exchange OAuth code for token
     */
    exchangeCode(code: string): Promise<AuthResponse>;
    /**
     * Generate random state for OAuth
     */
    private generateState;
    /**
     * Verify OAuth state
     */
    verifyState(state: string): boolean;
}
/**
 * Session storage helper
 */
export declare class SessionManager {
    private static STORAGE_KEY;
    static saveSession(session: G2GSession): void;
    static getSession(): G2GSession | null;
    static clearSession(): void;
    static isSessionValid(): boolean;
}
