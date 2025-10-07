import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd';
import request from '../utils/request';
import type { AuthContextType, LoginResponse, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
      
      // Verify token is still valid
      request
        .get('/auth/me')
        .then((user: User) => {
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        })
        .catch(() => {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setCurrentUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response: LoginResponse = await request.post('/auth/login', {
        data: { username, password },
      });

      setToken(response.token);
      setCurrentUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      message.success('Login successful!');
    } catch (error: any) {
      message.error(error?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      const response: LoginResponse = await request.post('/auth/register', {
        data: { username, email, password, displayName },
      });

      setToken(response.token);
      setCurrentUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      message.success('Registration successful!');
    } catch (error: any) {
      message.error(error?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, token, login, register, logout, loading }}
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