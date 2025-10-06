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
  const { loading, shouldShowOnboarding, updateSettings } = useSettingsContext();
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

    getCustomerInfo();

    const targetRoute = shouldShowOnboarding ? "/onboardingScreen" : "/home";

    if (previousTargetRef.current === targetRoute) {
      return;
    }

    previousTargetRef.current = targetRoute;
    router.replace(targetRoute);
  }, [loading, shouldShowOnboarding, router]);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasProSubscription = typeof customerInfo.entitlements.active["Flidio Pro"] !== "undefined" ||
                                 customerInfo.activeSubscriptions.includes("flidio_monthly");
    if (hasProSubscription) {
      console.log("User has an active Pro subscription.");
      try {
        await updateSettings({ isTrialVersion: false });
      } catch (error) {
        console.error("[settings] Failed to update Pro status", error);
      }
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
