# WingMann Technical Documentation

This document outlines the technical architecture, user flow, and API endpoints for the WingMann Dating App.

## 1. System Architecture
- **Frontend**: React Native with Expo (TypeScript)
- **Backend**: Node.js with Express
- **Database**: MongoDB (Mongoose)

## 2. Core Flows

### A. Authentication Flow
1. **Phone Input**: User enters phone number.
2. **OTP Generation**: Backend generates a 6-digit OTP and logs it to the terminal.
3. **Verification**: User enters the OTP. Success returns a `userId` and indicates if they are a new user.

### B. Onboarding & Compatibility
1. **Profile Setup**: User goes through a series of screens (Gender, Name, Birthday, Height, Religion, etc.).
2. **Compatibility Quiz**: User answers a set of questions.
3. **Compatibility Index**: The `matchController.js` calculates a percentage between users based on overlapping quiz responses.

### C. Match Interactions
- **Like (Favorite)**: 
    - Adds the candidate's UUID to the current user's `favorites` array.
    - Profile is removed from the daily feed (optimistic UI update).
    - Profile becomes visible in the **Favorites** screen (Header Heart Icon).
- **Reject (Blacklist)**:
    - Adds the candidate's UUID to the current user's `rejects` array.
    - Profile is removed from the daily feed.
    - Candidate will **never** be recommended to this user again.
    - Profile is visible in **Profile -> Blacklisted Users**.

---

## 3. API Reference

### Authentication
- `POST /api/auth/send-otp`: Sends a 6-digit code.
- `POST /api/auth/verify-otp`: Validates the code and returns authentication state.

### User Profile
- `GET /api/users/:phoneNumber`: Fetches the full profile for a user.
- `PATCH /api/users/profile`: Updates profile data (religion, work, etc.).
- `POST /api/users/complete-onboarding`: Marks the user as active for matching.

### Matching & Social
- `GET /api/matches/:phoneNumber`: Returns recommended candidates with compatibility scores.
- `POST /api/users/favorites`: Toggles a user's favorite status.
- `GET /api/users/:phoneNumber/favorites`: Returns a populated list of favorite profiles.
- `POST /api/users/rejects`: Permanently blocks a user.
- `GET /api/users/:phoneNumber/rejects`: Returns a populated list of blacklisted profiles.

---

## 4. Technical Constants
- **Route Priority**: Specific sub-routes (like `/favorites`) are matches BEFORE general lookups (`/:phoneNumber`) to prevent route hijacking.
- **Data Safety**: All phone numbers in URLs are `encodeURIComponent`'ed to handle the `+` character in international formats.
- **Optimistic UI**: Interactions trigger immediate local state updates in the frontend to ensure a "snappy" user experience before the backend confirms the save.
