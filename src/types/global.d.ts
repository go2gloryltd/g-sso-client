// src/types/global.d.ts

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: {
      solana?: any;
      ethereum?: any;
    };
    solflare?: any;
    backpack?: any;
    coinbaseWallet?: any;
    trustWallet?: any;
    unisat?: any;
    cardano?: any;
    injectedWeb3?: any;
  }
}

// Fix for NodeJS.Timeout in browser environment
declare type Timeout = ReturnType<typeof setTimeout>;

export {};