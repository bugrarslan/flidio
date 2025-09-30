import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const handleGetStarted = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/userProfileModal");
  }, [router]);

  const handleSkip = useCallback(async () => {
    await Haptics.selectionAsync();
    router.replace("/home");
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-primary-900">
      <StatusBar style="light" />

      <View className="absolute inset-0">
        <View className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-primary-600/60" />
        <View className="absolute w-64 h-64 rounded-full bottom-24 -left-10 bg-secondary-500/45" />
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
          <Text className="text-4xl font-bold leading-tight text-white">Plan unforgettable journeys</Text>
          <Text className="mt-4 text-base text-secondary-50/90">
            Meet Flidio—your AI-powered co-pilot for curated escapes, thoughtful details, and effortless planning.
          </Text>

          <View className="gap-4 mt-8 space-y-5">
            {FEATURE_HIGHLIGHTS.map((feature) => (
              <View
                key={feature.title}
                className="flex-row items-start gap-4 p-4 border rounded-2xl border-white/15 bg-white/10"
              >
                <View className="p-3 rounded-full bg-primary-600/60">
                  <Ionicons name={feature.icon} size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-white">{feature.title}</Text>
                  <Text className="mt-1 text-sm text-secondary-50/90">{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="pb-10">
          <Pressable onPress={handleGetStarted} className="overflow-hidden bg-white rounded-full">
            <View className="flex-row items-center justify-center gap-2 px-6 py-4">
              <Text className="text-base font-semibold text-primary-600">Get started</Text>
              <Ionicons name="arrow-forward" size={20} color="#2563eb" />
            </View>
          </Pressable>

          <Pressable onPress={handleSkip} className="items-center mt-4">
            <Text className="text-sm font-medium text-secondary-50/90">Preview the app first</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;