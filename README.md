# Flidio: AI-Powered Travel Planner

## 📄 Overview
**Flidio** is an intelligent travel planning mobile application built with React Native and Expo. The app leverages AI technology (Google Generative AI) to create personalized travel itineraries based on user preferences and requirements. Features a freemium subscription model with RevenueCat integration, comprehensive user profile system, and premium features gating.

**Why this application?**
1. Demonstrate proficiency with React Native, Expo, and TypeScript development.
2. Showcase integration of AI services for dynamic content generation.
3. Implement subscription-based monetization with RevenueCat.
4. Create intuitive UX with onboarding, modal screens, and tab navigation.
5. Apply modern styling techniques with NativeWind (Tailwind CSS for React Native).
6. Build comprehensive settings and user management system.

---

## 🎯 Core Features

### 1. **Onboarding Experience**
- First-time user onboarding screen with app introduction
- One-time setup process for new users
- Smooth transition to main application after completion

### 2. **User Profile Management**
- Modal screen for collecting comprehensive user information:
  - Personal details (name, age, location)
  - Travel preferences and interests
  - Travel styles and personality matching
- AsyncStorage-backed persistence via Settings/UserProfile contexts
- Profile data used for personalized AI travel recommendations

### 3. **Advanced Travel Planning**
- **Home Tab**: Display list of created travel plans with rich visual cards
  - Swipe-to-delete functionality for travel items
  - Trip summaries with budget and duration info
- **Enhanced Create Travel Modal**: Comprehensive trip planning interface
  - Native date pickers with platform-specific UI (@react-native-community/datetimepicker)
  - Budget and traveler count inputs with validation
  - Trip vibe selection (City explorer, Coastal chill, Mountain retreat, etc.)
  - Special requests and notes section
  - AI-powered itinerary generation with custom API key support
  - Form validation with user-friendly error messages

### 4. **Subscription & Monetization System**
- **FreeMium Model**: Free tier with limited features, Pro tier with unlimited access
- **RevenueCat Integration**: Complete subscription management system
  - Monthly subscription plans ($2.99/month)
  - Subscription status checking and validation
  - Premium features gating (API key OR subscription required)
- **Promotion Screen**: Beautifully designed upsell interface
  - Feature comparison and benefits highlight
  - Native subscription purchase flow
  - Secure payment processing through App Store/Google Play

### 5. **Comprehensive Settings & Configuration**
- **Settings Tab** with advanced configuration options:
  - **Pro Features Status**: Real-time subscription status display
  - **API Key Management**: Google Generative AI key configuration
  - **User Profile Management**: Update traveler profile anytime
  - **Subscription Management**: Native subscription cancellation interface
  - **Theme System**: Light/dark mode with persistent storage
  - **Data Control**: Granular data management (profile, settings, itineraries)
  - **Support Links**: Privacy policy, terms of service, contact support
  - **App Information**: Version display and credits

### 6. **Conditional Access Control**
- Smart feature gating logic:
  1. Check for custom API key → Allow travel creation
  2. Check for Pro subscription → Allow travel creation  
  3. Neither available → Redirect to promotion screen
- Seamless upgrade flow for premium features
- Graceful error handling for subscription checks

---

## 🧰 Tech Stack & Architecture

### **Core Technologies**
1. **React Native + Expo + TypeScript**
   - Expo SDK 51+ for cross-platform development
   - TypeScript for comprehensive type safety and developer experience
   - Functional components with React Hooks and modern patterns
   - Expo Router for file-based navigation system

2. **Database & Storage**
  - **Expo SQLite**: Persistent storage for generated travel itineraries and metadata
  - **AsyncStorage**: Settings and traveler profile persistence with namespaced keys
  - Offline-first architecture for data persistence
  - Context API for surfacing persisted state throughout the app
   - Profile data used for personalized AI travel recommendations

3. **Subscription & Monetization**
   - **RevenueCat (react-native-purchases)**: Complete subscription management
   - App Store Connect and Google Play Console integration
   - Subscription status validation and entitlements checking
   - Native subscription management interface

4. **AI Integration**
   - **Google Generative AI (Gemini)**: LLM integration for travel planning
   - Custom API key support for power users
   - JSON-structured responses for structured itinerary data
   - Advanced prompt engineering for personalized recommendations
   - Error handling for API failures and invalid keys

5. **Native Components & UI**
   - **@react-native-community/datetimepicker**: Platform-native date selection
   - **NativeWind**: Tailwind CSS utilities for React Native
   - **Expo Haptics**: Tactile feedback for enhanced UX
   - **Expo Status Bar**: Dynamic status bar theming
   - Custom theme system with persistent dark/light mode

