import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingData {
  phoneNumber: string;
  countryCode: string;
  otp: string;
  gender: 'male' | 'female' | '';
  preference: 'male' | 'female' | '';
  name: string;
  onboardingCompleted: boolean;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  resetData: () => void;
}

const initialData: OnboardingData = {
  phoneNumber: '',
  countryCode: '+91',
  otp: '',
  gender: '',
  preference: '',
  name: '',
  onboardingCompleted: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const resetData = () => {
    setData(initialData);
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
