import { createContext, useContext, useEffect, useState } from 'react';
import { adminApi, setAuthToken, getAuthToken, type AdminLoginResponse } from './api';

interface AuthContextType {
  user: { id: string; username: string } | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setup: (username: string, password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const userData = localStorage.getItem('admin_user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          localStorage.removeItem('admin_user');
        }
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const response: AdminLoginResponse = await adminApi.login({ username, password });
      setAuthToken(response.access_token);
      const userData = response.user ?? { id: 'admin', username };
      setUser(userData);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const setup = async (username: string, password: string) => {
    try {
      const response: AdminLoginResponse = await adminApi.setup({ username, password });
      setAuthToken(response.access_token);
      const userData = response.user ?? { id: 'admin', username };
      setUser(userData);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, setup }}>
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
