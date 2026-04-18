import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdminInfo {
  email: string;
  name: string;
  role: string;
}

interface AdminContextType {
  admin: AdminInfo | null;
  login: (admin: AdminInfo) => void;
  logout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load admin from storage on boot
    const loadSession = async () => {
      try {
        const storedAdmin = await AsyncStorage.getItem('@admin_session');
        if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
      } catch (e) {
        console.error('Failed to load admin session', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (info: AdminInfo) => {
    setAdmin(info);
    try {
      await AsyncStorage.setItem('@admin_session', JSON.stringify(info));
    } catch (e) {
      console.error('Failed to save admin session', e);
    }
  };

  const logout = async () => {
    setAdmin(null);
    try {
      await AsyncStorage.removeItem('@admin_session');
    } catch (e) {
      console.error('Failed to remove admin session', e);
    }
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
