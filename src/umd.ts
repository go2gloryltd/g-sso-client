// src/umd.ts - UMD entry point
import { G2GDAO } from './core/G2GDAO';
import { WalletDetector } from './core/WalletDetector';
import { WalletConnector } from './core/WalletConnector';

// Export everything under a single namespace
export { G2GDAO, WalletDetector, WalletConnector };

// Also export G2GDAO as default for convenience
export default G2GDAO;