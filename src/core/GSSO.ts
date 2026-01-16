// src/core/G2GDAO.ts - Complete SDK Class (Keep this filename!)
import { EventEmitter } from './EventEmitter';
import { ApiClient } from './ApiClient';
import { ModalManager } from '../ui/ModalManager';
import { 
  GSSORConfig, 
  User, 
  Session, 
  ChainType,
  LoginOptions,
  RecentActivity,
  BlockchainProof
} from '../types';

const DEFAULT_CONFIG: Partial<GSSORConfig> = {
  theme: 'dark',
  modalPosition: 'center',
  showVerification: true,
  autoConnect: true,
  sessionStorage: 'localStorage',
  tokenRefreshInterval: 3600000, // 1 hour
  chains: ['ethereum', 'solana', 'bitcoin', 'polkadot', 'cardano'],
  enableQR: true,
  qrSize: 256,
  qrTimeout: 300,
  analytics: false
};

/**
 * Main G2GDAO SDK Class
 * (Aliased as GSSO for external use)
 */
export class G2GDAO extends EventEmitter {
  private config: GSSORConfig;
  private apiClient: ApiClient;
  private modalManager: ModalManager;
  private session: Session | null = null;
  private refreshInterval?: ReturnType<typeof setTimeout>;
  private storageKey: string = 'g2gdao_sso_token';

  constructor(config: GSSORConfig) {
    super();
    
    this.config = { ...DEFAULT_CONFIG, ...config } as GSSORConfig;
    
    if (!this.config.apiUrl) {
      throw new Error('apiUrl is required in G2GDAO config');
    }

    this.apiClient = new ApiClient(
      this.config.apiUrl,
      this.config.clientId,
      this.config.clientSecret
    );

    this.modalManager = new ModalManager(this.config);

    // Setup modal event listeners
    this.setupModalListeners();

    // Auto-connect if enabled
    if (this.config.autoConnect) {
      this.restoreSession();
    }

    // Setup token refresh
    if (this.config.tokenRefreshInterval) {
      this.setupTokenRefresh();
    }
  }

  /**
   * Static factory method
   */
  static init(config: GSSORConfig): G2GDAO {
    return new G2GDAO(config);
  }

  // =========================================================================
  // PUBLIC API METHODS
  // =========================================================================

  /**
   * Open login modal
   */
  async login(options?: LoginOptions): Promise<User> {
    this.trackEvent('login_initiated', options);

    return new Promise((resolve, reject) => {
      const handleAuth = (user: User) => {
        this.off('authenticated', handleAuth);
        this.off('error', handleError);
        resolve(user);
      };

      const handleError = (error: Error) => {
        this.off('authenticated', handleAuth);
        this.off('error', handleError);
        reject(error);
      };

      this.on('authenticated', handleAuth);
      this.on('error', handleError);

      this.modalManager.open(options);
    });
  }

  /**
   * Logout (current session only)
   */
  async logout(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    try {
      await this.apiClient.logout(token);
      this.clearSession();
      this.emit('logout');
      this.trackEvent('logout');
    } catch (error: any) {
      console.error('Logout error:', error);
      this.clearSession();
      this.emit('logout');
    }
  }

