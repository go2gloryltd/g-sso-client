import { 
  AuthResponse, 
  ChallengeResponse, 
  TokenValidationResponse,
  QRSession,
  RecentActivity,
  BlockchainProof,
  ChainType
} from '../types';

export class ApiClient {
  private baseUrl: string;
  private clientId?: string;
  private clientSecret?: string;

  constructor(baseUrl: string, clientId?: string, clientSecret?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    // Add client credentials if available (only for backend calls)
    if (this.clientSecret && typeof window === 'undefined') {
      headers['X-Client-Secret'] = this.clientSecret;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: response.statusText 
      }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async getChallenge(
    address: string, 
    chainType: ChainType
  ): Promise<ChallengeResponse> {
    return this.request<ChallengeResponse>('/auth/challenge', {
      method: 'POST',
      body: JSON.stringify({ 
        address, 
        chainType,
        client_id: this.clientId 
      })
    });
  }

  async verifySignature(
    address: string,
    signature: string,
    nonce: string,
    chainType: ChainType
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ 
        address, 
        signature, 
        nonce, 
        chainType 
      })
    });
  }

  async validateToken(token: string): Promise<TokenValidationResponse> {
    return this.request<TokenValidationResponse>('/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  async checkAuthStatus(token: string): Promise<TokenValidationResponse> {
    return this.request<TokenValidationResponse>('/auth/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async refreshToken(token: string): Promise<{ success: boolean; token: string; expiresAt: string }> {
    return this.request('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async logout(token: string): Promise<{ success: boolean }> {
    return this.request('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async logoutAll(token: string): Promise<{ success: boolean; sessionsInvalidated: number }> {
    return this.request('/auth/logout-all', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async initQRSession(): Promise<QRSession> {
    return this.request<QRSession>('/auth/qr/init', {
      method: 'POST'
    });
  }

  async checkQRStatus(sessionId: string): Promise<any> {
    return this.request(`/auth/qr/status/${sessionId}`);
  }

  async getRecentActivity(
    address: string, 
    chainType?: ChainType, 
    limit: number = 20
  ): Promise<{ success: boolean; activities: RecentActivity[] }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (chainType) params.append('chainType', chainType);
    
    return this.request(`/wallet/recent-activity/${address}?${params}`);
  }

  async getBlockchainProof(): Promise<BlockchainProof> {
    return this.request('/blockchain/verify');
  }

  async healthCheck(): Promise<any> {
    return this.request('/health');
  }
}