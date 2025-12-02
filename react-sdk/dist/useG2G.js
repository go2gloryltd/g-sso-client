// src/useG2G.ts
import { useContext } from 'react';
import { G2GContext } from './G2GProvider';
export const useG2G = () => {
    const context = useContext(G2GContext);
    if (!context) {
        throw new Error('useG2G must be used within G2GProvider');
    }
    return context;
};
