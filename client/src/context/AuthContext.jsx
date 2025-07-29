import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = authAPI.getCurrentUser();
    console.log('AuthContext - Initial user check:', JSON.stringify(currentUser, null, 2));
    
    // Check if user object has role field - if not, clear old data
    if (currentUser && !currentUser.role) {
      console.log('Old user data without role detected, clearing localStorage');
      authAPI.logout();
      setUser(null);
    } else if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext - Starting login for:', email);
      const data = await authAPI.login(email, password);
      console.log('AuthContext - Login response data:', data);
      
      // Immediately update the user state
      console.log('AuthContext - Setting user to:', data.user);
      setUser(data.user);
      
      // Force a refresh of user data from localStorage after a brief delay
      setTimeout(() => {
        const refreshedUser = authAPI.getCurrentUser();
        console.log('AuthContext - Refreshed user from localStorage:', refreshedUser);
        if (refreshedUser && refreshedUser.role) {
          setUser(refreshedUser);
        }
      }, 50);
      
      console.log('AuthContext - User state updated');
      
      // Return the user data for immediate use in components
      return data.user;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration with:', { name, email }); // Debug log
      const data = await authAPI.register(name, email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Registration error in context:', error);
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const refreshUser = () => {
    const currentUser = authAPI.getCurrentUser();
    console.log('AuthContext - Refreshing user:', currentUser);
    setUser(currentUser);
    return currentUser;
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};