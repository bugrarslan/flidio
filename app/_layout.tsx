import "@/global.css";

import {
  SettingsProvider,
  useSettingsContext,
} from "@/context/SettingsContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";

const RootNavigator = () => {
  const router = useRouter();
  const { loading, shouldShowOnboarding } = useSettingsContext();
  const previousTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (Platform.OS === "ios") {
      if (!process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY) {
        console.log(
          "RevenueCat Apple API Key is not set in environment variables."
        );
        return;
      }
      Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY,
      });
    }

    const targetRoute = shouldShowOnboarding ? "/onboardingScreen" : "/home";

    if (previousTargetRef.current === targetRoute) {
      return;
    }

    getCustomerInfo();
    getOfferings();

    previousTargetRef.current = targetRoute;
    router.replace(targetRoute);
  }, [loading, shouldShowOnboarding, router]);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log("Customer Info:", JSON.stringify(customerInfo, null, 2));
  }

  async function getOfferings() {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      console.log("Offerings:", JSON.stringify(offerings, null, 2));
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="travel/[id]" />
      <Stack.Screen
        name="userProfileModal"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="createTravelModal"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="onboardingScreen" />
      <Stack.Screen name="promotionScreen" options={{ presentation: "modal" }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <SettingsProvider>
      <UserProfileProvider>
        <RootNavigator />
      </UserProfileProvider>
    </SettingsProvider>
  );
}
