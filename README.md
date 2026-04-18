# WingMann - Onboarding & Admin Dashboard

Welcome to the WingMann Onboarding application repository. This app features a complete multi-step user onboarding, compatibility quizzing, visual vibe curation, and a comprehensive live Admin Dashboard for verifying user profiles and onboarding interviews.

## 🚀 What We've Built

1. **User Onboarding Flow:**
   - Phone number authentication screen with proper responsive scroll views.
   - Profile creation (Name, Gender, DOB).
   - Interview scheduling engine using a simulated calendar interface.
   
2. **Compatibility Quiz Forms:**
   - Complete 5-section horizontally scrollable unlocking mechanism.
   - Deep MongoDB nested state merging (saving progress accurately without wiping).
   - Re-architected quiz screens to be single vertically scrollable views for maximum user-friendliness.

3. **Curate Your Vibe Mechanism:**
   - Image API integration that fetches matching aesthetic photos depending on user gender.
   - Interactive multi-round selection tracking with a dynamic final "Your Vibe" summary.
   - Smooth animated loading sequence bridging into the final Matches dashboard.

4. **Live Admin Dashboard:**
   - Fully persistent authenticated sessions across reloads via `AsyncStorage`.
   - Real-time polling mechanism to automatically load incoming user registrations instantly.
   - Profile approval, rejection, and session assignment capabilities.

## 🛠️ Tech Stack

* **Frontend**: React Native, Expo Router, Expo CLI, AsyncStorage.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB & Mongoose.

## 💻 How to Run Locally

You will need to open two separate terminal windows.

### 1. Starting the Backend Server
First, ensure you have your `MONGO_URI` set up in the `.env` file inside the backend directory.
```bash
cd backend
npm install
npm start
```

### 2. Starting the Frontend App
Ensure that the frontend is pointed to the backend by having a configured `.env` file with `EXPO_PUBLIC_BACKEND_URL`.
```bash
cd frontend
npm install
npx expo start --lan
```
*You can now scan the QR code using Expo Go on your mobile device, or press `i`/`a` to launch an iOS/Android emulator directly.*

## 🔐 Admin Access

To access the Admin Dashboard, use the following default access keys:

- **Email:** `admin@wingmann.com`
- **Password:** `admin123`

*(Note: Ensure you hash and rotate these credentials in a future production release).*
