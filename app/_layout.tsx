import "@/global.css";
import type { StoredSettings } from "@/hooks/useSettingsStorage";
import { asyncStorageService, storageKeys } from "@/services/asyncStorage";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const bootstrap = async () => {
      try {
        const settings = await asyncStorageService.getItem<StoredSettings>(
          storageKeys.settings
        );
        if (!isActive) {
          console.log("Component unmounted, aborting navigation");
          return;
        }

        console.log("Loaded settings:", settings);
        const shouldShowOnboarding = settings?.showOnboarding ?? true;
        if (shouldShowOnboarding) {
          console.log("Navigating to onboarding screen");
          router.replace("/onboardingScreen");
        } else {
          console.log("Navigating to home screen");
          router.replace("/home");
        }
      } catch {
        console.error("[layout] Failed to load settings");
        if (isActive) {
          console.log("Navigating to onboarding screen");
          router.replace("/onboardingScreen");
        }
      }
    };

    void bootstrap();

    return () => {
      isActive = false;
    };
  }, [router]);
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
}
