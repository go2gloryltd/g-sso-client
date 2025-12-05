// src/api.ts

import { G2GConfig, AuthResponse, G2GSession } from './types';

export class G2GAPI {
  private config: G2GConfig;
  private apiUrl: string;

  constructor(config: G2GConfig) {
    this.config = config;
    this.apiUrl = config.apiUrl || 'http://localhost:3001';
  }

  async getChallenge(address: string, chainType: string): Promise<{ message: string; nonce: string }> {
    const response = await fetch(`${this.apiUrl}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, chainType, client_id: this.config.clientId, redirect_uri: this.config.redirectUri })
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to get challenge');
    return response.json();
  }

  async verifySignature(address: string, signature: string, nonce: string, chainType: string): Promise<AuthResponse> {
    const response = await fetch(`${this.apiUrl}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature, nonce, chainType })
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Verification failed');
    return response.json();
  }

  async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    const response = await fetch(`${this.apiUrl}/auth/validate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return response.ok ? response.json() : { valid: false };
  }

  async getStatus(token: string): Promise<{ authenticated: boolean; user?: any }> {
    const response = await fetch(`${this.apiUrl}/auth/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok ? response.json() : { authenticated: false };
  }

  async logout(token: string): Promise<void> {
    await fetch(`${this.apiUrl}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    const response = await fetch(`${this.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Token refresh failed');
    return response.json();
  }

  startOAuthFlow(): void {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri || window.location.origin + '/callback',
      state: this.generateState()
    });
    window.location.href = `${this.apiUrl}/oauth/authorize?${params.toString()}`;
  }

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
    if (!response.ok) throw new Error((await response.json()).error_description || 'Token exchange failed');
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

  private generateState(): string {
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('g2g_oauth_state', state);
    return state;
  }

  verifyState(state: string): boolean {
    const storedState = sessionStorage.getItem('g2g_oauth_state');
    sessionStorage.removeItem('g2g_oauth_state');
    return state === storedState;
  }
}

export class SessionManager {
  private static STORAGE_KEY = 'g2g_session';
  private static storageType: 'local' | 'session' | 'memory' = 'local';
  private static memoryStorage: G2GSession | null = null;

  static configure(type: 'local' | 'session' | 'memory') {
    this.storageType = type;
  }

  static saveSession(session: G2GSession): void {
    if (this.storageType === 'memory') {
      this.memoryStorage = session;
      return;
    }
    const storage = this.storageType === 'local' ? localStorage : sessionStorage;
    storage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  static getSession(): G2GSession | null {
    if (this.storageType === 'memory') {
      return this.memoryStorage;
    }
    const storage = this.storageType === 'local' ? localStorage : sessionStorage;
    const data = storage.getItem(this.STORAGE_KEY);
    if (!data) return null;
    try {
      const session: G2GSession = JSON.parse(data);
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
    if (this.storageType === 'memory') {
      this.memoryStorage = null;
      return;
    }
    const storage = this.storageType === 'local' ? localStorage : sessionStorage;
    storage.removeItem(this.STORAGE_KEY);
  }

  static isSessionValid(): boolean {
    return this.getSession() !== null;
  }
}