  /**
   * Logout from all devices/sites
   */
  async logoutAll(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    try {
      await this.apiClient.logoutAll(token);
      this.clearSession();
      this.emit('logout');
      this.trackEvent('logout_all');
    } catch (error: any) {
      console.error('Logout all error:', error);
      this.clearSession();
      this.emit('logout');
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    if (this.session) {
      const isValid = await this.validateCurrentSession();
      if (isValid) {
        return this.session;
      }
    }

    await this.restoreSession();
    return this.session;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.session !== null && this.getToken() !== null;
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.session?.user || null;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    if (this.session?.token) {
      return this.session.token;
    }
    return this.getStoredToken();
  }

  /**
   * Validate a token
   */
  async validateToken(token?: string): Promise<boolean> {
    const tokenToValidate = token || this.getToken();
    if (!tokenToValidate) return false;

    try {
      const response = await this.apiClient.validateToken(tokenToValidate);
      return response.valid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh current token
   */
  async refreshToken(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token to refresh');
    }

    try {
      const response = await this.apiClient.refreshToken(token);
      
      if (response.success && this.session) {
        this.session.token = response.token;
        this.session.expiresAt = response.expiresAt;
        this.saveSession(this.session);
        this.emit('token:refreshed', { token: response.token });
        this.trackEvent('token_refreshed');
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get recent activity for current user
   */
  async getRecentActivity(limit: number = 20): Promise<RecentActivity[]> {
    const user = this.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const response = await this.apiClient.getRecentActivity(
        user.address,
        user.chainType,
        limit
      );
      return response.activities;
    } catch (error) {
      console.error('Failed to get recent activity:', error);
      return [];
    }
  }

  /**
   * Get blockchain proof/verification
   */
  async getBlockchainProof(): Promise<BlockchainProof> {
    return this.apiClient.getBlockchainProof();
  }

  /**
   * Open modal
   */
  openModal(): void {
    this.modalManager.open();
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.modalManager.close();
  }

  /**
   * Destroy SDK instance
   */
  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.modalManager.destroy();
    this.removeAllListeners();
  }

  // =========================================================================
  // INTERNAL METHODS
  // =========================================================================

  private setupModalListeners(): void {
    this.modalManager.on('opened', () => {
      this.emit('modal:opened');
      this.emit('opened');
    });

    this.modalManager.on('closed', () => {
      this.emit('modal:closed');
      this.emit('closed');
    });

    this.modalManager.on('authenticated', async (data) => {
      try {
        this.session = {
          user: data.user,
          token: data.token,
          expiresAt: data.expiresAt
        };
        this.saveSession(this.session);

        this.emit('authenticated', data.user);
        this.trackEvent('login_success', { 
          chain: data.user.chainType,
          wallet: data.wallet 
        });

        if (this.config.onAuthenticated) {
          this.config.onAuthenticated(data.user);
        }
      } catch (error: any) {
        console.error('Authentication handler error:', error);
        this.emit('error', error);
      }
    });

    this.modalManager.on('error', (error) => {
      this.emit('error', error);
      this.trackEvent('login_failed', { error: error.message });
      
      if (this.config.onError) {
        this.config.onError(error);
      }
    });

    this.modalManager.on('wallet:connected', (address) => {
      this.emit('wallet:connected', address);
      this.trackEvent('wallet_connected', { address });
    });
  }

  private async restoreSession(): Promise<void> {
    const token = this.getStoredToken();
    if (!token) return;

    try {
      const response = await this.apiClient.validateToken(token);
      
      if (response.valid && response.user) {
        this.session = {
          user: response.user,
          token: token,
          expiresAt: response.session?.expiresAt || '',
          lastActivity: response.session?.lastActivity,
          isActive: response.session?.isActive
        };

        this.emit('authenticated', response.user);
        
        if (this.config.onAuthenticated) {
          this.config.onAuthenticated(response.user);
        }
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('Session restore error:', error);
      this.clearSession();
    }
  }

  private async validateCurrentSession(): Promise<boolean> {
    if (!this.session?.token) return false;

    try {
      const response = await this.apiClient.validateToken(this.session.token);
      return response.valid;
    } catch (error) {
      return false;
    }
  }

  private saveSession(session: Session): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.storageKey, session.token);
    }
  }

  private clearSession(): void {
    this.session = null;
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(this.storageKey);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private getStoredToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(this.storageKey) : null;
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    
    switch (this.config.sessionStorage) {
      case 'localStorage':
        return window.localStorage;
      case 'sessionStorage':
        return window.sessionStorage;
      case 'cookie':
        return window.localStorage;
      default:
        return window.localStorage;
    }
  }

  private setupTokenRefresh(): void {
    if (!this.config.tokenRefreshInterval) return;

    this.refreshInterval = setInterval(async () => {
      if (this.isAuthenticated()) {
        try {
          await this.refreshToken();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
        }
      }
    }, this.config.tokenRefreshInterval);
  }

  private trackEvent(event: string, data?: any): void {
    if (this.config.analytics && this.config.onEvent) {
      this.config.onEvent(event, data);
    }
  }
}

// Export as GSSO alias
export const GSSO = G2GDAO;

// Default export
export default G2GDAO;