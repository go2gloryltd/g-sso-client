import React from 'react';
interface G2GButtonProps {
    onSuccess?: () => void;
    onErrorCallback?: (error: string) => void;
    loginText?: string;
    logoutText?: string;
    loadingText?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    onClick?: () => void;
}
export declare const G2GButton: React.FC<G2GButtonProps>;
export {};
