import { EventEmitter } from '../core/EventEmitter';
import { ApiClient } from '../core/ApiClient';
import { WalletDetector } from '../core/WalletDetector';
import { WalletConnector } from '../core/WalletConnector';
import { G2GDAOConfig, WalletInfo, ChainType, User } from '../types';

export class ModalManager extends EventEmitter {
  private config: G2GDAOConfig;
  private apiClient: ApiClient;
  private modalElement: HTMLElement | null = null;
  private isOpen: boolean = false;
  private wallets: WalletInfo[] = [];
  private qrSession: any = null;
  private websocket: WebSocket | null = null;
  private pollingInterval: number | null = null;

  constructor(config: G2GDAOConfig) {
    super();
    this.config = config;
    this.apiClient = new ApiClient(config.apiUrl, config.clientId, config.clientSecret);
  }

  async open(options?: { wallet?: string; chain?: ChainType }): Promise<void> {
    if (this.isOpen) return;

    this.emit('opened');
    this.isOpen = true;

    // Detect wallets
    this.wallets = await WalletDetector.detectAll(this.config.chains);

    // Create modal
    this.createModal();

    // Check if specific wallet requested
    if (options?.wallet) {
      const wallet = this.wallets.find(w => w.id === options.wallet);
      if (wallet && wallet.installed) {
        await this.connectWallet(wallet);
        return;
      }
    }

    // Auto-select if only one wallet installed
    const installed = this.wallets.filter(w => w.installed);
    if (installed.length === 1) {
      setTimeout(() => this.connectWallet(installed[0]), 100);
      return;
    }

    // Show QR code by default
    await this.initializeQRSession();
  }

