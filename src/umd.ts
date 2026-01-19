// src/umd.ts - UMD entry point for browser <script> tags

// Core SDK
import { G2GDAO as GSSO } from './core/G2GDAO';
import { ApiClient } from './core/ApiClient';
import { WalletDetector } from './core/WalletDetector';
import { WalletConnector } from './core/WalletConnector';

// React Components
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
  
  // React components for browser usage
  ConnectWallet,
  WalletAuthModal,
  MobileAuth,
  
  // Legacy alias (backward compatibility)
  G2GDAO: GSSO
};

export default GSSO_SDK;