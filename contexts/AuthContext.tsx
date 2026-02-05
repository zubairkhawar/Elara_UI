'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/utils/api';

interface User {
  email: string;
  name?: string;
  business_name?: string;
  phone_number?: string;
  business_type?: string;
  service_hours?: string;
  custom_service_hours?: string;
  currency?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  updateProfile: (data: Partial<ProfileUpdateData>) => Promise<void>;
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

interface ProfileUpdateData {
  name?: string;
  business_name?: string;
  phone_number?: string;
  business_type?: string;
  service_hours?: string;
  custom_service_hours?: string;
  currency?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function parseSignupError(body: Record<string, unknown>): string {
  const detail = body.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0 && typeof detail[0] === 'string') {
    return detail[0];
  }
  // DRF serializer errors: { email: ["..."], password: ["..."] }
  const parts: string[] = [];
  const fieldLabels: Record<string, string> = {
    email: 'Email',
    password: 'Password',
    name: 'Business name',
    business_name: 'Business name',
    phone_number: 'Phone number',
    business_type: 'Business type',
    service_hours: 'Service hours',
    custom_service_hours: 'Custom service hours',
  };
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
      const label = fieldLabels[key] || key;
      parts.push(`${label}: ${value[0]}`);
    }
  }
  if (parts.length > 0) return parts.join(' ');
  return 'Signup failed. Please check your information and try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Hydrate auth state from localStorage on mount
    const storedUser = typeof window !== 'undefined'
      ? localStorage.getItem('elara_user')
      : null;
    const storedAccess = typeof window !== 'undefined'
      ? localStorage.getItem('elara_access_token')
      : null;

    if (storedUser && storedAccess) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  function parseLoginError(body: Record<string, unknown>): string {
    const detail = body.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0 && typeof detail[0] === 'string') {
      return detail[0];
    }
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  const login = async (email: string, password: string) => {
    const tokenRes = await fetch(`${API_BASE_URL}/api/v1/accounts/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(parseLoginError(errorBody));
    }

    const tokens = await tokenRes.json();

    const meRes = await fetch(`${API_BASE_URL}/api/v1/accounts/me/`, {
      headers: {
        Authorization: `Bearer ${tokens.access}`,
      },
    });

    if (!meRes.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const userData: User = await meRes.json();

    localStorage.setItem('elara_user', JSON.stringify(userData));
    localStorage.setItem('elara_access_token', tokens.access);
    localStorage.setItem('elara_refresh_token', tokens.refresh);

    setUser(userData);
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const signup = async (data: SignupData) => {
    const payload = {
      email: data.email,
      password: data.password,
      name: data.businessName,
      business_name: data.businessName,
      phone_number: data.phoneNumber,
      business_type: data.businessType,
      service_hours: data.serviceHours,
      custom_service_hours: data.customServiceHours,
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/accounts/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({})) as Record<string, unknown>;
      const message = parseSignupError(errorBody);
      throw new Error(message);
    }

    // Do not log in: account is pending until admin activates it.
    // Caller (signup page) will show success message and link to login for later.
  };

  const updateProfile = async (data: Partial<ProfileUpdateData>) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/v1/accounts/me/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message =
        (errorBody && JSON.stringify(errorBody)) || 'Failed to update profile';
      throw new Error(message);
    }

    const updatedUser: User = await res.json();
    localStorage.setItem('elara_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('elara_user');
    localStorage.removeItem('elara_access_token');
    localStorage.removeItem('elara_refresh_token');
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
        updateProfile,
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