6. **State Management & Architecture**
   - **React Context API**: Settings and user profile providers shared across the app
   - **Custom Hooks**: `useSettingsStorage` and `useUserProfileStorage` built on AsyncStorage
   - **TypeScript Models**: Strong typing for AI responses, travel records, and persisted state
   - **Persistence Strategy**: SQLite for itineraries, AsyncStorage for preferences and profiles

### **Project Structure**
```
flidio/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   └── settings.tsx
│   ├── createTravelModal.tsx
│   ├── onboardingScreen.tsx
│   ├── promotionScreen.tsx
│   ├── travel/
│   │   └── [id].tsx
│   └── userProfileModal.tsx
├── components/
│   └── ui/
│       └── BackgroundCircles.tsx
├── context/
│   ├── SettingsContext.tsx
│   └── UserProfileContext.tsx
├── hooks/
│   ├── useSettingsStorage.ts
│   └── useUserProfileStorage.ts
├── services/
│   ├── aiService.ts
│   ├── asyncStorage.ts
│   ├── databaseService.ts
│   └── types.ts
├── utils/
│   └── formatPrompt.ts
├── assets/
│   └── images/...
├── global.css
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Key Implementation Details

### **Enhanced Database Schema**
```sql
-- Travels table storing generated itineraries
CREATE TABLE travels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  departure TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  budget TEXT,
  travellers TEXT,
  itinerary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> Settings and user profile preferences are persisted via AsyncStorage (`services/asyncStorage.ts`) using the custom hooks in `hooks/`.

### **Advanced AI Integration Flow**
1. **Pre-flight Checks**: Validate API key OR subscription status
2. **User Input Collection**: Enhanced form with date pickers, budget, vibes
3. **Prompt Engineering**: Construct detailed prompt with user profile data
4. **AI Processing**: Send request to Google Generative AI with error handling
5. **Response Processing**: Parse structured JSON response containing:
   - Daily detailed itineraries with times and locations
   - Recommended activities and restaurants
   - Budget breakdown and cost estimates
   - Local tips, cultural notes, and travel advice
   - Transportation recommendations
6. **Data Persistence**: Store both user input and AI response in SQLite
7. **Error Management**: Handle API failures, invalid keys, network issues

### **Subscription Flow Implementation**
```typescript
// Conditional access control in travel creation
const handleGenerateItinerary = async () => {
  // 1. Check for custom API key
  const hasApiKey = settings?.aiApiKey?.trim();
  
  if (!hasApiKey) {
    // 2. Check subscription status
    const customerInfo = await Purchases.getCustomerInfo();
    const hasProSubscription = 
      typeof customerInfo.entitlements.active["Flidio Pro"] !== "undefined" ||
      customerInfo.activeSubscriptions.includes("flidio_monthly");
    
    if (!hasProSubscription) {
      // 3. Redirect to promotion screen
      router.push("/promotionScreen");
      return;
    }
  }
  
  // 4. Proceed with travel creation
  // ...
};
```

### **Navigation Structure & Routing**
```tsx
// Expo Router file-based navigation
<Stack screenOptions={{headerShown: false}}>
  <Stack.Screen name="index"/>                    // App entry point
  <Stack.Screen name="onboardingScreen"/>         // First-time setup
  <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
  <Stack.Screen name="travel/[id]"/>             // Dynamic travel details
  <Stack.Screen name="userProfileModal"/>         // Profile management
  <Stack.Screen name="createTravelModal"/>        // Travel creation
  <Stack.Screen name="promotionScreen"/>          // Subscription upsell
</Stack>

// Tab Navigator (nested in (tabs) group)
<Tabs screenOptions={{
  headerShown: false,
  tabBarActiveTintColor: Colors.primary,
  tabBarStyle: { theme-aware styling }
}}>
  <Tabs.Screen name="home" options={{
    title: 'Travels',
    tabBarIcon: ({ color }) => <Ionicons name="map" color={color} />
  }}/>
  <Tabs.Screen name="settings" options={{
    title: 'Settings', 
    tabBarIcon: ({ color }) => <Ionicons name="settings" color={color} />
  }}/>
</Tabs>
```

---

## 🎨 Design System

