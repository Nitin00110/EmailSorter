import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile } from '@/types';
import { profileApi } from '@/services/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  connectionError: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for when backend is unavailable
const demoUser: UserProfile = {
  email: 'demo@example.com',
  name: 'Demo User',
  age: 28,
  gender: 'Male',
  phoneNumber: '+1 555-0123',
  workingIn: 'Software Engineering',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  const refreshUser = async () => {
    try {
      const profile = await profileApi.getProfile();
      setUser(profile);
      setConnectionError(false);
    } catch (error) {
      setUser(null);
      // Check if it's a connection error (network error or CORS)
      if (axios.isAxiosError(error) && (!error.response || error.code === 'ERR_NETWORK')) {
        setConnectionError(true);
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const logout = () => {
    setUser(null);
    window.location.reload();
  };

  const enableDemoMode = () => {
    setUser(demoUser);
    setConnectionError(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        connectionError,
        login,
        logout,
        refreshUser,
        enableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Import axios for error checking
import axios from 'axios';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
