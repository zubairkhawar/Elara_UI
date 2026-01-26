'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  businessName: string;
  phoneNumber: string;
  businessType: string;
  serviceHours: string;
  customServiceHours?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('elara_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Replace with actual API call
    const userData = { email, name: email.split('@')[0] };
    localStorage.setItem('elara_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const signup = async (data: SignupData) => {
    // TODO: Replace with actual API call
    const userData = { email: data.email, name: data.businessName };
    localStorage.setItem('elara_user', JSON.stringify(userData));
    localStorage.setItem('elara_business_data', JSON.stringify(data));
    setUser(userData);
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('elara_user');
    localStorage.removeItem('elara_business_data');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const loginWithGoogle = async () => {
    // TODO: Implement Google OAuth
    const userData = { email: 'user@gmail.com', name: 'Google User' };
    localStorage.setItem('elara_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const loginWithApple = async () => {
    // TODO: Implement Apple OAuth
    const userData = { email: 'user@icloud.com', name: 'Apple User' };
    localStorage.setItem('elara_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithApple,
      }}
    >
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
