# Flidio: AI-Powered Travel Itinerary Generator

AI-Powered Travel Planning Mobile App built with React Native, Expo, and TypeScript. It transforms travel preferences and details into personalized day-by-day itineraries using Google's Gemini AI API.

Flidio is a comprehensive travel companion that features a freemium monetization model via RevenueCat, with an option for users to input their own Gemini API key for unrestricted use. All generated itineraries are stored locally using SQLite, ensuring an offline-first experience with complete privacy.

------------------------------------------------------------------------

## 📖 Table of Contents

-   🎯 Overview
-   ✨ Features
-   🛠 Tech Stack
-   🏗 Architecture
-   📁 Project Structure
-   🎨 Design Patterns
-   🚀 Key Implementation Details
-   🔧 Development Setup
-   📦 Building & Deployment
-   📄 License
-   📞 Support

------------------------------------------------------------------------

## 🎯 Overview

### Key Objectives

-   **AI-First Experience:** Seamless integration with Google Gemini API for state-of-the-art travel itinerary generation.
-   **Local-First Architecture:** All generated itineraries and user data stored locally via SQLite for offline access and privacy.
-   **Flexible Monetization:** Freemium model with trial credit, Pro subscriptions via RevenueCat, and a bring-your-own-API-key option.
-   **Cross-Platform:** Single codebase for both iOS and Android using Expo's managed workflow.
-   **Type Safety:** Full TypeScript implementation across the entire codebase for robust development.
-   **Personalized Experience:** User profiles with travel preferences that influence AI-generated recommendations.

### Project Metadata

-   **Version:** 0.7.0
-   **Platform:** iOS, Android
-   **Framework:** React Native (0.81.4) + Expo (SDK 54)
-   **Language:** TypeScript 5.9+
-   **Bundle ID:** com.bugrarslan.flidio

------------------------------------------------------------------------

## ✨ Features

### 🤖 AI Itinerary Generation

-   **Personalized Planning:** Generate day-by-day travel itineraries from user inputs using Gemini AI.
-   **Detailed Input Options:**
    -   Trip title and destination
    -   Departure location and dates (start/end)
    -   Budget (USD) and traveler count
    -   Trip vibes: City explorer, Coastal chill, Mountain retreat, Foodie tour, Art & culture, Nightlife
    -   Special requests and notes
-   **Structured Output:** Morning, afternoon, and evening activities for each day with location-specific recommendations.
-   **Smart Context:** AI considers user profile, travel styles, budget preferences, and trip details.

### 🗺️ Travel Management

-   **Local Storage:** SQLite database for itinerary metadata with offline-first approach.
-   **Swipe Actions:** Intuitive swipe-to-delete gesture on travel cards.
-   **Detailed View:** Expandable day-by-day schedule with time-of-day breakdown.
-   **Trip Overview:** Display key information like dates, budget, traveler count, and creation date.
-   **Travel History:** Access all saved trips from the home screen with recent trips highlighted.

### 👤 User Profile System

-   **Traveler Profile:** Name, age, home location, and trip wishlist.
-   **Travel Styles:** City breaks, Nature escapes, Culinary tours, Cultural deep dives, Adventure thrills, Wellness retreats, Family friendly.
-   **Budget Preference:** Value, Balanced, or Premium tier selection.
-   **Profile Integration:** User preferences automatically influence AI itinerary generation.
-   **Profile Management:** Update or clear profile data at any time.

### 💳 Monetization & Access Control

-   **Trial System:** New users receive one free AI-generated itinerary.
-   **Pro Subscription:** Unlimited itinerary generation via RevenueCat ($2.99/month).
-   **Custom API Key:** Users can bring their own Gemini API key for unlimited access, bypassing subscriptions.
-   **Access Flow:**
    The app intelligently checks for a custom API key first, then a Pro subscription, and finally trial credit before showing the promotion screen.
-   **Subscription Management:** 
    -   Purchase Pro subscription
    -   Restore previous purchases
    -   Manage/cancel subscription via platform store
-   **Subscription Status:** Real-time subscription verification and status display.

### ⚙️ Settings & Customization

-   **Theme System:** Light & Dark mode with automatic detection of system preference.
-   **API Key Management:** Securely enter, view, and remove custom Gemini API key locally.
-   **Data Management:** 
    -   Clear profile & settings
    -   Delete all itineraries
    -   Full app data reset
