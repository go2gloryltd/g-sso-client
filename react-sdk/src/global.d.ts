// src/global.d.ts

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isPhantom?: boolean;
    isCoinbaseWallet?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
}

export {};