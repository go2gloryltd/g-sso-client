import React, { ReactNode } from 'react';
import { G2GConfig, G2GContextValue } from './types';
export declare const G2GContext: React.Context<G2GContextValue | null>;
interface G2GProviderProps {
    config: G2GConfig;
    children: ReactNode;
}
export declare const G2GProvider: React.FC<G2GProviderProps>;
export {};
