import React from 'react';
import { WelcomeContextT } from '../types';

export const WelcomeContext = React.createContext<WelcomeContextT | null>(null);
