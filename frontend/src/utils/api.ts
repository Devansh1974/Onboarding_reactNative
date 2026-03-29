const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const api = {
  // Auth
  sendOTP: async (phoneNumber: string, countryCode: string = '+91') => {
    const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, countryCode }),
    });
    return response.json();
  },

  verifyOTP: async (phoneNumber: string, otp: string, countryCode: string = '+91') => {
    const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp, countryCode }),
    });
    return response.json();
  },

  // User Profile
  getProfile: async (phoneNumber: string) => {
    const response = await fetch(`${BACKEND_URL}/api/users/${phoneNumber}`);
    return response.json();
  },

  updateProfile: async (phoneNumber: string, data: any) => {
    const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, data }),
    });
    return response.json();
  },

  completeOnboarding: async (phoneNumber: string) => {
    const response = await fetch(`${BACKEND_URL}/api/users/complete-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    return response.json();
  },
};
