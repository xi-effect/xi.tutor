import React from 'react';
import { WelcomeContext } from '../context';

export const useWelcomeContext = () => {
  const context = React.useContext(WelcomeContext);
  if (!context) {
    throw new Error('useAuth must be used within an WelcomeProvider');
  }
  return context;
};
