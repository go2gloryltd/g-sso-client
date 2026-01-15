import { WalletInfo, ChainType } from '../types';

export class WalletConnector {
  private static async connectEthereum(provider: any): Promise<string> {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  }

  private static async connectSolana(provider: any): Promise<string> {
    try {
      const response = await provider.connect();
      return response.publicKey.toString();
    } catch (err: any) {
      if (err.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw err;
    }
  }

  private static async connectBitcoin(provider: any): Promise<string> {
    const accounts = await provider.requestAccounts();
    return accounts[0].address;
  }

  private static async connectPolkadot(provider: any): Promise<string> {
    const extension = await provider.enable();
    const accounts = await extension.accounts.get();
    return accounts[0].address;
  }

  private static async connectCardano(provider: any): Promise<string> {
    const api = await provider.enable();
    const addresses = await api.getUsedAddresses();
    return addresses[0];
  }

  static async connect(wallet: WalletInfo): Promise<string> {
    if (!wallet.installed || !wallet.provider) {
      throw new Error(`${wallet.name} is not installed. Please install it first.`);
    }

    try {
      switch (wallet.chain) {
        case 'ethereum': 
          return await this.connectEthereum(wallet.provider);
        case 'solana': 
          return await this.connectSolana(wallet.provider);
        case 'bitcoin': 
          return await this.connectBitcoin(wallet.provider);
        case 'polkadot': 
          return await this.connectPolkadot(wallet.provider);
        case 'cardano': 
          return await this.connectCardano(wallet.provider);
        default: 
          throw new Error('Unsupported blockchain');
      }
    } catch (err: any) {
      console.error(`${wallet.name} connection error:`, err);
      throw err;
    }
  }

  static async signMessage(wallet: WalletInfo, message: string): Promise<string> {
    if (!wallet.provider) throw new Error('Provider not available');

    try {
      switch (wallet.chain) {
        case 'ethereum': {
          const address = await this.connectEthereum(wallet.provider);
          return await wallet.provider.request({
            method: 'personal_sign',
            params: [message, address]
          });
        }
        
        case 'solana': {
          const encodedMessage = new TextEncoder().encode(message);
          const signedMessage = await wallet.provider.signMessage(encodedMessage, 'utf8');
          
          
          if (!signedMessage || !signedMessage.signature) {
            throw new Error('Signature failed - no signature returned');
          }
          const signatureBytes = Array.from(signedMessage.signature) as number[];
          const signature = signatureBytes
            .map((byte: number) => byte.toString(16).padStart(2, '0'))
            .join('');
          return signature;
        }
        
        case 'bitcoin': {
          return await wallet.provider.signMessage(message);
        }
        
        case 'polkadot': {
          const extension = await wallet.provider.enable();
          const accounts = await extension.accounts.get();
          const signature = await extension.signer.signRaw({
            address: accounts[0].address,
            data: message,
            type: 'bytes'
          });
          return signature.signature;
        }
        
        case 'cardano': {
          const api = await wallet.provider.enable();
          const addresses = await api.getUsedAddresses();
          const sig = await api.signData(addresses[0], message);
          return sig.signature;
        }
        
        default:
          throw new Error('Unsupported blockchain');
      }
    } catch (error: any) {
      console.error(`❌ ${wallet.name} signature error:`, error);
      
      if (error.code === 4001 || error.message?.includes('rejected')) {
        throw new Error('Signature request rejected');
      }
      
      if (error.message?.includes('User rejected')) {
        throw new Error('You rejected the signature request');
      }
      
      throw error;
    }
  }

  static generateDeepLink(wallet: WalletInfo, currentUrl?: string): string {
    if (!wallet.mobileDeepLink) return currentUrl || window.location.href;
    const url = currentUrl || window.location.href;
    return wallet.mobileDeepLink + encodeURIComponent(url);
  }
}