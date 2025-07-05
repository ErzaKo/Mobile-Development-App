import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  signup: async () => {},
  loading: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user and token from AsyncStorage on app start
  useEffect(() => {
    const loadStorage = async () => {
      const savedToken = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    };
    loadStorage();
  }, []);
  const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
    // Login function - calls your backend /login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      // Save token and fetch user info if needed
      setToken(data.token);
      await AsyncStorage.setItem('token', data.token);

      // Decode token or call /me endpoint to get user details
      // For simplicity, let's call /me endpoint:
      const userResponse = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const userData = await userResponse.json();
      setUser(userData.results);
      await AsyncStorage.setItem('user', JSON.stringify(userData.results));
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Signup function - calls your backend /register
  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      // Optionally auto-login after signup or redirect user
      await login(email, password);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
import { useContext } from 'react';

export const useAuth = () => useContext(AuthContext); // ✅ named export

export default AuthProvider;

