// src/wallets/detector.ts

import { WalletInfo, ChainType } from '../types';

/**
 * Wallet Registry
 */
const WALLET_REGISTRY: Omit<WalletInfo, 'installed' | 'provider'>[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'MM',
    chain: 'ethereum' as ChainType,
    platforms: 'both',
    color: '#F6851B',
    downloadUrl: 'https://metamask.io/download/',
    providerKey: 'ethereum.isMetaMask',
    description: 'Most popular Ethereum wallet',
    popular: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: 'CB',
    chain: 'ethereum' as ChainType,
    platforms: 'both',
    color: '#0052FF',
    downloadUrl: 'https://www.coinbase.com/wallet/downloads',
    providerKey: 'ethereum.isCoinbaseWallet',
    description: 'Secure wallet by Coinbase',
    popular: true
  },
  {
    id: 'phantom-solana',
    name: 'Phantom',
    icon: 'PH',
    chain: 'solana' as ChainType,
    platforms: 'both',
    color: '#AB9FF2',
    downloadUrl: 'https://phantom.app/download',
    providerKey: 'phantom.solana',
    description: 'Leading Solana wallet',
    popular: true
  }
];

function checkProviderExists(providerKey: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const keys = providerKey.split('.');
  let obj: any = window;
  
  for (const key of keys) {
    if (!obj || !obj[key]) return false;
    obj = obj[key];
  }
  
  return true;
}

function getProvider(providerKey: string): any {
  const keys = providerKey.split('.');
  let obj: any = window;
  
  for (const key of keys) {
    if (!obj || !obj[key]) return null;
    obj = obj[key];
  }
  
  return obj;
}

async function detectEIP6963Wallets(): Promise<WalletInfo[]> {
  const wallets: WalletInfo[] = [];
  
  if (typeof window === 'undefined') return wallets;

  const providers = new Map<string, any>();
  
  const handler = (event: any) => {
    const { detail } = event;
    providers.set(detail.info.uuid, detail);
  };

  window.addEventListener('eip6963:announceProvider', handler);
  window.dispatchEvent(new Event('eip6963:requestProvider'));

  await new Promise(resolve => setTimeout(resolve, 30));
  
  window.removeEventListener('eip6963:announceProvider', handler);

  providers.forEach((detail) => {
    wallets.push({
      id: detail.info.rdns || detail.info.uuid,
      name: detail.info.name,
      icon: detail.info.icon || '',
      chain: 'ethereum' as ChainType,
      platforms: 'both',
      color: '#627EEA',
      providerKey: 'ethereum',
      description: detail.info.description || 'Ethereum wallet',
      installed: true,
      provider: detail.provider
    });
  });

  return wallets;
}

export async function detectWallets(): Promise<WalletInfo[]> {
  const wallets: WalletInfo[] = [];
  const eip6963Providers = await detectEIP6963Wallets();
  
  for (const config of WALLET_REGISTRY) {
    if (config.chain === 'ethereum') {
      const eip6963Match = eip6963Providers.find(w => 
        w.name.toLowerCase().includes(config.name.toLowerCase()) ||
        config.name.toLowerCase().includes(w.name.toLowerCase())
      );

      if (eip6963Match) {
        wallets.push(eip6963Match);
        continue;
      }
    }

    if (config.chain === 'solana') {
      let provider = null;
      let installed = false;

      if (config.id === 'phantom-solana') {
        if ((window as any).phantom?.solana) {
          provider = (window as any).phantom.solana;
          installed = true;
        } else if ((window as any).solana?.isPhantom) {
          provider = (window as any).solana;
          installed = true;
        }
      } else {
        installed = checkProviderExists(config.providerKey);
        provider = installed ? getProvider(config.providerKey) : undefined;
      }

      wallets.push({
        ...config,
        installed,
        provider
      });
      continue;
    }

    const installed = checkProviderExists(config.providerKey);
    wallets.push({
      ...config,
      installed,
      provider: installed ? getProvider(config.providerKey) : undefined
    });
  }

  return wallets;
}

export async function connectEthereum(provider: any): Promise<string> {
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}

export async function connectSolana(provider: any): Promise<string> {
  const response = await provider.connect();
  return response.publicKey.toString();
}
function stringToHex(str: string): string {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return '0x' + hex;
}
export async function signMessage(wallet: WalletInfo, message: string): Promise<string> {
  if (!wallet.provider) throw new Error('Provider not available');

  if (wallet.chain === 'ethereum') {
    const address = await connectEthereum(wallet.provider);
    
    // 💡 FIX 1: Convert the message string to a hex-encoded string.
    // Ethereum's 'personal_sign' often expects the message in hex format.
    const hexMessage = stringToHex(message); 

    return await wallet.provider.request({
      method: 'personal_sign',
      // Note: order is often [hexMessage, address] or [address, hexMessage]
      // Check your wallet's specific implementation, but [hexMessage, address] is standard.
      params: [hexMessage, address]
    });
  }
  
  if (wallet.chain === 'solana') {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await wallet.provider.signMessage(encodedMessage, 'utf8');
    
    // The signature returned is a Uint8Array. This converts it to a hex string.
    return Array.from(signedMessage.signature as Uint8Array)
      .map((byte: number) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  throw new Error('Unsupported chain');
}