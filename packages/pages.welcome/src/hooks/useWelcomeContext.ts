import React from 'react';
import { WelcomeContext } from '../model/WelcomeContext';

export const useWelcomeContext = () => {
  const context = React.useContext(WelcomeContext);
  if (!context) {
    throw new Error('useWelcomeContext must be used within WelcomeProvider');
  }
  return context;
};