  close(): void {
    if (!this.isOpen) return;

    this.emit('closed');
    this.isOpen = false;

    // Cleanup
    if (this.modalElement) {
      document.body.removeChild(this.modalElement);
      this.modalElement = null;
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  destroy(): void {
    this.close();
    this.removeAllListeners();
  }

  private createModal(): void {
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'g2gdao-modal';
    modal.innerHTML = this.getModalHTML();
    
    // Apply styles
    this.applyStyles(modal);

    document.body.appendChild(modal);
    this.modalElement = modal;

    // Setup event listeners
    this.setupModalEventListeners();
  }

  private getModalHTML(): string {
    const installedWallets = this.wallets.filter(w => w.installed);
    const popularWallets = this.wallets.filter(w => w.popular);

    return `
      <div class="g2gdao-overlay">
        <div class="g2gdao-modal-container">
          <div class="g2gdao-modal-header">
            <div class="g2gdao-modal-title">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2300d4ff'/%3E%3Ctext x='50' y='65' font-size='50' text-anchor='middle' fill='white' font-weight='bold'%3EG%3C/text%3E%3C/svg%3E" 
                   alt="G2GDAO" 
                   class="g2gdao-logo" />
              <span>Go2Glory</span>
            </div>
            <button class="g2gdao-close-btn" id="g2gdao-close">×</button>
          </div>

          <div class="g2gdao-modal-body">
            <div id="g2gdao-content">
              <!-- Loading state -->
              <div id="g2gdao-loading" class="g2gdao-state">
                <div class="g2gdao-spinner"></div>
                <p>Initializing...</p>
              </div>

              <!-- QR Code + Wallet Selection -->
              <div id="g2gdao-qr-view" class="g2gdao-state" style="display:none;">
                <div class="g2gdao-qr-container">
                  <div class="g2gdao-qr-code-wrapper">
                    <canvas id="g2gdao-qr-canvas"></canvas>
                  </div>
                  <div class="g2gdao-wallet-list">
                    ${installedWallets.length > 0 ? `
                      <div class="g2gdao-section-title">Ready to Connect</div>
                      ${installedWallets.slice(0, 2).map(w => `
                        <button class="g2gdao-wallet-btn" data-wallet-id="${w.id}">
                          <span class="g2gdao-wallet-icon">${w.icon}</span>
                          <div class="g2gdao-wallet-info">
                            <div class="g2gdao-wallet-name">${w.name}</div>
                            <div class="g2gdao-wallet-chain">${w.chain}</div>
                          </div>
                          <span class="g2gdao-wallet-status">✓</span>
                        </button>
                      `).join('')}
                    ` : `
                      <div class="g2gdao-section-title">Get a Wallet</div>
                      ${popularWallets.slice(0, 2).map(w => `
                        <a href="${w.downloadUrl}" target="_blank" class="g2gdao-wallet-btn">
                          <span class="g2gdao-wallet-icon">${w.icon}</span>
                          <div class="g2gdao-wallet-info">
                            <div class="g2gdao-wallet-name">${w.name}</div>
                            <div class="g2gdao-wallet-desc">${w.description}</div>
                          </div>
                          <span class="g2gdao-download-icon">↓</span>
                        </a>
                      `).join('')}
                    `}
                  </div>
                </div>
              </div>

              <!-- Connecting state -->
              <div id="g2gdao-connecting" class="g2gdao-state" style="display:none;">
                <div class="g2gdao-spinner"></div>
                <p>Connecting to <span id="g2gdao-wallet-name"></span>...</p>
                <small>Please approve the connection request</small>
              </div>

              <!-- Signing state -->
              <div id="g2gdao-signing" class="g2gdao-state" style="display:none;">
                <div class="g2gdao-spinner"></div>
                <p>Sign the message...</p>
                <small>Please approve in your wallet</small>
              </div>

              <!-- Success state -->
              <div id="g2gdao-success" class="g2gdao-state" style="display:none;">
                <div class="g2gdao-success-icon">✓</div>
                <p class="g2gdao-success-title">Connected!</p>
                <p id="g2gdao-success-address"></p>
              </div>

              <!-- Error state -->
              <div id="g2gdao-error" class="g2gdao-state" style="display:none;">
                <div class="g2gdao-error-icon">✗</div>
                <p class="g2gdao-error-title">Error</p>
                <p id="g2gdao-error-message"></p>
                <button id="g2gdao-retry-btn" class="g2gdao-btn">Try Again</button>
              </div>
            </div>
          </div>

          <div class="g2gdao-modal-footer">
            Protected by <span class="g2gdao-badge">go2glory.eth</span>
          </div>
        </div>
      </div>
    `;
  }

  private applyStyles(modal: HTMLElement): void {
    const style = document.createElement('style');
    style.textContent = `
      #g2gdao-modal * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .g2gdao-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: g2gdao-fadeIn 0.2s ease-out;
      }

      @keyframes g2gdao-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .g2gdao-modal-container {
        background: ${this.config.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
        border-radius: 16px;
        width: 440px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        animation: g2gdao-slideUp 0.3s ease-out;
        border: 1px solid ${this.config.theme === 'dark' ? '#333' : '#e0e0e0'};
      }

      @keyframes g2gdao-slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .g2gdao-modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid ${this.config.theme === 'dark' ? '#333' : '#e0e0e0'};
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .g2gdao-modal-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 18px;
        font-weight: bold;
        color: ${this.config.theme === 'dark' ? '#ffffff' : '#000000'};
      }

      .g2gdao-logo {
        width: 32px;
        height: 32px;
      }

      .g2gdao-close-btn {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: ${this.config.theme === 'dark' ? '#999' : '#666'};
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .g2gdao-close-btn:hover {
        background: ${this.config.theme === 'dark' ? '#333' : '#f0f0f0'};
        color: ${this.config.theme === 'dark' ? '#ffffff' : '#000000'};
      }

      .g2gdao-modal-body {
        padding: 20px;
        max-height: 500px;
        overflow-y: auto;
      }

      .g2gdao-state {
        text-align: center;
        color: ${this.config.theme === 'dark' ? '#ffffff' : '#000000'};
      }

      .g2gdao-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid ${this.config.theme === 'dark' ? '#333' : '#e0e0e0'};
        border-top-color: #00d4ff;
        border-radius: 50%;
        animation: g2gdao-spin 0.8s linear infinite;
        margin: 0 auto 16px;
      }

      @keyframes g2gdao-spin {
        to { transform: rotate(360deg); }
      }

      .g2gdao-qr-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .g2gdao-qr-code-wrapper {
        background: white;
        padding: 16px;
        border-radius: 12px;
        border: 2px solid #00d4ff;
      }

      #g2gdao-qr-canvas {
        width: 100%;
        height: auto;
      }

      .g2gdao-wallet-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .g2gdao-section-title {
        font-size: 11px;
        font-weight: bold;
        color: ${this.config.theme === 'dark' ? '#999' : '#666'};
        text-transform: uppercase;
        margin-bottom: 4px;
      }

      .g2gdao-wallet-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid ${this.config.theme === 'dark' ? '#333' : '#e0e0e0'};
        border-radius: 8px;
        background: ${this.config.theme === 'dark' ? '#222' : '#f9f9f9'};
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        color: inherit;
      }

      .g2gdao-wallet-btn:hover {
        border-color: #00d4ff;
        background: ${this.config.theme === 'dark' ? '#2a2a2a' : '#f0f0f0'};
      }

      .g2gdao-wallet-icon {
        font-size: 24px;
      }

      .g2gdao-wallet-info {
        flex: 1;
        text-align: left;
      }

      .g2gdao-wallet-name {
        font-size: 14px;
        font-weight: 600;
        color: ${this.config.theme === 'dark' ? '#ffffff' : '#000000'};
      }

      .g2gdao-wallet-chain,
      .g2gdao-wallet-desc {
        font-size: 11px;
        color: ${this.config.theme === 'dark' ? '#999' : '#666'};
        text-transform: capitalize;
      }

      .g2gdao-wallet-status {
        color: #00ff00;
        font-size: 12px;
      }

      .g2gdao-download-icon {
        color: #00d4ff;
        font-size: 18px;
      }

      .g2gdao-success-icon {
        width: 64px;
        height: 64px;
        background: #00ff00;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        color: white;
        margin: 0 auto 16px;
      }

      .g2gdao-success-title {
        font-size: 24px;
        font-weight: bold;
        color: #00ff00;
        margin-bottom: 8px;
      }

      .g2gdao-error-icon {
        width: 64px;
        height: 64px;
        background: #ff4444;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        color: white;
        margin: 0 auto 16px;
      }

      .g2gdao-error-title {
        font-size: 24px;
        font-weight: bold;
        color: #ff4444;
        margin-bottom: 8px;
      }

      .g2gdao-btn {
        background: #00d4ff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 16px;
        transition: all 0.2s;
      }

      .g2gdao-btn:hover {
        background: #00b8e6;
      }

      .g2gdao-modal-footer {
        padding: 12px 20px;
        border-top: 1px solid ${this.config.theme === 'dark' ? '#333' : '#e0e0e0'};
        text-align: center;
        font-size: 11px;
        color: ${this.config.theme === 'dark' ? '#999' : '#666'};
      }

      .g2gdao-badge {
        display: inline-block;
        padding: 4px 8px;
        background: linear-gradient(135deg, #00d4ff, #0099cc);
        color: white;
        border-radius: 4px;
        font-weight: 600;
        margin-left: 4px;
      }
    `;
    
    modal.appendChild(style);
  }

  private setupModalEventListeners(): void {
    if (!this.modalElement) return;

    // Close button
    const closeBtn = this.modalElement.querySelector('#g2gdao-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Close on overlay click
    const overlay = this.modalElement.querySelector('.g2gdao-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }

    // Wallet buttons
    const walletBtns = this.modalElement.querySelectorAll('[data-wallet-id]');
    walletBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const walletId = btn.getAttribute('data-wallet-id');
        const wallet = this.wallets.find(w => w.id === walletId);
        if (wallet) {
          await this.connectWallet(wallet);
        }
      });
    });

    // Retry button
    const retryBtn = this.modalElement.querySelector('#g2gdao-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.showState('qr-view');
        this.initializeQRSession();
      });
    }
  }

  private async connectWallet(wallet: WalletInfo): Promise<void> {
    try {
      this.showState('connecting');
      const nameEl = this.modalElement?.querySelector('#g2gdao-wallet-name');
      if (nameEl) nameEl.textContent = wallet.name;

      // Connect to wallet
      const address = await WalletConnector.connect(wallet);
      this.emit('wallet:connected', address);

      this.showState('signing');

      // Get challenge
      const { message, nonce } = await this.apiClient.getChallenge(address, wallet.chain);

      // Sign message
      const signature = await WalletConnector.signMessage(wallet, message);

      // Verify signature
      const response = await this.apiClient.verifySignature(
        address,
        signature,
        nonce,
        wallet.chain
      );

      if (response.authenticated) {
        this.showSuccess(response.user, address);
        
        // Emit authenticated event
        this.emit('authenticated', {
          user: response.user,
          token: response.token,
          expiresAt: response.expiresAt,
          wallet: wallet.id
        });

        // Close modal after 2 seconds
        setTimeout(() => this.close(), 2000);
      }

    } catch (error: any) {
      console.error('Wallet connection error:', error);
      this.showError(error.message || 'Connection failed');
      this.emit('error', error);
    }
  }

  private async initializeQRSession(): Promise<void> {
    try {
      this.qrSession = await this.apiClient.initQRSession();
      this.showState('qr-view');
      this.renderQRCode(this.qrSession.authUrl);
      
      // Connect WebSocket for real-time updates
      this.connectWebSocket(this.qrSession.sessionId);
      
      // Start polling as fallback
      this.startPolling(this.qrSession.sessionId);
      
    } catch (error: any) {
      console.error('QR initialization error:', error);
      this.showError('Failed to initialize QR code');
    }
  }

  private renderQRCode(url: string): void {
    const canvas = this.modalElement?.querySelector('#g2gdao-qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Use a simple QR code library or generate manually
    // For now, we'll use a placeholder
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 200;

    // Simple QR code placeholder (in production, use qrcode library)
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Scan with', 100, 90);
    ctx.fillText('Mobile Wallet', 100, 110);
  }

  private connectWebSocket(sessionId: string): void {
    try {
      const wsUrl = this.config.apiUrl
        .replace('http://', 'ws://')
        .replace('https://', 'wss://');
      
      this.websocket = new WebSocket(`${wsUrl}/ws/auth?sessionId=${sessionId}`);

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'auth_success') {
            this.showSuccess(data.user, data.user.address);
            
            this.emit('authenticated', {
              user: data.user,
              token: data.token,
              expiresAt: data.user.joinedAt,
              wallet: 'mobile'
            });

            setTimeout(() => this.close(), 2000);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      this.websocket.onerror = () => {
        console.warn('WebSocket error, using polling fallback');
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  private startPolling(sessionId: string): void {
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await this.apiClient.checkQRStatus(sessionId);
        
        if (response.status === 'completed') {
          if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
          }

          this.showSuccess(response.user, response.user.address);
          
          this.emit('authenticated', {
            user: response.user,
            token: response.token,
            expiresAt: response.completedAt,
            wallet: 'mobile'
          });

          setTimeout(() => this.close(), 2000);
          
        } else if (response.status === 'expired') {
          if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
          }
          this.showError('QR code expired');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  }

  private showState(state: string): void {
    if (!this.modalElement) return;

    const states = this.modalElement.querySelectorAll('.g2gdao-state');
    states.forEach(s => {
      (s as HTMLElement).style.display = 'none';
    });

    const targetState = this.modalElement.querySelector(`#g2gdao-${state}`);
    if (targetState) {
      (targetState as HTMLElement).style.display = 'block';
    }
  }

  private showSuccess(user: User, address: string): void {
    this.showState('success');
    const addressEl = this.modalElement?.querySelector('#g2gdao-success-address');
    if (addressEl) {
      addressEl.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
  }

  private showError(message: string): void {
    this.showState('error');
    const messageEl = this.modalElement?.querySelector('#g2gdao-error-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }
}