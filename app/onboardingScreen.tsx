import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSettingsContext } from "@/context/SettingsContext";
import { getThemePalette } from "@/utils/themePalette";

const FEATURE_HIGHLIGHTS = [
  {
    icon: "sparkles-outline",
    title: "AI-crafted itineraries",
    description:
      "Build bespoke day-by-day plans powered by Google Generative AI in seconds.",
  },
  {
    icon: "map-outline",
    title: "Offline travel vault",
    description:
      "Save every trip locally with SQLite so your adventures stay private and accessible offline.",
  },
  {
    icon: "color-palette-outline",
    title: "Made for your vibe",
    description:
      "Switch themes, tailor preferences, and let Flidio adapt to the way you travel.",
  },
] as const;

const OnboardingScreen = () => {
  const router = useRouter();
  const { updateSettings, settings } = useSettingsContext();

  const isDarkMode = settings?.theme === "dark";
  const themePalette = getThemePalette(settings?.theme);
  const statusBarStyle: "light" | "dark" | "auto" = isDarkMode
    ? "light"
    : "light";
  const primaryButtonBackground = isDarkMode ? "bg-accent-light" : "bg-white";
  const primaryButtonTextClass = isDarkMode
    ? "text-accent-text-light"
    : "text-primary-600";
  const headingTextClass = isDarkMode ? themePalette.textPrimary : "text-white";
  const bodyTextClass = isDarkMode
    ? themePalette.textSecondary
    : "text-secondary-50/90";
  const secondaryButtonTextClass = isDarkMode
    ? themePalette.textAccentMuted
    : "text-secondary-50/90";
  const iconColor = isDarkMode ? "#e2e8f0" : "white";

  const handleGetStarted = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // try {
    //   await updateSettings({ showOnboarding: false });
    // } catch (error) {
    //   console.error("[onboarding] Failed to mark onboarding complete", error);
    // }
    router.push("/userProfileModal");
  };

  const handleSkip = useCallback(async () => {
    await Haptics.selectionAsync();
    try {
      await updateSettings({ showOnboarding: false });
    } catch (error) {
      console.error("[onboarding] Failed to mark onboarding complete", error);
    }
    router.replace("/(tabs)/home");
  }, [router, updateSettings]);

  return (
    <SafeAreaView className={`flex-1 ${themePalette.onboardingBackground}`}>
      <StatusBar style="auto" />

      {/* Background decorative circles */}
      <View className="absolute inset-0">
        <View
          className={`absolute w-56 h-56 rounded-full -top-16 -right-16 ${themePalette.onboardingCirclePrimary}`}
        />
        <View
          className={`absolute w-64 h-64 rounded-full bottom-24 -left-10 ${themePalette.onboardingCircleSecondary}`}
        />
      </View>

      <View className="flex-1 px-6">

        <View className="flex-1 mt-10">
          <Text
            className={`text-4xl font-bold leading-tight ${headingTextClass}`}
          >
            Plan unforgettable journeys
          </Text>
          <Text className={`mt-4 text-base ${bodyTextClass}`}>
            Meet Flidio—your AI-powered co-pilot for curated escapes, thoughtful
            details, and effortless planning.
          </Text>

          <View className="gap-4 mt-8 space-y-5">
            {FEATURE_HIGHLIGHTS.map((feature) => (
              <View
                key={feature.title}
                className={`flex-row items-start gap-4 p-4 border rounded-2xl ${themePalette.onboardingCardBorder} ${themePalette.onboardingCardBackground}`}
              >
                <View className={`p-3 rounded-full ${themePalette.onboardingIconWrapper}`}>
                  <Ionicons
                    name={feature.icon}
                    size={24}
                    color={iconColor}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${headingTextClass}`}>
                    {feature.title}
                  </Text>
                  <Text className={`mt-1 text-sm ${bodyTextClass}`}>
                    {feature.description}
                  </Text>
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
              <Text
                className={`text-base font-semibold ${primaryButtonTextClass}`}
              >
                Get started
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={themePalette.iconAccent}
              />
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