-   **Subscription Controls:** View status, restore purchases, upgrade to Pro, or manage subscription.
-   **App Information:** Version display, privacy policy, terms of service, and support contact.

### 🎨 Onboarding Experience

-   **Feature Highlights:** Introduction to AI itineraries, offline storage, and customization.
-   **Profile Creation:** Guided flow to build traveler profile for personalized recommendations.
-   **Skip Option:** Allow users to explore the app before completing profile.

------------------------------------------------------------------------

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Core Framework | React Native 0.81.4, Expo SDK 54, TypeScript | Cross-platform development and type safety |
| Navigation & Routing | Expo Router | File-based routing with native tabs |
| State Management | React Context API, Custom Hooks | Global state for settings, user profile, and subscriptions |
| AI & API Integration | @google/genai (Gemini Flash) | AI-powered travel itinerary generation |
| Storage & Persistence | Expo SQLite, AsyncStorage | Itinerary metadata, user settings, and profile data |
| Monetization | react-native-purchases (RevenueCat) | In-app subscriptions and purchase management |
| UI Components & Styling | NativeWind, Tailwind CSS | Modern styling with responsive design |
| Date & Time | @react-native-community/datetimepicker | Native date picker for iOS and Android |
| UX Enhancement | Expo Haptics, Expo Image | Tactile feedback and optimized image rendering |
| Developer Experience | ESLint, TypeScript, Expo Dev Client | Code quality, type checking, and custom builds |

------------------------------------------------------------------------

## 🏗 Architecture

