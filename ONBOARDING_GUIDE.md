# WingMann Onboarding Flow - Documentation

## ✅ Implementation Complete

A complete React Native onboarding flow for the WingMann dating app has been successfully implemented using Expo and modern mobile development practices.

## 📱 Implemented Screens

### 1. Splash Screen (`/`)
- Purple branded background
- WingMann logo with tagline
- Smooth fade-in animation
- Auto-navigates to Welcome screen after 2.5s

### 2. Welcome/Entry Screen (`/welcome`)
- Illustration placeholder (emoji-based, easy to replace)
- "Ready to stop swiping and start dating with intent?" messaging
- Primary "Sign Up" button
- Google login button (UI only, ready for backend)
- Terms of Service and Privacy Policy links

### 3. Phone Input Screen (`/phone`)
- Country code selector (India +91 as default)
- Phone number input with validation
- Back button navigation
- Error handling for invalid numbers

### 4. OTP Verification Screen (`/otp`)
- 6-digit OTP input with auto-focus
- Smooth animations on focus
- "Resend" functionality (UI ready)
- Input validation

### 5. Gender Selection Screen (`/gender`)
- Card-based selection UI
- Male/Female options with icons
- Animated selection feedback
- Purple highlight on selected card

### 6. Preference Selection Screen (`/preference`)
- Similar to gender screen
- "Who would you like to meet?" messaging
- Smooth card selection animations

### 7. Name Input Screen (`/name`)
- Text input for user's name
- Auto-focus on mount
- Input validation (min 2 characters)

### 8. Intro Screen 1 (`/intro1`)
- Personalized greeting: "Hey [Name]"
- "I'm your WingMann" messaging
- Purple background with illustrations
- Fade-in animations

### 9. Intro Screen 2 (`/intro2`)
- Final welcome message
- "Let's find your perfect match"
- Saves onboarding completion to AsyncStorage
- "Get Started" button

### 10. Home Screen (`/home`)
- Placeholder for main app
- Displays collected user data
- Confirms onboarding completion

## 🎨 Design System

### Colors (Purple Theme)
```typescript
- Primary: #6B2C91
- Primary Dark: #4A1D66  
- Primary Light: #8B3FB8
- White: #FFFFFF
- Background: #F8F8F8
- Text: #1C1C1E
- Text Secondary: #8E8E93
```

### Typography
- H1: 34px, Bold
- H2: 28px, Bold
- H3: 22px, Semibold
- Body: 17px, Regular
- Caption: 13px, Regular
- Button: 17px, Semibold

### Spacing (8pt Grid System)
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

## 🧩 Reusable Components

### 1. CustomButton
- Three variants: primary, secondary, outline
- Loading state support
- Disabled state
- Smooth press animations using react-native-reanimated
- Touch feedback (scale animation)

### 2. InputField
- Label support
- Error messaging
- Left/Right icon slots
- Customizable styling
- Proper keyboard handling

### 3. OtpInput
- Auto-focus between digits
- Paste support (handles full 6-digit paste)
- Backspace navigation
- Animated focus states
- Number-only keyboard

### 4. SelectionCard
- Icon display using @expo/vector-icons
- Selected/unselected states
- Smooth scale animations
- Purple theme integration
- Touch feedback

### 5. Header
- Back button with navigation
- Optional title
- Safe area handling
- Consistent across all screens

### 6. OnboardingLayout
- Consistent wrapper for all onboarding screens
- Keyboard avoiding behavior (iOS/Android)
- Safe area support
- Optional scrolling
- Header integration

## 🔄 State Management

### OnboardingContext
Centralized state management for onboarding data:

```typescript
{
  phoneNumber: string;
  countryCode: string;  // e.g., "+91"
  otp: string;
  gender: 'male' | 'female' | '';
  preference: 'male' | 'female' | '';
  name: string;
  onboardingCompleted: boolean;
}
```

- React Context API for global state
- Easy to extend for additional fields
- Ready for backend integration

## 📂 Project Structure

