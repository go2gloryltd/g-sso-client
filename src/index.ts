
// Core SDK
export { G2GDAO } from './core/G2GDAO';
export { ApiClient } from './core/ApiClient';
export { WalletDetector } from './core/WalletDetector';
export { WalletConnector } from './core/WalletConnector';

// Components for developers to use
export { ConnectWallet } from './components/ConnectWallet';
export { MobileAuth } from './components/MobileAuth';

// Types
export * from './types';

// Default export for CDN usage
import { G2GDAO } from './core/G2GDAO';
export default G2GDAO;