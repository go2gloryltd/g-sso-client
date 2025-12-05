// src/config/icons.ts - NEW FILE

export const WALLET_ICONS: Record<string, string> = {
  'metamask': 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  'coinbase': 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4',
  'rainbow': 'https://avatars.githubusercontent.com/u/48327834?s=200&v=4',
  'phantom': 'https://avatars.githubusercontent.com/u/78782331?s=200&v=4',
  'solflare': 'https://solflare.com/assets/logo.svg',
  'unisat': 'https://unisat.io/favicon.svg',
  'xverse': 'https://www.xverse.app/favicon.svg',
  'subwallet': 'https://avatars.githubusercontent.com/u/81157782?s=200&v=4',
  'eternl': 'https://eternl.io/favicon.svg',
  'nami': 'https://namiwallet.io/favicon.svg'
};

export const CHAIN_ICONS: Record<string, string> = {
  'ethereum': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  'solana': 'https://cryptologos.cc/logos/solana-sol-logo.svg',
  'bitcoin': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
  'polkadot': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg',
  'cardano': 'https://cryptologos.cc/logos/cardano-ada-logo.svg'
};

export const G2GDAO_LOGO = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" rx="8" fill="%238B5CF6"/%3E%3Ctext x="24" y="32" font-size="20" font-weight="bold" text-anchor="middle" fill="white"%3EG2G%3C/text%3E%3C/svg%3E';

export function getWalletIcon(walletId: string): string {
  return WALLET_ICONS[walletId] || FALLBACK_ICON;
}

export function getChainIcon(chainId: string): string {
  return CHAIN_ICONS[chainId] || FALLBACK_ICON;
}

export const FALLBACK_ICON = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238B5CF6"%3E%3Cpath d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/%3E%3C/svg%3E';