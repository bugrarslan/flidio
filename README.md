# Flidio: AI-Powered Travel Planner

## 📄 Overview
**Flidio** is an intelligent travel planning mobile application built with React Native and Expo. The app leverages AI technology (Google Generative AI) to create personalized travel itineraries based on user preferences and requirements. All user data is stored locally using SQLite for privacy and offline access.

**Why this application?**
1. Demonstrate proficiency with React Native, Expo, and TypeScript development.
2. Showcase integration of AI services for dynamic content generation.
3. Implement local data persistence with SQLite database.
4. Create intuitive UX with onboarding, modal screens, and tab navigation.
5. Apply modern styling techniques with NativeWind (Tailwind CSS for React Native).

---

## 🎯 Core Features

### 1. **Onboarding Experience**
- First-time user onboarding screen with app introduction
- One-time setup process for new users
- Smooth transition to main application after completion

### 2. **User Profile Management**
- Modal screen for collecting user information:
  - Name, age, location
  - Travel preferences and interests
- Local storage using Expo SQLite
- Profile data used for personalized travel recommendations

### 3. **Travel Management**
- **Home Tab**: Display list of created travel plans
  - Swipe-to-delete functionality for travel items
  - Visual cards showing trip summaries
- **Create Travel Plans**: Modal interface for trip planning
  - Input fields for destination, dates, budget, preferences
  - AI-powered itinerary generation via Google Generative AI
  - JSON response parsing and local storage

### 4. **Settings & Configuration**
- **Settings Tab** with comprehensive options:
  - AI API key configuration input
  - Privacy policy and terms of service
  - Theme switching (light/dark mode)
  - Clear all data functionality
  - App version and credits

---

## 🧰 Tech Stack & Architecture

### **Core Technologies**
1. **React Native + Expo + TypeScript**
   - Expo SDK for cross-platform development
   - TypeScript for type safety and better developer experience
   - Functional components with React Hooks

2. **Database & Storage**
   - **Expo SQLite**: Local database for user profiles and travel data
   - Offline-first architecture for data persistence
   - Database schema for users, travels, and settings tables

3. **AI Integration**
   - **Google Generative AI**: LLM integration for travel planning
   - JSON-structured responses for itinerary data
   - Prompt engineering for optimal travel recommendations

4. **Styling & UI**
   - **NativeWind**: Tailwind CSS utilities for React Native
   - Custom color scheme and sizing in `tailwind.config.js`
   - Reusable components for buttons, cards, and UI elements

5. **State Management**
   - **React Context API**: Global state management
   - Context providers for user data, travel plans, and app settings
   - Custom hooks for database operations and API calls

### **Project Structure**
```
flidio/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── travel/
│   │   ├── TravelCard.tsx
│   │   ├── TravelList.tsx
│   │   └── CreateTravelModal.tsx
│   └── settings/
│       ├── SettingsItem.tsx
│       └── ThemeToggle.tsx
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   └── settings.tsx
│   ├── travel/
│   │   └── [id].tsx
│   ├── userProfileModal.tsx
│   ├── createTravelModal.tsx
│   └── onboardingScreen.tsx
├── context/
│   ├── UserContext.tsx
│   ├── TravelContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   ├── useDatabase.ts
│   ├── useAI.ts
│   └── useLocalStorage.ts
├── services/
│   ├── database.ts
│   ├── aiService.ts
│   └── types.ts
├── constants/
│   ├── Colors.ts
│   └── Sizes.ts
└── utils/
    ├── validation.ts
    └── formatters.ts
```

---

## 🚀 Key Implementation Details

### **Database Schema**
```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  location TEXT,
  preferences TEXT, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Travels table
CREATE TABLE travels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  budget REAL,
  itinerary TEXT, -- JSON string from AI
  user_input TEXT, -- Original user requirements
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### **AI Integration Flow**
1. User inputs travel requirements in modal
2. Construct prompt with user preferences and trip details
3. Send request to Google Generative AI
4. Parse JSON response containing:
   - Daily itineraries
   - Recommended activities
   - Budget breakdown
   - Local tips and suggestions
5. Store both user input and AI response in SQLite

### **Navigation Structure**
```tsx
// Tab Navigator
<Tabs screenOptions={{headerShown: false}}>
  <Tabs.Screen name="home"/>
  <Tabs.Screen name="settings"/>
</Tabs>

// App Stack
<Stack screenOptions={{headerShown: false}}>
  <Stack.Screen name="(tabs)"/>
  <Stack.Screen name="travel/[id]"/>
  <Stack.Screen name="userProfileModal"/>
  <Stack.Screen name="createTravelModal"/>
  <Stack.Screen name="onboardingScreen"/>
</Stack>
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

### **Reusable Components**
- `Button`: Primary, secondary, and danger variants
- `Card`: Travel item display with consistent styling
- `Input`: Form inputs with validation states
- `Modal`: Consistent modal wrapper with animations

---

## 📱 User Experience Flow

1. **First Launch**: Onboarding screens introduce the app
2. **Profile Setup**: Modal to collect user information
3. **Home Screen**: View existing travels, create new ones
4. **Travel Creation**: Modal with form → AI processing → Save to database
5. **Travel Management**: Swipe gestures for deletion
6. **Settings**: Configure API keys, themes, and app preferences

---

## 🔧 Development Setup

### **Prerequisites**
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator
- Google Generative AI API key

### **Installation**
```bash
npm install
```

### **Environment Setup**
Create `.env` file:
```
EXPO_PUBLIC_GOOGLE_AI_KEY=your_api_key_here
```

### **Running the App**
```bash
npx expo start
```

---

## 🕹️ Evaluation Criteria

| Feature                     | Implementation Details                        |
|-----------------------------|----------------------------------------------|
| **TypeScript Integration**  | Proper typing for props, state, and API responses |
| **Database Operations**     | CRUD operations with error handling and transactions |
| **AI Service Integration** | Robust prompt engineering and response parsing |
| **UI/UX Design**           | Consistent design system with NativeWind |
| **State Management**       | Efficient Context usage with proper re-render optimization |
| **Code Organization**      | Modular structure with reusable components |
| **Performance**            | Optimized list rendering and smooth animations |

