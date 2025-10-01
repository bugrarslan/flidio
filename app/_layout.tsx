import "@/global.css";

import { SettingsProvider, useSettingsContext } from "@/context/SettingsContext";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";

const RootNavigator = () => {
  const router = useRouter();
  const { loading, shouldShowOnboarding } = useSettingsContext();
  const previousTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    const targetRoute = shouldShowOnboarding ? "/onboardingScreen" : "/home";

    if (previousTargetRef.current === targetRoute) {
      return;
    }

    previousTargetRef.current = targetRoute;
    router.replace(targetRoute);
  }, [loading, shouldShowOnboarding, router]);

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
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RootNavigator />
    </SettingsProvider>
  );
}
