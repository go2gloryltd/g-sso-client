// src/api.ts

import { G2GConfig, AuthResponse, G2GSession } from './types';

export class G2GAPI {
  private config: G2GConfig;
  private apiUrl: string;

  constructor(config: G2GConfig) {
    this.config = config;
    this.apiUrl = config.apiUrl || 'http://localhost:3001';
  }

  /**
   * Get authentication challenge
   */
  async getChallenge(address: string, chainType: string): Promise<{ message: string; nonce: string }> {
    const response = await fetch(`${this.apiUrl}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        chainType,
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get challenge');
    }

    return response.json();
  }

  /**
   * Verify signature and get JWT token
   */
  async verifySignature(
    address: string,
    signature: string,
    nonce: string,
    chainType: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${this.apiUrl}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        signature,
        nonce,
        chainType
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Verification failed');
    }

    return response.json();
  }

  /**
   * Validate existing token
   */
  async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    const response = await fetch(`${this.apiUrl}/auth/validate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      return { valid: false };
    }

    return response.json();
  }

  /**
   * Get auth status
   */
  async getStatus(token: string): Promise<{ authenticated: boolean; user?: any }> {
    const response = await fetch(`${this.apiUrl}/auth/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return { authenticated: false };
    }

    return response.json();
  }

  /**
   * Logout
   */
  async logout(token: string): Promise<void> {
    await fetch(`${this.apiUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Refresh token
   */
  async refreshToken(token: string): Promise<{ token: string }> {
    const response = await fetch(`${this.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  /**
   * OAuth redirect flow
   */
  startOAuthFlow(): void {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri || window.location.origin + '/callback',
      state: this.generateState()
    });

    window.location.href = `${this.apiUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange OAuth code for token
   */
  async exchangeCode(code: string): Promise<AuthResponse> {
    const response = await fetch(`${this.apiUrl}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri || window.location.origin + '/callback'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    const data = await response.json();
    
    return {
      authenticated: true,
      token: data.access_token,
      user: {
        address: data.wallet_address,
        chainType: data.chain_type,
        points: 0,
        tier: 'Bronze',
        joinedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate random state for OAuth
   */
  private generateState(): string {
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('g2g_oauth_state', state);
    return state;
  }

  /**
   * Verify OAuth state
   */
  verifyState(state: string): boolean {
    const storedState = sessionStorage.getItem('g2g_oauth_state');
    sessionStorage.removeItem('g2g_oauth_state');
    return state === storedState;
  }
}

/**
 * Session storage helper
 */
export class SessionManager {
  private static STORAGE_KEY = 'g2g_session';

  static saveSession(session: G2GSession): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  static getSession(): G2GSession | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return null;

    try {
      const session: G2GSession = JSON.parse(data);
      
      // Check if expired
      if (new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static isSessionValid(): boolean {
    return this.getSession() !== null;
  }
}