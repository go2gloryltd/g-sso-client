// src/react.tsx - React Integration for G-SSO SDK
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { G2GDAO, GSSO } from './core/G2GDAO';
import type { GSSORConfig, User, Session, LoginOptions } from './types';

// Import React Components
import { ConnectWallet } from './components/ConnectWallet';
import { WalletAuthModal } from './components/WalletAuthModal';
import { MobileAuth } from './components/MobileAuth';

// ============================================================================
// CONTEXT
// ============================================================================

export interface GSSORContextValue {
  sdk: G2GDAO | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (options?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getSession: () => Session | null;
}

const GSSORContext = createContext<GSSORContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export interface GSSORProviderProps {
  config: GSSORConfig;
  children: ReactNode;
}

export function GSSORProvider({ config, children }: GSSORProviderProps) {
  const [sdk] = useState(() => GSSO.init(config));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Setup event listeners
    const handleAuthenticated = (authenticatedUser: User) => {
      setUser(authenticatedUser);
      setIsLoading(false);
      setError(null);
    };

    const handleLogout = () => {
      setUser(null);
      setIsLoading(false);
    };

    const handleError = (err: Error) => {
      console.error('GSSO Error:', err);
      setError(err.message);
      setIsLoading(false);
    };

    sdk.on('authenticated', handleAuthenticated);
    sdk.on('logout', handleLogout);
    sdk.on('error', handleError);

    // Check for existing session
    const initializeSession = async () => {
      try {
        const session = await sdk.getSession();
        if (session) {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setError(err instanceof Error ? err.message : 'Session init failed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    // Cleanup
    return () => {
      sdk.off('authenticated', handleAuthenticated);
      sdk.off('logout', handleLogout);
      sdk.off('error', handleError);
    };
  }, [sdk]);

  const login = async (options?: LoginOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.login(options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await sdk.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAll = async () => {
    setIsLoading(true);
    try {
      await sdk.logoutAll();
    } catch (err) {
      console.error('Logout all error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      await sdk.refreshToken();
    } catch (err) {
      console.error('Token refresh error:', err);
      setError(err instanceof Error ? err.message : 'Token refresh failed');
    }
  };

  const getSession = (): Session | null => {
    return user ? {
      user,
      token: sdk.getToken() || '',
      expiresAt: '',
      isActive: true
    } : null;
  };

  const value: GSSORContextValue = {
    sdk,
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    logout,
    logoutAll,
    refreshToken,
    getSession
  };

  return (
    <GSSORContext.Provider value={value}>
      {children}
    </GSSORContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useGSSO(): GSSORContextValue {
  const context = useContext(GSSORContext);
  
  if (!context) {
    throw new Error('useGSSO must be used within GSSORProvider');
  }
  
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Named exports
export { ConnectWallet, WalletAuthModal, MobileAuth };
export { G2GDAO, GSSO };

// Default export - Use 'as any' to avoid private name errors
export default {
  GSSORProvider,
  useGSSO,
  ConnectWallet,
  WalletAuthModal,
  MobileAuth,
  G2GDAO,
  GSSO
} as any;