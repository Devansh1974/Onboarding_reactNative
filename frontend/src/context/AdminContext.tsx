import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminInfo {
  email: string;
  name: string;
  role: string;
}

interface AdminContextType {
  admin: AdminInfo | null;
  login: (admin: AdminInfo) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const login = (info: AdminInfo) => setAdmin(info);
  const logout = () => setAdmin(null);

  return (
    <AdminContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
