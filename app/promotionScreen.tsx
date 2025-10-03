import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSettingsContext } from "@/context/SettingsContext";

const PROMO_FEATURES = [
  {
    icon: "flash-outline",
    title: "Instant inspiration",
    description:
      "Spin up curated day plans with premium AI models tuned for travel delight.",
  },
  {
    icon: "layers-outline",
    title: "Unlimited itineraries",
    description:
      "Save every itinerary with rich notes, offline access, and seamless syncing soon.",
  },
  {
    icon: "color-wand-outline",
    title: "Personalized insights",
    description:
      "Unlock travel style recommendations built around your preferences and mood.",
  },
] as const;

const PromotionScreen = () => {
  const router = useRouter();
  const { settings } = useSettingsContext();

  const isDarkMode = settings?.theme === "dark";
  const backgroundClass = isDarkMode ? "bg-background-dark" : "bg-primary-900";
  const statusBarStyle: "light" | "dark" | "auto" = isDarkMode ? "light" : "light";
  const primaryCircleClass = isDarkMode ? "bg-primary-600/35" : "bg-primary-600/55";
  const secondaryCircleClass = isDarkMode ? "bg-secondary-500/35" : "bg-secondary-500/45";
  const accentCircleClass = isDarkMode ? "bg-primary-400/25" : "bg-primary-300/35";
  const cardBorderClass = isDarkMode ? "border-border-dark" : "border-white/10";
  const cardBackgroundClass = isDarkMode ? "bg-card-dark/85" : "bg-white/10";
  const headingTextClass = isDarkMode ? "text-text-primary-dark" : "text-white";
  const bodyTextClass = isDarkMode ? "text-text-secondary-dark" : "text-secondary-50/90";
  const featureIconWrapperClass = isDarkMode ? "bg-primary-500/25" : "bg-primary-600/60";
  const calloutBackgroundClass = isDarkMode ? "bg-card-dark/90" : "bg-white/15";
  const calloutBorderClass = isDarkMode ? "border-border-dark" : "border-white/15";
  const primaryButtonBackground = isDarkMode ? "bg-accent-light" : "bg-white";
  const primaryButtonTextClass = isDarkMode ? "text-accent-text-light" : "text-primary-600";
  const primaryButtonIconColor = "#2563eb";
  const secondaryButtonTextClass = isDarkMode ? "text-accent-text-muted-dark" : "text-secondary-50/90";

  const handleUnlockPro = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Flidio Pro coming soon",
      "We're polishing the checkout experience. In the meantime, explore the app and keep planning!",
      [
        {
          text: "Explore",
          onPress: () => router.replace("/(tabs)/home"),
        },
        { text: "Close", style: "cancel" },
      ]
    );
  }, [router]);

  const handleMaybeLater = useCallback(async () => {
    await Haptics.selectionAsync();
    router.replace("/(tabs)/home");
  }, [router]);

  return (
    <SafeAreaView className={`flex-1 ${backgroundClass}`}>
      <StatusBar style={statusBarStyle} />

      {/* Background decorative circles */}
      <View className="absolute inset-0">
        <View className={`absolute w-60 h-60 rounded-full -top-20 -right-10 ${primaryCircleClass}`} />
        <View className={`absolute w-64 h-64 rounded-full bottom-14 -left-12 ${secondaryCircleClass}`} />
        <View className={`absolute w-48 h-48 rounded-full bottom-1/3 right-10 ${accentCircleClass}`} />
      </View>

      <View className="flex-1 px-6">
        <View className="flex-row items-center justify-between pt-6">
          <Text className={`text-sm font-semibold uppercase tracking-[0.25em] ${bodyTextClass}`}>
            Flidio Pro
          </Text>
          <Pressable onPress={handleMaybeLater} className="px-2 py-1">
            <Text className={`text-sm font-medium ${secondaryButtonTextClass}`}>Skip</Text>
          </Pressable>
        </View>

        <View className="flex-1 mt-8">
          <Text className={`text-4xl font-bold leading-tight ${headingTextClass}`}>
            Elevate every getaway
          </Text>
          <Text className={`mt-4 text-base ${bodyTextClass}`}>
            Upgrade to Flidio Pro for limitless itineraries, deeper personalization, and premium AI extras designed for explorers like you.
          </Text>

          <View
            className={`mt-6 border rounded-3xl px-5 py-4 flex-row items-center gap-4 ${calloutBorderClass} ${calloutBackgroundClass}`}
          >
            <View className={`p-3 rounded-full ${featureIconWrapperClass}`}>
              <Ionicons name="diamond-outline" size={26} color={isDarkMode ? "#bfdbfe" : "#1d4ed8"} />
            </View>
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${headingTextClass}`}>Intro launch deal</Text>
              <Text className={`mt-1 text-sm ${bodyTextClass}`}>
                Early supporters lock in lifetime Pro perks at a friendly founder rate.
              </Text>
            </View>
          </View>

          <View className="gap-4 mt-8 space-y-5">
            {PROMO_FEATURES.map((feature) => (
              <View
                key={feature.title}
                className={`flex-row items-start gap-4 p-4 border rounded-2xl ${cardBorderClass} ${cardBackgroundClass}`}
              >
                <View className={`p-3 rounded-full ${featureIconWrapperClass}`}>
                  <Ionicons name={feature.icon as keyof typeof Ionicons.glyphMap} size={24} color={isDarkMode ? "#e2e8f0" : "white"} />
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
            onPress={handleUnlockPro}
            className={`overflow-hidden rounded-full ${primaryButtonBackground}`}
          >
            <View className="flex-row items-center justify-center gap-2 px-6 py-4">
              <Text className={`text-base font-semibold ${primaryButtonTextClass}`}>
                Unlock Flidio Pro
              </Text>
              <Ionicons name="arrow-forward" size={20} color={primaryButtonIconColor} />
            </View>
          </Pressable>

          <Pressable onPress={handleMaybeLater} className="items-center mt-4">
            <Text className={`text-sm font-medium ${secondaryButtonTextClass}`}>
              Maybe later
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PromotionScreen;