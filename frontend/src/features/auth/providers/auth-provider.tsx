'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { authApi } from '../api/auth-api';
import type { AuthUser } from '../types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUser: (user: AuthUser) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: AuthUser;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const clinicAdminBase = pathname.match(/^\/([^/]+)\/admin(?:\/|$)/)?.[1];
  const loginPath = clinicAdminBase
    ? `/${encodeURIComponent(clinicAdminBase)}/admin/login`
    : '/admin/login';

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      router.replace(loginPath);
    };
    window.addEventListener('clinic:auth-expired', handleAuthExpired);

    if (initialUser) {
      return () => {
        window.removeEventListener('clinic:auth-expired', handleAuthExpired);
      };
    }

    const restoreSession = async () => {
      try {
        const response = await authApi.refresh();

        setUser(response.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      window.removeEventListener('clinic:auth-expired', handleAuthExpired);
    };
  }, [initialUser, loginPath, router]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({
      email,
      password,
    });

    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        updateUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
