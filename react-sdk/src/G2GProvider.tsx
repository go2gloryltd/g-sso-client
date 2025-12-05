// src/G2GProvider.tsx

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { G2GConfig, G2GContextValue, G2GUser, LoginOptions, WalletProvider, WalletInfo } from './types';
import { G2GAPI, SessionManager } from './api';
import { detectWallets } from './wallets/detector';

export const G2GContext = createContext<G2GContextValue | null>(null);

interface G2GProviderProps {
  config: G2GConfig;
  children: ReactNode;
}

export const G2GProvider: React.FC<G2GProviderProps> = ({ config, children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<G2GUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const api = new G2GAPI(config);

  useEffect(() => {
    const persistence = config.sessionPersistence || 'local';
    SessionManager.configure(persistence);
  }, [config.sessionPersistence]);

  useEffect(() => {
    const loadWallets = async () => {
      const detected = await detectWallets();
      setWallets(detected);
      const installedCount = detected.filter((w: WalletInfo) => w.installed).length;
      console.log(`Detected ${installedCount} installed wallets`);
    };
    
    loadWallets();
  }, []);

  useEffect(() => {
    const initSession = async () => {
      setLoading(true);

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const oauthError = urlParams.get('error');

      if (oauthError) {
        setError(urlParams.get('error_description') || 'OAuth error');
        setLoading(false);
        return;
      }

      if (code && state) {
        if (!api.verifyState(state)) {
          setError('Invalid OAuth state');
          setLoading(false);
          return;
        }

        try {
          const authResponse = await api.exchangeCode(code);
          
          if (authResponse.authenticated && authResponse.token && authResponse.user) {
            setToken(authResponse.token);
            setUser(authResponse.user);
            setIsAuthenticated(true);

            SessionManager.saveSession({
              token: authResponse.token,
              user: authResponse.user,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              expiresIn: 86400
            });

            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err: any) {
          setError(err.message);
        }

        setLoading(false);
        return;
      }

      const session = SessionManager.getSession();
      if (session) {
        try {
          const validation = await api.validateToken(session.token);
          
          if (validation.valid && validation.user) {
            setToken(session.token);
            setUser(validation.user);
            setIsAuthenticated(true);
          } else {
            SessionManager.clearSession();
          }
        } catch (err) {
          SessionManager.clearSession();
        }
      }

      setLoading(false);
    };

    initSession();
  }, []);

  const login = useCallback(async (options: LoginOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const chainType = options.chainType || 'ethereum';

      if (config.flow === 'redirect') {
        api.startOAuthFlow();
        return;
      }

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Wallet not detected');
      }

      const provider = window.ethereum as WalletProvider;
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      const { message, nonce } = await api.getChallenge(address, chainType);
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address]
      });

      const authResponse = await api.verifySignature(address, signature, nonce, chainType);

      if (authResponse.authenticated && authResponse.token && authResponse.user) {
        setToken(authResponse.token);
        setUser(authResponse.user);
        setIsAuthenticated(true);

        SessionManager.saveSession({
          token: authResponse.token,
          user: authResponse.user,
          expiresAt: authResponse.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          expiresIn: authResponse.expiresIn || 86400
        });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [config]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (token) await api.logout(token);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      SessionManager.clearSession();
      setLoading(false);
    }
  }, [token]);

  const getSession = useCallback(() => SessionManager.getSession(), []);
  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const value: G2GContextValue = {
    isAuthenticated,
    user,
    token,
    loading,
    error,
    config,
    wallets,
    login,
    logout,
    getSession,
    openModal,
    closeModal
  };

  return (
    <G2GContext.Provider value={value}>
      {children}
    </G2GContext.Provider>
  );
};