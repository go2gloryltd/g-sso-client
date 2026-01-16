// src/index.ts - Main Entry Point with Browser Exports

// Core SDK
export { G2GDAO as GSSO } from './core/G2GDAO';
export { G2GDAO } from './core/G2GDAO';
export { ApiClient } from './core/ApiClient';
export { WalletDetector } from './core/WalletDetector';
export { WalletConnector } from './core/WalletConnector';

// React Components (for browser UMD build)
export { ConnectWallet } from './components/ConnectWallet';
export { WalletAuthModal } from './components/WalletAuthModal';
export { MobileAuth } from './components/MobileAuth';

// Types
export * from './types';

// Default export for CDN usage
import { G2GDAO } from './core/G2GDAO';
import { ConnectWallet } from './components/ConnectWallet';
import { WalletAuthModal } from './components/WalletAuthModal';
import { MobileAuth } from './components/MobileAuth';

export default {
  GSSO: G2GDAO,
  G2GDAO,
  ConnectWallet,
  WalletAuthModal,
  MobileAuth
};