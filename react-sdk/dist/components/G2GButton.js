// src/components/G2GButton.tsx
import React from 'react';
import { useG2G } from '../useG2G';
export const G2GButton = ({ onSuccess, onErrorCallback, loginText = '🔐 Sign in with G2GDAO', logoutText = 'Logout', loadingText = 'Connecting...', className = '', style, disabled, ...props }) => {
    const { isAuthenticated, loading, login, logout, error } = useG2G();
    const handleClick = async () => {
        try {
            if (isAuthenticated) {
                await logout();
            }
            else {
                await login();
                onSuccess?.();
            }
        }
        catch (err) {
            onErrorCallback?.(err.message);
        }
    };
    const buttonText = loading
        ? loadingText
        : isAuthenticated
            ? logoutText
            : loginText;
    return (React.createElement("button", { onClick: handleClick, disabled: loading || disabled, className: `g2g-button ${className}`, style: style, ...props }, buttonText));
};
