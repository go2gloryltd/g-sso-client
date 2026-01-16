// src/umd.ts - UMD entry point for browser <script> tags

// Import everything
import { GSSO } from './core/GSSO';
import { ApiClient } from './core/ApiClient';
import { WalletDetector } from './core/WalletDetector';
import { WalletConnector } from './core/WalletConnector';
import { ConnectWallet } from './components/ConnectWallet';
import { WalletAuthModal } from './components/WalletAuthModal';
import { MobileAuth } from './components/MobileAuth';

// Export everything as a single object for UMD
const GSSO_SDK = {
  // Core classes
  GSSO,
  ApiClient,
  WalletDetector,
  WalletConnector,
  
  // React components (for UMD usage)
  ConnectWallet,
  WalletAuthModal,
  MobileAuth,
  
  // Legacy alias (if anyone was using G2GDAO)
  G2GDAO: GSSO
};

// Export ONLY default for UMD
export default GSSO_SDK;