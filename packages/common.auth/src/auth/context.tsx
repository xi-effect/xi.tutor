import React from 'react';
import { AuthContextT } from './types';

export const AuthContext = React.createContext<AuthContextT | null>(null);
