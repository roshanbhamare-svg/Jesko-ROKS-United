/**
 * Jesko — Auth Context
 * Provides authentication state (user, token, role) and login/register/logout actions
 * to the entire component tree via React Context.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jesko_token'));
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await authAPI.me();
          setUser(data);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('jesko_token');
          localStorage.removeItem('jesko_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('jesko_token', data.access_token);
      localStorage.setItem('jesko_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed';
      toast.error(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const { data } = await authAPI.register(payload);
      localStorage.setItem('jesko_token', data.access_token);
      localStorage.setItem('jesko_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      toast.success(`Welcome to Jesko, ${data.user.name}!`);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      toast.error(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jesko_token');
    localStorage.removeItem('jesko_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
