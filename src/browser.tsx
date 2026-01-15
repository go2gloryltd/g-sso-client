// src/browser.tsx - Browser bundle entry point
import { G2GDAO } from './core/G2GDAO';
import { WalletDetector } from './core/WalletDetector';
import { WalletConnector } from './core/WalletConnector';
import { ApiClient } from './core/ApiClient';
import { WalletAuthModal } from './components/WalletAuthModal';

// Export everything as named exports (no default export)
export {
  G2GDAO,
  WalletDetector,
  WalletConnector,
  ApiClient,
  WalletAuthModal
};

// Expose to window for UMD bundle
if (typeof window !== 'undefined') {
  (window as any).G2GDAO = {
    G2GDAO,
    WalletDetector,
    WalletConnector,
    ApiClient,
    WalletAuthModal
  };
}