### **Color Palette** (`tailwind.config.js`)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
        }
      }
    }
  }
}
```

### **Reusable Elements**
- `BackgroundCircles`: Shared decorative backdrop used across major screens
- Tailwind-powered screen layouts with inline component patterns
- Animated travel cards with swipe gestures (implemented in `app/(tabs)/home.tsx`)
- Promotion CTA components with RevenueCat purchase handling

---

## 📱 Enhanced User Experience Flow

### **First-Time User Journey**
1. **App Launch**: Check for existing user data and subscription status
2. **Onboarding**: Introduction screens with app benefits and features
3. **Profile Creation**: Comprehensive user profile modal with travel preferences
4. **Home Screen**: Clean interface showing travel plans and creation options

### **Travel Creation Flow**
1. **Access Control**: Check API key → Check subscription → Redirect to promotion if needed
2. **Enhanced Form**: Native date pickers, budget inputs, vibe selection
3. **AI Processing**: Real-time progress indicators and haptic feedback  
4. **Result Handling**: Success alerts with navigation options or error management
5. **Data Persistence**: Automatic saving with offline access

### **Subscription Management**
1. **Status Display**: Real-time subscription status in settings
2. **Upgrade Flow**: Seamless transition to native subscription purchase
3. **Feature Gating**: Conditional access to premium features
4. **Cancellation**: Native subscription management interface

### **Settings & Customization**
1. **Profile Management**: Update traveler preferences anytime
2. **API Key Configuration**: Custom Gemini API key for power users
3. **Theme System**: Persistent light/dark mode with system preference detection
4. **Data Control**: Granular data management with confirmation dialogs
5. **Subscription Control**: View status, upgrade, or cancel subscriptions

---

## 🔧 Development Setup

### **Prerequisites**
- Node.js 18+
- Expo CLI (latest version)
- iOS Simulator (Xcode) or Android Emulator
- Google Generative AI API key (optional for testing)
- RevenueCat account and API keys (for subscription testing)

### **Installation**
```bash
# Install dependencies
npm install

# iOS specific setup (if testing on iOS)
cd ios && pod install && cd ..
```

### **Environment Setup**
Create `.env` file in root directory:
```env
# Google AI Integration (Optional - users can add their own keys)
EXPO_PUBLIC_GOOGLE_AI_KEY=your_gemini_api_key_here

# RevenueCat Configuration
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key

# App Configuration
EXPO_PUBLIC_APP_VARIANT=development
```

### **RevenueCat Setup**
1. Create account at [RevenueCat](https://www.revenuecat.com/)
2. Set up your app in the RevenueCat dashboard
3. Configure products and entitlements
4. Add API keys to environment variables

### **Running the App**
```bash
# Start development server
npx expo start

# Platform-specific commands
npx expo start --ios
npx expo start --android
npx expo start --web
```

### **Building for Production**
```bash
# Create development build
eas build --profile development --platform all

# Create production build
eas build --profile production --platform all
```

---

## 🆕 Recent Updates & Features

### **Version 2.0 Updates**
- ✅ **Native Date Pickers**: Implemented @react-native-community/datetimepicker with platform-specific UI
- ✅ **Subscription System**: Complete RevenueCat integration with freemium model
- ✅ **Promotion Screen**: Beautiful upsell interface matching design specifications
- ✅ **Conditional Access Control**: Smart feature gating based on API key OR subscription
- ✅ **Enhanced Settings**: Pro status display, subscription management, comprehensive data control
- ✅ **Improved UX**: Haptic feedback, loading states, error handling throughout the app
- ✅ **Theme System**: Persistent dark/light mode with improved visual design

### **Key Integrations Added**
- **@react-native-community/datetimepicker**: Native date selection components
- **react-native-purchases**: RevenueCat subscription management
- **expo-haptics**: Enhanced tactile feedback system
- **Advanced Context Management**: Comprehensive state management with proper TypeScript typing

---

## 🕹️ Technical Evaluation

| Feature Category            | Implementation Details & Quality                |
|----------------------------|------------------------------------------------|
| **TypeScript Integration** | Comprehensive typing for all props, state, API responses, and context |
| **Database Architecture**  | Advanced SQLite operations with transactions, error handling, and data relationships |
| **Subscription System**    | Production-ready RevenueCat integration with conditional access control |
| **AI Service Integration** | Robust prompt engineering, response parsing, and custom API key support |
| **Native Components**      | Platform-specific date pickers, haptic feedback, and subscription management |
| **UI/UX Design**          | Consistent design system with NativeWind, theme support, and responsive layouts |
| **State Management**       | Optimized Context API usage with proper re-render control and data persistence |
| **Code Organization**      | Modular architecture with reusable components and clean separation of concerns |
| **Error Handling**         | Comprehensive error boundaries and user-friendly error messages |
| **Performance**           | Optimized list rendering, lazy loading, and smooth animations |
| **Security**              | Secure API key handling and subscription validation |

---

## 🎯 Production Readiness

### **Completed Features**
- ✅ Complete user onboarding and profile system
- ✅ Advanced travel planning with AI integration
- ✅ Native subscription system with RevenueCat
- ✅ Comprehensive settings and data management
- ✅ Theme system with persistent preferences
- ✅ Offline-first architecture with SQLite
- ✅ Production-ready error handling and validation

### **Ready for App Store**
- ✅ Native subscription integration
- ✅ Privacy policy and terms of service
- ✅ Proper entitlements and permissions
- ✅ Optimized performance and user experience
- ✅ Cross-platform compatibility (iOS/Android)

