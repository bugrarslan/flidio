import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSettingsContext } from "@/context/SettingsContext";

const FEATURE_HIGHLIGHTS = [
  {
    icon: "sparkles-outline",
    title: "AI-crafted itineraries",
    description: "Build bespoke day-by-day plans powered by Google Generative AI in seconds.",
  },
  {
    icon: "map-outline",
    title: "Offline travel vault",
    description: "Save every trip locally with SQLite so your adventures stay private and accessible offline.",
  },
  {
    icon: "color-palette-outline",
    title: "Made for your vibe",
    description: "Switch themes, tailor preferences, and let Flidio adapt to the way you travel.",
  },
] as const;

const OnboardingScreen = () => {
  const router = useRouter();
  const { updateSettings } = useSettingsContext();
  const { settings } = useSettingsContext();

  const isDarkMode = settings?.theme === "dark";
  const backgroundClass = isDarkMode ? "bg-background-dark" : "bg-primary-900";
  const statusBarStyle: "light" | "dark" | "auto" = isDarkMode ? "light" : "light";
  const primaryCircleClass = isDarkMode ? "bg-primary-600/35" : "bg-primary-600/60";
  const secondaryCircleClass = isDarkMode ? "bg-secondary-500/35" : "bg-secondary-500/45";
  const cardBorderClass = isDarkMode ? "border-border-dark" : "border-white/15";
  const cardBackgroundClass = isDarkMode ? "bg-card-dark/80" : "bg-white/10";
  const headingTextClass = isDarkMode ? "text-text-primary-dark" : "text-white";
  const bodyTextClass = isDarkMode ? "text-text-secondary-dark" : "text-secondary-50/90";
  const featureIconWrapperClass = isDarkMode ? "bg-primary-600/30" : "bg-primary-600/60";
  const primaryButtonBackground = isDarkMode ? "bg-accent-light" : "bg-white";
  const primaryButtonTextClass = isDarkMode ? "text-accent-text-light" : "text-primary-600";
  const primaryButtonIconColor = isDarkMode ? "#2563eb" : "#2563eb";
  const secondaryButtonTextClass = isDarkMode ? "text-accent-text-muted-dark" : "text-secondary-50/90";

  const markOnboardingComplete = useCallback(async () => {
    try {
      await updateSettings({ showOnboarding: false });
    } catch (error) {
      console.error("[onboarding] Failed to mark onboarding complete", error);
    }
  }, [updateSettings]);

  const handleGetStarted = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // await markOnboardingComplete();
    router.push("/userProfileModal");
  }, [markOnboardingComplete, router]);

  const handleSkip = useCallback(async () => {
    await Haptics.selectionAsync();
    await markOnboardingComplete();
    router.replace("/(tabs)/home");
  }, [markOnboardingComplete, router]);

  return (
    <SafeAreaView className={`flex-1 ${backgroundClass}`}>
      <StatusBar style={statusBarStyle} />

      {/* Background decorative circles */}
      <View className="absolute inset-0">
        <View className={`absolute w-56 h-56 rounded-full -top-16 -right-16 ${primaryCircleClass}`} />
        <View className={`absolute w-64 h-64 rounded-full bottom-24 -left-10 ${secondaryCircleClass}`} />
      </View>

      <View className="flex-1 px-6">
        <View className="mt-12">
          <View className="overflow-hidden border rounded-3xl border-white/15 bg-white/10">
            <Image
              source={require("../assets/images/react-logo.png")}
              className="w-full h-56"
              contentFit="cover"
            />
          </View>
        </View>

        <View className="flex-1 mt-10">
          <Text className={`text-4xl font-bold leading-tight ${headingTextClass}`}>
            Plan unforgettable journeys
          </Text>
          <Text className={`mt-4 text-base ${bodyTextClass}`}>
            Meet Flidio—your AI-powered co-pilot for curated escapes, thoughtful details, and effortless planning.
          </Text>

          <View className="gap-4 mt-8 space-y-5">
            {FEATURE_HIGHLIGHTS.map((feature) => (
              <View
                key={feature.title}
                className={`flex-row items-start gap-4 p-4 border rounded-2xl ${cardBorderClass} ${cardBackgroundClass}`}
              >
                <View className={`p-3 rounded-full ${featureIconWrapperClass}`}>
                  <Ionicons
                    name={feature.icon}
                    size={24}
                    color={isDarkMode ? "#e2e8f0" : "white"}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${headingTextClass}`}>{feature.title}</Text>
                  <Text className={`mt-1 text-sm ${bodyTextClass}`}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="pb-10">
          <Pressable
            onPress={handleGetStarted}
            className={`overflow-hidden rounded-full ${primaryButtonBackground}`}
          >
            <View className="flex-row items-center justify-center gap-2 px-6 py-4">
              <Text className={`text-base font-semibold ${primaryButtonTextClass}`}>
                Get started
              </Text>
              <Ionicons name="arrow-forward" size={20} color={primaryButtonIconColor} />
            </View>
          </Pressable>

          <Pressable onPress={handleSkip} className="items-center mt-4">
            <Text className={`text-sm font-medium ${secondaryButtonTextClass}`}>
              Preview the app first
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;