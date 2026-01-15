import { useContext } from 'react';
import { G2GDAOContext } from './G2GDAOProvider';

export const useG2GDAO = () => {
  const context = useContext(G2GDAOContext);
  
  if (!context) {
    throw new Error('useG2GDAO must be used within a G2GDAOProvider');
  }
  
  return context;
};