```
/app/frontend/
├── app/                      # Expo Router pages
│   ├── _layout.tsx          # Root layout with providers
│   ├── index.tsx            # Splash screen
│   ├── welcome.tsx          # Welcome screen
│   ├── phone.tsx            # Phone input
│   ├── otp.tsx              # OTP verification
│   ├── gender.tsx           # Gender selection
│   ├── preference.tsx       # Preference selection
│   ├── name.tsx             # Name input
│   ├── intro1.tsx           # First intro
│   ├── intro2.tsx           # Second intro
│   └── home.tsx             # Home placeholder
├── src/
│   ├── components/          # Reusable components
│   │   ├── CustomButton.tsx
│   │   ├── InputField.tsx
│   │   ├── OtpInput.tsx
│   │   ├── SelectionCard.tsx
│   │   ├── Header.tsx
│   │   └── OnboardingLayout.tsx
│   ├── screens/             # Screen components
│   │   ├── SplashScreen.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── PhoneScreen.tsx
│   │   ├── OtpScreen.tsx
│   │   ├── GenderScreen.tsx
│   │   ├── PreferenceScreen.tsx
│   │   ├── NameScreen.tsx
│   │   ├── Intro1Screen.tsx
│   │   ├── Intro2Screen.tsx
│   │   └── HomeScreen.tsx
│   ├── context/             # State management
│   │   └── OnboardingContext.tsx
│   └── constants/           # Theme and constants
│       └── theme.ts
```

## 🎯 Key Features

### ✅ Mobile-First Design
- Touch targets: minimum 44x44 points (iOS) / 48x48 (Android)
- Thumb-friendly navigation
- Proper keyboard handling
- Safe area insets
- Platform-specific behaviors

### ✅ Animations & UX
- Smooth transitions using react-native-reanimated
- Button press feedback
- Card selection animations
- OTP input auto-focus
- Loading states
- Error states

### ✅ Form Validation
- Phone number validation (min 10 digits)
- OTP validation (6 digits)
- Name validation (min 2 characters)
- Empty input prevention
- Error messaging

### ✅ Navigation
- Expo Router file-based routing
- Stack navigation with back button support
- Smooth screen transitions
- Deep linking ready
- Programmatic navigation

### ✅ Backend Ready
- State structured for API calls
- Easy to add backend endpoints:
  ```
  POST /api/auth/send-otp
  POST /api/auth/verify-otp
  POST /api/users/onboarding
  ```
- AsyncStorage integration
- Data persistence ready

## 🔧 How to Replace Placeholders

### Illustrations
Current: Emoji-based placeholders
To replace:
1. Add your illustrations to `/app/frontend/assets/images/`
2. Update the Image components in:
   - `WelcomeScreen.tsx`
   - `Intro1Screen.tsx`
   - `Intro2Screen.tsx`

Example:
```tsx
// Replace this:
<Text style={styles.illustrationText}>👫</Text>

// With this:
<Image 
  source={require('../assets/images/welcome-illustration.png')}
  style={styles.illustration}
  resizeMode="contain"
/>
```

### Logo
Current: Text-based "WingMann"
To replace in `SplashScreen.tsx`:
```tsx
// Add logo import
import Logo from '../assets/images/logo.png';

// Replace Text with Image
<Image source={Logo} style={styles.logo} />
```

## 🚀 Backend Integration Guide

### Step 1: Phone Number Submission
```typescript
// In PhoneScreen.tsx, handleContinue():
const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: `${callingCode}${phoneNumber}`,
  }),
});
```

### Step 2: OTP Verification
```typescript
// In OtpScreen.tsx, handleVerify():
const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: `${data.countryCode}${data.phoneNumber}`,
    otp,
  }),
});

// Store JWT token
const { token } = await response.json();
await AsyncStorage.setItem('authToken', token);
```

### Step 3: Save User Profile
```typescript
// In Intro2Screen.tsx, handleComplete():
const response = await fetch(`${BACKEND_URL}/api/users/onboarding`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    phoneNumber: data.phoneNumber,
    countryCode: data.countryCode,
    gender: data.gender,
    preference: data.preference,
    name: data.name,
  }),
});
```

