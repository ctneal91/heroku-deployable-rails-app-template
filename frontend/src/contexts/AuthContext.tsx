import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, passwordConfirmation: string, name?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar_url?: string; password?: string; password_confirmation?: string }) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const response = await api.getMe();
    if (response.data?.user) {
      setUser(response.data.user);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<string | null> => {
    const response = await api.login(email, password);
    if (response.error) {
      return response.error;
    }
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return null;
  };

  const signup = async (
    email: string,
    password: string,
    passwordConfirmation: string,
    name?: string
  ): Promise<string | null> => {
    const response = await api.signup(email, password, passwordConfirmation, name);
    if (response.error) {
      return response.error;
    }
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return null;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateProfile = async (data: {
    name?: string;
    avatar_url?: string;
    password?: string;
    password_confirmation?: string;
  }): Promise<string | null> => {
    const response = await api.updateProfile(data);
    if (response.error) {
      return response.error;
    }
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
