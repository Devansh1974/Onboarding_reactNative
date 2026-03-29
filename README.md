# 🎉 WingMann - Dating App with Intent

A complete React Native dating app built with Expo, Node.js, and MongoDB. Features a comprehensive 24-screen onboarding flow designed to create meaningful connections.

![WingMann](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)

---

## 📱 Features

### Onboarding Flow (24 Screens)
1. **Welcome + Phone Input** - Combined entry screen with phone number
2. **OTP Verification** - 6-digit code (currently skippable for development)
3. **Gender Selection** - Male/Female choice
4. **Name Input** - User's name
5. **WingMann Intro** - Personalized greeting
6. **Birthday Selection** - Interactive date picker
7. **Height Input** - Gender-specific height selection
8. **Location Selection** - Bangalore/Hyderabad with dropdown
9. **City Welcome** - Location-specific welcome message
10. **Native State** - Home state selection
11. **Story** - 100-word personal story
12. **Non-negotiables** - Relationship deal-breakers
13. **Offerings** - Qualities to offer a partner
14. **Time Usage** - Working/Studying/Figuring It Out
15. **Work Details** - Company, position (conditional)
16. **Study Details** - School, course (conditional)
17. **Education Level** - High School to Postgraduate
18. **Religion** - Optional spiritual preferences
19. **Food Habits** - Dietary preferences (multi-select)
20. **Free Time Interests** - Hobbies (max 5 selections)
21. **Lifestyle Questions** - Drink/Smoke/Exercise
22. **Appreciation Screen** - Gratitude message
23. **Notifications** - Enable push notifications
24. **Home Screen** - Personalized greeting

### Technical Features
- ✅ **Backend**: Node.js + Express + MongoDB
- ✅ **Frontend**: React Native + Expo Router
- ✅ **State Management**: React Context API
- ✅ **Database**: MongoDB Atlas (cloud)
- ✅ **Animations**: React Native Reanimated
- ✅ **Form Validation**: Real-time validation
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Clean Architecture**: Modular component structure

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Yarn** - `npm install -g yarn`
- **Git** - [Download here](https://git-scm.com/)
- **Expo Go** app on your phone - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/wingmann-dating-app.git
cd wingmann-dating-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
yarn install
# OR
npm install

# The .env file already contains MongoDB connection
# Verify it has:
# MONGO_URL=mongodb+srv://devanshsingh1974:devansh123@cluster0.1mvlvh2.mongodb.net/wingmann?appName=Cluster0
# DB_NAME=wingmann
# PORT=8001

# Start the backend server
yarn start
# OR
npm start
```

**Backend will run on:** `http://localhost:8001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install
# OR
npm install

# Update .env file for local development
# Edit frontend/.env and set:
# EXPO_PUBLIC_BACKEND_URL=http://localhost:8001

# Start Expo
npx expo start
```

**Frontend options:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with **Expo Go app** on your phone

---

## 🔧 Environment Variables

### Backend (`/backend/.env`)

```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://devanshsingh1974:devansh123@cluster0.1mvlvh2.mongodb.net/wingmann?appName=Cluster0
DB_NAME=wingmann

# Server Configuration
PORT=8001
NODE_ENV=development
```

### Frontend (`/frontend/.env`)

```env
# For local development
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

---

## 📚 Dependencies to Install

### Backend Dependencies

```bash
cd backend
yarn add express mongoose cors dotenv body-parser
```

**Required packages:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `body-parser` - Request parsing

### Frontend Dependencies

```bash
cd frontend
yarn add @react-native-async-storage/async-storage
```

**Already included** (from Expo template):
- `expo` - Expo framework
- `react` - React library
- `react-native` - React Native
- `expo-router` - File-based routing
- `react-native-reanimated` - Animations
- `@expo/vector-icons` - Icons

---

## 🎨 Replacing Placeholder Images/Emojis

Currently using emoji placeholders (👫, 🤝, 🎂, etc.). To add your custom images:

### 1. Add Images to Assets

```
frontend/assets/images/
├── welcome-illustration.png
├── wingmann-intro.png
├── city-bangalore.png
├── city-hyderabad.png
└── appreciate.png
```

### 2. Update Screen Files

**Example - Replace emoji in WelcomePhoneScreen.tsx:**

```tsx
// Find this:
<Text style={styles.illustrationText}>👫</Text>

// Replace with:
<Image 
  source={require('../../assets/images/welcome-illustration.png')} 
  style={styles.illustration}
  resizeMode="contain"
/>
```

**Screens with emoji placeholders:**
- `WelcomePhoneScreen.tsx` - 👫
- `WingMannIntroScreen.tsx` - 🤝
- `CityWelcomeScreen.tsx` - ☕ or 🕌
- `AppreciateScreen.tsx` - 🤝
- `BirthdayScreen.tsx` - 🎂
- `HeightScreen.tsx` - 🚹 or 🚺

---

## 📝 What Data is Stored in MongoDB

All onboarding data is automatically saved to MongoDB when users complete the flow:

```javascript
{
  phoneNumber: "9876543210",
  countryCode: "+91",
  gender: "male",
  name: "Alex",
  birthday: "1995-08-15",
  height: 175,
  location: "Bangalore",
  nativeState: "Karnataka",
  story: "Product designer passionate about...",
  nonNegotiables: ["honesty", "communication"],
  offerings: ["loyalty", "humor"],
  timeUsage: "Working",
  workDetails: {
    company: "Tech Corp",
    position: "Designer",
    jobTitle: "Senior UX Designer"
  },
  education: "Undergraduate",
  religionImportance: "Not Important",
  foodHabits: ["Non vegetarian"],
  interests: ["Reading", "Travel", "Photography"],
  lifestyle: {
    drink: "Occasionally",
    smoke: "Never",
    exercise: "Regularly"
  },
  notificationsEnabled: true,
  onboardingCompleted: true,
  createdAt: "2024-03-29T...",
  updatedAt: "2024-03-29T..."
}
```

**Note:** All data is stored in the `users` collection in your MongoDB database.

---

## 🧪 Testing the App

1. Start backend: `cd backend && yarn start`
2. Start frontend: `cd frontend && npx expo start`
3. Test flow:
   - Phone: `9876543210`
   - OTP: `123456` (or any 6 digits - it's skippable)
   - Complete all 24 screens
4. Check MongoDB to see stored data

---

## ⚠️ Important Notes

### OTP is Currently Skippable
- Enter ANY 6-digit code to proceed
- Perfect for development/testing
- **TODO**: Integrate real SMS service (Twilio, etc.) before production

### MongoDB Credentials
- Currently using shared credentials
- **Change before production deployment**
- Rotate credentials regularly

---

## 🚀 Next Steps / TODO

- [ ] Integrate real SMS OTP service
- [ ] Replace emoji placeholders with custom images
- [ ] Add JWT authentication
- [ ] Implement matching algorithm
- [ ] Add chat functionality
- [ ] Add profile photos
- [ ] Deploy to App Store/Play Store

---

## 📧 Support

For issues or questions:
- Check the troubleshooting section
- Open a GitHub issue
- Contact: support@wingmann.com

---

**Built with ❤️ for meaningful connections**

*WingMann - Stop swiping, start dating with intent.*
