import { WalletConfig, WalletInfo, ChainType } from '../types';

export const WALLET_REGISTRY: WalletConfig[] = [
  // ETHEREUM
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    chain: 'ethereum',
    platforms: 'both',
    color: '#F6851B',
    downloadUrl: 'https://metamask.io/download/',
    mobileDeepLink: 'https://metamask.app.link/dapp/',
    providerKey: 'ethereum.isMetaMask',
    description: 'Most popular Ethereum wallet',
    popular: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '💙',
    chain: 'ethereum',
    platforms: 'both',
    color: '#0052FF',
    downloadUrl: 'https://www.coinbase.com/wallet/downloads',
    mobileDeepLink: 'https://go.cb-w.com/dapp?cb_url=',
    providerKey: 'ethereum.isCoinbaseWallet',
    description: 'Secure wallet by Coinbase',
    popular: true
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    chain: 'ethereum',
    platforms: 'both',
    color: '#FF6B6B',
    downloadUrl: 'https://rainbow.me/',
    mobileDeepLink: 'https://rnbwapp.com/dapp?url=',
    providerKey: 'ethereum.isRainbow',
    description: 'Beautiful & simple wallet'
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    chain: 'ethereum',
    platforms: 'both',
    color: '#3375BB',
    downloadUrl: 'https://trustwallet.com/download',
    mobileDeepLink: 'trust://open_url?coin_id=60&url=',
    providerKey: 'ethereum.isTrust',
    description: 'Multi-chain support'
  },
  {
    id: 'rabby',
    name: 'Rabby',
    icon: '🐰',
    chain: 'ethereum',
    platforms: 'desktop',
    color: '#8697FF',
    downloadUrl: 'https://rabby.io/',
    providerKey: 'ethereum.isRabby',
    description: 'Multi-chain DeFi wallet'
  },
  
  // SOLANA
  {
    id: 'phantom-solana',
    name: 'Phantom',
    icon: '👻',
    chain: 'solana',
    platforms: 'both',
    color: '#AB9FF2',
    downloadUrl: 'https://phantom.app/download',
    mobileDeepLink: 'https://phantom.app/ul/browse/',
    providerKey: 'phantom.solana',
    description: 'Leading Solana wallet',
    popular: true
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: '🔥',
    chain: 'solana',
    platforms: 'both',
    color: '#FC8D4D',
    downloadUrl: 'https://solflare.com/download',
    mobileDeepLink: 'https://solflare.com/ul/',
    providerKey: 'solflare',
    description: 'Powerful Solana wallet'
  },
  
  // BITCOIN
  {
    id: 'unisat',
    name: 'UniSat',
    icon: '🟠',
    chain: 'bitcoin',
    platforms: 'desktop',
    color: '#EE7A30',
    downloadUrl: 'https://unisat.io/download',
    providerKey: 'unisat',
    description: 'Bitcoin & Ordinals',
    popular: true
  },
  
  // POLKADOT
  {
    id: 'subwallet',
    name: 'SubWallet',
    icon: '🔷',
    chain: 'polkadot',
    platforms: 'both',
    color: '#004BFF',
    downloadUrl: 'https://subwallet.app/download.html',
    mobileDeepLink: 'subwallet://',
    providerKey: 'injectedWeb3.subwallet-js',
    description: 'Comprehensive Polkadot wallet',
    popular: true
  },
  
  // CARDANO
  {
    id: 'eternl',
    name: 'Eternl',
    icon: '♾️',
    chain: 'cardano',
    platforms: 'both',
    color: '#5B2C6F',
    downloadUrl: 'https://eternl.io/app/mainnet/welcome',
    mobileDeepLink: 'eternl://',
    providerKey: 'cardano.eternl',
    description: 'Feature-rich Cardano wallet',
    popular: true
  }
];

export class WalletDetector {
  private static checkProviderExists(providerKey: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const keys = providerKey.split('.');
    let obj: any = window;
    
    for (const key of keys) {
      if (!obj || !obj[key]) return false;
      obj = obj[key];
    }
    
    return true;
  }

  private static getProvider(providerKey: string): any {
  if (typeof window === 'undefined') return null;
  
  const keys = providerKey.split('.');
  let obj: any = window;
  
  // Special case: single-level provider like 'unisat'
  if (keys.length === 1) {
    return obj[keys[0]];  // Return window.unisat directly
  }
  
  // Multi-level: stop BEFORE the last key
  // For 'ethereum.isMetaMask' → walk to 'ethereum', return window.ethereum
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj || !obj[keys[i]]) return null;
    obj = obj[keys[i]];
  }
  
  return obj;
}

  static async detectAll(enabledChains?: ChainType[]): Promise<WalletInfo[]> {
    const wallets: WalletInfo[] = [];
    
    for (const config of WALLET_REGISTRY) {
      // Filter by enabled chains if specified
      if (enabledChains && !enabledChains.includes(config.chain)) {
        continue;
      }

      // Special handling for Phantom (Solana)
      if (config.id === 'phantom-solana') {
        let provider = null;
        let installed = false;

        if ((window as any).phantom?.solana) {
          provider = (window as any).phantom.solana;
          installed = true;
        } else if ((window as any).solana?.isPhantom) {
          provider = (window as any).solana;
          installed = true;
        }

        wallets.push({
          ...config,
          installed,
          provider
        });
        continue;
      }

      const installed = this.checkProviderExists(config.providerKey);
      wallets.push({
        ...config,
        installed,
        provider: installed ? this.getProvider(config.providerKey) : undefined
      });
    }

    return wallets;
  }

  static async detectInstalled(enabledChains?: ChainType[]): Promise<WalletInfo[]> {
    const all = await this.detectAll(enabledChains);
    return all.filter(w => w.installed);
  }

  static getWalletById(walletId: string): WalletConfig | undefined {
    return WALLET_REGISTRY.find(w => w.id === walletId);
  }

  static getWalletsByChain(chain: ChainType): WalletConfig[] {
    return WALLET_REGISTRY.filter(w => w.chain === chain);
  }
}