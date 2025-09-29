import "@/global.css";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      router.replace("/onboardingScreen");
    }, 1000);
  }, []);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="travel/[id]" />
      <Stack.Screen name="userProfileModal" />
      <Stack.Screen name="createTravelModal" />
      <Stack.Screen name="onboardingScreen" />
    </Stack>
  );
}