### MongoDB Schema Example
```javascript
const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  countryCode: {
    type: String,
    required: true,
    default: '+91',
  },
  otp: {
    code: String,
    expiresAt: Date,
    verified: { type: Boolean, default: false },
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  preference: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
```

## 📱 Testing

### Manual Testing
1. Open the app preview URL
2. Complete the onboarding flow
3. Verify data persistence in AsyncStorage
4. Test back button navigation
5. Test keyboard behavior
6. Test on different screen sizes

### Automated Testing
Use the provided testing agents:
```bash
# Frontend testing
Call expo_frontend_testing_agent

# Backend testing (when implemented)
Call deep_testing_backend_v2
```

## 🎨 Customization Guide

### Change Primary Color
Edit `/app/frontend/src/constants/theme.ts`:
```typescript
export const COLORS = {
  primary: '#YOUR_COLOR_HERE',  // Change this
  primaryDark: '#YOUR_DARK_SHADE',
  primaryLight: '#YOUR_LIGHT_SHADE',
  // ...
};
```

### Add New Onboarding Screen
1. Create screen in `/app/frontend/src/screens/NewScreen.tsx`
2. Add route in `/app/frontend/app/new-screen.tsx`
3. Update navigation flow in previous screen
4. Add to `_layout.tsx` Stack.Screen list

### Modify Button Styles
Edit `/app/frontend/src/components/CustomButton.tsx`:
```typescript
// Change height, border radius, padding, etc.
button: {
  height: 56,  // Adjust here
  borderRadius: BORDER_RADIUS.md,
  // ...
}
```

## 🔒 Security Considerations for Backend

When implementing backend:
1. **OTP Security**:
   - Limit OTP attempts (max 3-5)
   - Add rate limiting
   - OTP expiry (5-10 minutes)
   - Use secure random generation

2. **Phone Number Validation**:
   - Verify format server-side
   - Check against blacklists
   - Implement cooldown periods

3. **Data Protection**:
   - Hash sensitive data
   - Use JWT with short expiry
   - Implement refresh tokens
   - Add HTTPS only

## 📦 Dependencies

### Core
- expo: ^54.0.33
- react: 19.1.0
- react-native: 0.81.5
- expo-router: ~6.0.22

### Navigation
- @react-navigation/native: ^7.1.6
- @react-navigation/native-stack: ^7.3.10

### Animations
- react-native-reanimated: ~4.1.1
- react-native-gesture-handler: ~2.28.0

### Storage
- @react-native-async-storage/async-storage: 2.2.0

### UI
- @expo/vector-icons: ^15.0.3
- react-native-safe-area-context: ~5.6.0

## 🎯 Next Steps

### Immediate (Ready for Integration)
1. ✅ Replace emoji placeholders with real illustrations
2. ✅ Add WingMann logo image
3. ✅ Connect to backend API
4. ✅ Implement authentication flow
5. ✅ Save user data to MongoDB

### Future Enhancements
1. Add social login (Google, Facebook)
2. Add photo upload
3. Add additional profile fields (age, bio, interests)
4. Add location selection
5. Add profile photo verification
6. Add more gender/preference options
7. Add accessibility features
8. Add analytics tracking
9. Add error reporting (Sentry)
10. Add A/B testing capability

## 🐛 Known Limitations

1. **Country Picker**: Currently using simple +91 display. For full country picker:
   ```bash
   yarn add react-native-picker-select
   # Then update PhoneScreen.tsx
   ```

2. **Image Placeholders**: Using emojis - replace with real illustrations

3. **Google Login**: UI only - needs OAuth implementation

4. **OTP Backend**: Currently front-end only - needs SMS service integration

## 📝 Notes

- All animations use react-native-reanimated for 60fps performance
- Keyboard automatically handled on all input screens
- Safe area insets properly configured
- Works on iOS and Android
- Responsive to different screen sizes
- Accessible with proper touch targets
- Clean, maintainable code structure
- Easy to extend and customize
- Production-ready architecture

---

**Built with ❤️ for WingMann Dating App**
**Framework: React Native + Expo**
**Architecture: Clean, Scalable, Production-Ready**
