import "@/global.css";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/onboardingScreen");
    }, 1000);

    return () => clearTimeout(timeout);
  }, [router]);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="travel/[id]" />
      <Stack.Screen name="userProfileModal" options={{ presentation: "modal" }} />
      <Stack.Screen name="createTravelModal" options={{ presentation: "modal" }} />
      <Stack.Screen name="onboardingScreen" />
    </Stack>
  );
}