Flidio follows a **feature-based, layered architecture** with clear separation of concerns to ensure maintainability and scalability.

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (Screens, Modals, Components, Navigation)  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Application Layer                   │
│  (Context Providers, Custom Hooks)          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           Service Layer                     │
│  (AI Service, Database, AsyncStorage)       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           Data Layer                        │
│  (SQLite, AsyncStorage, FileSystem)         │
└─────────────────────────────────────────────┘
```

### Layer Responsibilities

-   **Presentation Layer (app/, components/):** Renders UI, handles user input, manages navigation, and displays data.
-   **Application Layer (context/, hooks/):** Manages global state, encapsulates business logic, and provides reusable hooks.
-   **Service Layer (services/):** Handles API calls, database operations, and storage abstractions.
-   **Data Layer:** Manages underlying storage mechanisms (SQLite for itineraries, AsyncStorage for settings/profile).

------------------------------------------------------------------------

## 📁 Project Structure

```
flidio/
├── app/
│   ├── _layout.tsx                  # Root layout with providers
│   ├── index.tsx                    # Initial loading screen
│   ├── (tabs)/
│   │   ├── _layout.tsx              # Tab navigation layout
│   │   ├── home.tsx                 # Home screen with travel list
│   │   └── settings.tsx             # Settings and preferences
│   ├── travel/
│   │   └── [id].tsx                 # Travel detail screen (dynamic route)
│   ├── createTravelModal.tsx        # Trip creation form
│   ├── userProfileModal.tsx         # User profile editor
│   ├── onboardingScreen.tsx         # First-time user onboarding
│   └── promotionScreen.tsx          # Pro subscription promotion
├── assets/
│   ├── icons/                       # App icons and splash screens
│   └── images/                      # Static images
├── components/
│   └── ui/
│       └── BackgroundCircles.tsx    # Decorative background component
├── context/
│   ├── SettingsContext.tsx          # Settings state management
│   └── UserProfileContext.tsx       # User profile state management
├── hooks/
│   ├── useSettingsStorage.ts        # Settings persistence hook
│   └── useUserProfileStorage.ts     # Profile persistence hook
├── services/
│   ├── aiService.ts                 # Google Gemini AI integration
│   ├── databaseService.ts           # SQLite operations for travels
│   ├── asyncStorage.ts              # AsyncStorage wrapper
│   └── types.ts                     # Shared type definitions
├── utils/
│   └── formatPrompt.ts              # AI prompt formatting utility
├── app.json                         # Expo configuration
├── eas.json                         # EAS Build configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies and scripts
```

**File Naming Conventions**
- Screens: `camelCase.tsx`
- Components: `PascalCase.tsx`
- Hooks: `use*.ts`
- Services: `*Service.ts`
- Context: `*Context.tsx`

------------------------------------------------------------------------

## 🎨 Design Patterns

-   **Context + Hook Pattern:** Global state management through Context API with custom hooks for encapsulation.
-   **Service Layer Pattern:** Decouples UI from data logic with dedicated service modules.
-   **Repository Pattern:** Custom hooks orchestrate between storage layers and UI components.
-   **Singleton Pattern:** Shared SQLite database connection reused throughout the app.
-   **Provider Pattern:** Nested context providers for settings and user profile state.
-   **Adapter Pattern:** AsyncStorage service provides consistent interface for key-value storage.
-   **Factory Pattern:** Default settings and profile creation functions.

------------------------------------------------------------------------

## 🚀 Key Implementation Details

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS travels (
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

### AI Service Implementation

**API Endpoint:** Google Gemini Flash (`gemini-flash-latest`)

**Flow:**
1. Format structured prompt with user inputs and profile data
2. Send request to Gemini API with JSON response format
3. Parse AI-generated itinerary from JSON response
4. Store complete travel record in SQLite database
5. Display structured day-by-day plan in detail view

**Prompt Structure:**
- Base instructions for JSON format and rules
- User data: title, departure, destination, dates, budget, travelers
- Trip vibes and special requests
- User credentials: name, age, location, travel styles, bio
- Required output format with daily morning/afternoon/evening plans

**Error Handling:**
- Invalid API key detection (401/403 errors)
- Network error recovery
- JSON parsing validation
- User-friendly error messages

### Subscription & Access Control

```typescript
const canGenerateItinerary = async (): Promise<boolean> => {
  // 1. Check for custom API key
  if (settings?.aiApiKey?.trim()) return true;
  
  // 2. Check for Pro subscription
  const customerInfo = await Purchases.getCustomerInfo();
  if (customerInfo.entitlements.active["Flidio Pro"] || 
      customerInfo.activeSubscriptions.includes("flidio_monthly")) {
    return true;
  }
  
  // 3. Check for trial credit
  if (settings?.isTrialVersion && !settings?.trialCreditUsed) {
    return true;
  }
  
  // 4. Show promotion screen
  return false;
};
```

### AsyncStorage Key Management

**Storage Keys:**
- `@flidio:settings` - App settings (theme, API key, trial status)
- `@flidio:user-profile` - User profile data (name, age, preferences)

**Features:**
- Automatic JSON serialization/deserialization
- Namespaced keys with prefix
- Type-safe operations with generics
- Fallback value support

### Theme System

**Implementation:**
- Light and Dark mode with system preference detection
- Tailwind CSS custom color variables
- Dynamic class names based on theme state
- Consistent color palette across all screens

------------------------------------------------------------------------

## 🔧 Development Setup

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Expo CLI
-   Xcode (for iOS development)
-   Android Studio (for Android development)

### Installation

```bash
git clone https://github.com/bugrarslan/flidio.git
cd flidio
npm install
```

### Environment Configuration

Create environment variables in your development environment:

```bash
EXPO_PUBLIC_GOOGLE_AI_KEY=your_gemini_api_key_here
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=your_ios_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_android_key_here
```

### Running the App

**Development mode:**
```bash
npm start
# or
npx expo start
```

**Native development builds:**
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

**Linting:**
```bash
npm run lint
```

------------------------------------------------------------------------

## 📦 Building & Deployment

Uses **EAS (Expo Application Services)** for production builds.

### Initial Setup

```bash
npm install -g eas-cli
eas login
```

### Building

```bash
# Development build
eas build --profile development --platform all

# Preview build
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all
```

### Submission

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### EAS Configuration

Build profiles defined in `eas.json`:
- **development**: Development client with internal distribution
- **preview**: Internal testing build
- **production**: App Store/Play Store release with auto-increment version

------------------------------------------------------------------------

## 📄 License

This project is proprietary software.
All rights reserved.
© 2025 Bugra Arslan

------------------------------------------------------------------------

## 📞 Support

For issues, questions, or feedback:

**Email:** bugra.arslan7@outlook.com

**Privacy Policy:** https://flidio.vercel.app/privacy

**Terms of Service:** https://flidio.vercel.app/terms

Built with ❤️ using React Native, Expo, and Google Gemini AI.
