// src/G2GProvider.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { G2GAPI, SessionManager } from './api';
export const G2GContext = createContext(null);
export const G2GProvider = ({ config, children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const api = new G2GAPI(config);
    /**
     * Initialize - Check for existing session
     */
    useEffect(() => {
        const initSession = async () => {
            setLoading(true);
            // Check for OAuth callback
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
                        // Clean URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                }
                catch (err) {
                    setError(err.message);
                }
                setLoading(false);
                return;
            }
            // Check for existing session
            const session = SessionManager.getSession();
            if (session) {
                try {
                    const validation = await api.validateToken(session.token);
                    if (validation.valid && validation.user) {
                        setToken(session.token);
                        setUser(validation.user);
                        setIsAuthenticated(true);
                    }
                    else {
                        SessionManager.clearSession();
                    }
                }
                catch (err) {
                    SessionManager.clearSession();
                }
            }
            setLoading(false);
        };
        initSession();
    }, []);
    /**
     * Login with wallet
     */
    const login = useCallback(async (options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const chainType = options.chainType || 'ethereum';
            // OAuth redirect flow
            if (config.flow === 'redirect') {
                api.startOAuthFlow();
                return;
            }
            // Popup/Modal flow (direct wallet connection)
            if (typeof window.ethereum === 'undefined') {
                throw new Error('Wallet not detected. Please install MetaMask or another Web3 wallet.');
            }
            const provider = window.ethereum;
            // Request wallet connection
            const accounts = await provider.request({
                method: 'eth_requestAccounts'
            });
            const address = accounts[0];
            // Get challenge
            const { message, nonce } = await api.getChallenge(address, chainType);
            // Sign message
            const signature = await provider.request({
                method: 'personal_sign',
                params: [message, address]
            });
            // Verify signature
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
            else {
                throw new Error('Authentication failed');
            }
        }
        catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [config]);
    /**
     * Logout
     */
    const logout = useCallback(async () => {
        setLoading(true);
        try {
            if (token) {
                await api.logout(token);
            }
        }
        catch (err) {
            console.error('Logout error:', err);
        }
        finally {
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            SessionManager.clearSession();
            setLoading(false);
        }
    }, [token]);
    /**
     * Get current session
     */
    const getSession = useCallback(() => {
        return SessionManager.getSession();
    }, []);
    const value = {
        isAuthenticated,
        user,
        token,
        loading,
        error,
        login,
        logout,
        getSession
    };
    return (React.createElement(G2GContext.Provider, { value: value }, children));
};
