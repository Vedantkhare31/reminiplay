import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session with backend database
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('reminiplay_user');
      const token = localStorage.getItem('reminiplay_token');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Refresh live profile and game stats from database
          const response = await api.get('/api/auth/me');
          if (response.data && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('reminiplay_user', JSON.stringify(response.data.user));
          }
        } catch (e) {
          console.warn('Session refresh notice:', e.message);
          // Keep cached user if offline, or clear if unauthorized
          if (e.response && (e.response.status === 401 || e.response.status === 403)) {
            localStorage.removeItem('reminiplay_user');
            localStorage.removeItem('reminiplay_token');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (token) {
      localStorage.setItem('reminiplay_token', token);
    }
    localStorage.setItem('reminiplay_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('reminiplay_user');
    localStorage.removeItem('reminiplay_token');
  };

  const register = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (token) {
      localStorage.setItem('reminiplay_token', token);
    }
    localStorage.setItem('reminiplay_user', JSON.stringify(userData));
  };

  // Sync user stats (coins, levels, drawing progress, checkpoints) across devices
  const syncProgress = useCallback(async (progressData) => {
    try {
      const response = await api.post('/api/user/sync-progress', progressData);
      if (response.data && response.data.user) {
        setUser((prev) => {
          const updated = { ...prev, ...response.data.user };
          localStorage.setItem('reminiplay_user', JSON.stringify(updated));
          return updated;
        });
        return { success: true };
      }
    } catch (error) {
      console.warn('Progress sync warning (stored locally):', error.message);
      // Fallback: update local state if network issue
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...progressData };
        localStorage.setItem('reminiplay_user', JSON.stringify(updated));
        return updated;
      });
      return { success: false, error };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        syncProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};