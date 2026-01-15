import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { G2GDAO } from '../core/G2GDAO';
import { G2GDAOConfig, User, Session } from '../types';

export interface G2GDAOContextValue {
  sdk: G2GDAO | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
export const G2GDAOContext = createContext<G2GDAOContextValue>({
  sdk: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  logoutAll: async () => {},
  refreshToken: async () => {}
});

interface G2GDAOProviderProps {
  config: G2GDAOConfig;
  children: ReactNode;
}

export const G2GDAOProvider: React.FC<G2GDAOProviderProps> = ({ config, children }) => {
  const [sdk] = useState(() => new G2GDAO(config));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Setup event listeners
    const handleAuthenticated = (authenticatedUser: User) => {
      setUser(authenticatedUser);
      setIsLoading(false);
    };

    const handleLogout = () => {
      setUser(null);
      setIsLoading(false);
    };

    const handleError = (error: Error) => {
      console.error('G2GDAO Error:', error);
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
      } catch (error) {
        console.error('Session initialization error:', error);
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

  const login = async () => {
    setIsLoading(true);
    try {
      await sdk.login();
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await sdk.logout();
  };

  const logoutAll = async () => {
    await sdk.logoutAll();
  };

  const refreshToken = async () => {
    await sdk.refreshToken();
  };

  const value: G2GDAOContextValue = {
    sdk,
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    logoutAll,
    refreshToken
  };

  return (
    <G2GDAOContext.Provider value={value}>
      {children}
    </G2GDAOContext.Provider>
  );
};