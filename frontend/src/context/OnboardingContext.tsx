import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WorkDetails {
  company?: string;
  position?: string;
  jobTitle?: string;
}

interface StudyDetails {
  school?: string;
  course?: string;
  degree?: string;
}

interface LifestyleAnswers {
  drink?: string;
  smoke?: string;
  exercise?: string;
}

interface Preferences {
  ageRange: { min: number; max: number };
  heightRange: { min: number; max: number };
  languages: string[];
  dealbreakers: string[];
}

interface OnboardingData {
  // Auth
  phoneNumber: string;
  countryCode: string;
  otp: string;
  otpVerified: boolean;
  
  // Basic Info
  gender: 'male' | 'female' | '';
  name: string;
  birthday: string;
  height: number | null;
  
  // Location
  location: string; // "Bangalore" or "Hyderabad"
  nativeState: string;
  
  // Story & Personality
  story: string;
  nonNegotiables: string[];
  offerings: string[];
  
  // Work/Education
  timeUsage: string; // "Working", "Studying", "Figuring It Out"
  workDetails: WorkDetails;
  studyDetails: StudyDetails;
  education: string; // "High School", "Undergraduate", "Doctorate", "Postgraduate"
  
  // Beliefs & Lifestyle
  religionImportance: string;
  religionFollow: string;
  foodHabits: string[];
  interests: string[];
  lifestyle: LifestyleAnswers;
  
  // System
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
  
  // Photos & Preferences
  photos: string[];
  preferences: Preferences;
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
  otpVerified: false,
  gender: '',
  name: '',
  birthday: '',
  height: null,
  location: '',
  nativeState: '',
  story: '',
  nonNegotiables: [],
  offerings: [],
  timeUsage: '',
  workDetails: {},
  studyDetails: {},
  education: '',
  religionImportance: '',
  religionFollow: '',
  foodHabits: [],
  interests: [],
  lifestyle: {},
  onboardingCompleted: false,
  notificationsEnabled: false,
  photos: [],
  preferences: {
    ageRange: { min: 18, max: 28 },
    heightRange: { min: 5.0, max: 6.5 },
    languages: [],
    dealbreakers: [],
  },
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
