import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSettingsContext } from "@/context/SettingsContext";

const PROMO_FEATURES = [
  {
    icon: "flash-outline",
    title: "Instant inspiration",
    description:
      "Spin up premium AI itineraries in under 60 seconds tailored to your vibe.",
  },
  {
    icon: "cloud-download-outline",
    title: "Offline vault",
    description:
      "Auto-sync trips for offline access, flight notes, and packing checklists.",
  },
  {
    icon: "color-wand-outline",
    title: "Personalized insights",
    description:
      "Enjoy recommendations based on your travel styles, budget, and wishlist.",
  },
  {
    icon: "sparkles-outline",
    title: "Premium concierge",
    description:
      "Unlock upcoming chat-based planning with live destination experts.",
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
  const heroBadgeBackgroundClass = isDarkMode ? "bg-primary-500/20" : "bg-white/15";
  const heroBadgeBorderClass = isDarkMode ? "border border-primary-400/40" : "border border-white/25";
  const priceCardBackgroundClass = isDarkMode ? "bg-card-dark/95" : "bg-white/95";
  const priceCardBorderClass = isDarkMode ? "border border-primary-500/25" : "border border-white/40";
  const priceTextClass = isDarkMode ? "text-accent-text-light" : "text-primary-700";
  const priceSubTextClass = isDarkMode ? "text-text-secondary-dark" : "text-secondary-600";
  const statCardBackgroundClass = isDarkMode ? "bg-primary-600/15" : "bg-white/15";
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

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between pt-6">
          <Text className={`text-sm font-semibold uppercase tracking-[0.25em] ${bodyTextClass}`}>
            Flidio Pro
          </Text>
          <Pressable onPress={handleMaybeLater} className="px-2 py-1">
            <Text className={`text-sm font-medium ${secondaryButtonTextClass}`}>Skip</Text>
          </Pressable>
        </View>

        <View className="mt-8">
          <Text className={`text-[34px] font-bold leading-tight ${headingTextClass}`}>
            Elevate every getaway
          </Text>
          <Text className={`mt-4 text-base leading-relaxed ${bodyTextClass}`}>
            Unlock Flidio Pro for limitless itineraries, concierge-level AI, and premium tools built to help you dream, plan, and book faster than ever.
          </Text>

          <View
            className={`self-start px-4 py-2 mt-5 rounded-full flex-row items-center gap-2 ${heroBadgeBackgroundClass} ${heroBadgeBorderClass}`}
          >
            <Ionicons name="sparkles" size={16} color={isDarkMode ? "#bfdbfe" : "#dbeafe"} />
            <Text className={`text-xs font-semibold uppercase tracking-[0.35em] ${bodyTextClass}`}>
              Limited launch bonus
            </Text>
          </View>

          <View className={`mt-6 rounded-3xl p-[22px] ${priceCardBackgroundClass} ${priceCardBorderClass}`}>
            <View className="flex-row items-end justify-between">
              <View>
                <Text className={`text-xs font-semibold uppercase tracking-[0.35em] ${bodyTextClass}`}>
                  Launch offer
                </Text>
                <View className="flex-row items-baseline gap-3 mt-3">
                  <Text className={`text-5xl font-bold ${priceTextClass}`}>$2.99</Text>
                  <Text className={`text-sm uppercase tracking-[0.35em] ${priceSubTextClass}`}>
                    / month
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className={`text-sm font-semibold ${priceSubTextClass}`}>Normally</Text>
                <Text className={`text-lg font-bold line-through ${priceSubTextClass}`}>$3.99</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2 mt-6">
              <Ionicons name="shield-checkmark" size={18} color={primaryButtonIconColor} />
              <Text className={`text-xs font-medium ${priceSubTextClass}`}>
                Cancel anytime • Founders get lifetime rate protection
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
                  <Ionicons
                    name={feature.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={isDarkMode ? "#e2e8f0" : "white"}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${headingTextClass}`}>{feature.title}</Text>
                  <Text className={`mt-1 text-sm leading-relaxed ${bodyTextClass}`}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="pt-8 pb-10">
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

          <View className="items-center gap-2 mt-4">
            <Pressable onPress={handleMaybeLater} className="items-center">
              <Text className={`text-sm font-medium ${secondaryButtonTextClass}`}>
                Maybe later
              </Text>
            </Pressable>
            <Text className={`text-[11px] uppercase tracking-[0.35em] ${secondaryButtonTextClass}`}>
              No charges until your trial ends
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PromotionScreen;