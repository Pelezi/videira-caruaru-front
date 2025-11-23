'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | { setPasswordUrl: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    // This is intentionally done in useEffect to initialize state on mount
    const initUser = authService.getCurrentUser();
    if (initUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(initUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    // If backend returned a setPasswordUrl (user has no password), bubble it up so the UI can redirect.
    if (response && typeof response === 'object' && 'setPasswordUrl' in response) {
      return response as { setPasswordUrl: string };
    }

    // From here, response is an AuthResponse
    const auth = response as unknown as { user: User; permission?: any };
    const mergedUser: User = {
      ...auth.user,
      permission: (auth as any).permission ?? auth.user.permission ?? null,
    };
    setUser(mergedUser);
    authService.setCurrentUser(mergedUser);
    return mergedUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
