import "@/global.css";

import {
  SettingsProvider,
  useSettingsContext,
} from "@/context/SettingsContext";
import { UserProfileProvider } from "@/context/UserProfileContext";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import Purchases from "react-native-purchases";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "@/context/SubscriptionContext";
import { AuthService } from "@/services/supabase/auth/authSerivce";
import type { Session } from "@supabase/supabase-js";

const RootNavigator = () => {
  const router = useRouter();
  const { loading: subscriptionLoading, isPro } = useSubscriptionContext();
  const previousTargetRef = useRef<string | null>(null);
  const hasConfiguredPurchasesRef = useRef(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Configure RevenueCat for both iOS and Android
  useEffect(() => {
    if (hasConfiguredPurchasesRef.current) {
      return;
    }

    void configureRevenueCat();
  }, []);

  // Check initial session and listen to auth state changes
  useEffect(() => {
    let mounted = true;

    // Get initial session
    AuthService.getSession().then((initialSession) => {
      if (mounted) {
        setSession(initialSession);
        setAuthLoading(false);
      }
    });

    // Listen to auth state changes
    const { data: authListener } = AuthService.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        if (mounted) {
          setSession(currentSession);
          setAuthLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Navigate based on auth state
  useEffect(() => {
    if (authLoading || subscriptionLoading) {
      return;
    }

    const targetRoute = session ? "/(tabs)/home" : "/(auth)";
    console.log("🚀 ~ RootNavigator ~ session:", session)
    
    // Avoid unnecessary navigation if we're already at the target
    if (previousTargetRef.current !== targetRoute) {
      previousTargetRef.current = targetRoute;
      router.replace(targetRoute as any);
    }
  }, [authLoading, subscriptionLoading, session, router]);

  const configureRevenueCat = async () => {
    try {
      // Haptic feedback: Start loading
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      let apiKey: string | undefined;

      if (Platform.OS === "ios") {
        apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
        if (!apiKey) {
          console.warn(
            "RevenueCat iOS API Key is not set in environment variables."
          );
          hasConfiguredPurchasesRef.current = true;
          return;
        }
      } else if (Platform.OS === "android") {
        apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
        if (!apiKey) {
          console.warn(
            "RevenueCat Android API Key is not set in environment variables."
          );
          hasConfiguredPurchasesRef.current = true;
          return;
        }
      } else {
        // Web or other platforms - skip configuration
        hasConfiguredPurchasesRef.current = true;
        return;
      }

      Purchases.configure({
        apiKey,
      });

      // Set debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      hasConfiguredPurchasesRef.current = true;
      console.log(`RevenueCat configured successfully for ${Platform.OS}`);

      // Haptic feedback: Success
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to configure RevenueCat:", error);
      hasConfiguredPurchasesRef.current = true; // Mark as attempted to avoid infinite retries

      // Haptic feedback: Error
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="travel/[id]" />
      <Stack.Screen
        name="userProfileModal"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="createTravelModal"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="promotionScreen"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <SettingsProvider>
      <UserProfileProvider>
        <SubscriptionProvider>
          <RootNavigator />
        </SubscriptionProvider>
      </UserProfileProvider>
    </SettingsProvider>
  );
}
