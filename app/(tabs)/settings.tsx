import {
  Alert,
  Button,
  Linking,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { getThemePalette } from "@/utils/themePalette";
import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { StatusBar } from "expo-status-bar";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import {
  SettingsCard,
  SettingsCardAction,
  SettingsCardListItem,
} from "@/components/ui/SettingsCard";
import { AuthService } from "@/services/supabase/auth/authSerivce";


const SUPPORT_LINKS = [
  {
    label: "Privacy policy",
    icon: "shield-checkmark-outline",
    url: "https://flidio.vercel.app/privacy",
  },
  {
    label: "Terms of service",
    icon: "document-text-outline",
    url: "https://flidio.vercel.app/terms",
  },
  {
    label: "Contact support",
    icon: "chatbubble-ellipses-outline",
    url: "mailto:bugra.arslan7@outlook.com",
  },
] as const;

const Settings = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const {
    loading: subscriptionLoading,
    isPro,
    restorePurchases,
    manageSubscription,
    processing: subscriptionProcessing,
    error: subscriptionError,
  } = useSubscriptionContext();

  const themePalette = getThemePalette(colorScheme ?? 'light');

  const appVersion = useMemo(() => {
    return Constants.expoConfig?.version ?? "1.0.0";
  }, []);

  const handleOpenLink = async (url: string) => {
    await Haptics.selectionAsync();
    Linking.openURL(url).catch(() => {
      Alert.alert(
        "Something went wrong",
        "Could not open the requested link. Please try again later."
      );
    });
  };

  const handleRestorePurchases = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const restoredInfo = await restorePurchases();

      if (isPro) {
        console.log("Purchases restored successfully. User is now premium.");
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Alert.alert(
          "Purchases Restored",
          "Your purchases have been restored successfully. Thank you!",
          [{ text: "OK" }]
        );
      } else {
        console.log(
          "Restore process completed, but no active subscription found."
        );
        Alert.alert(
          "No Purchases Found",
          "No active purchase found to restore.",
          [{ text: "OK" }]
        );
      }

      return restoredInfo;
    } catch (e) {
      console.error("An error occurred while restoring purchases:", e);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Restore Failed",
        "An issue occurred while restoring your purchases. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${themePalette.background}`}>
      <StatusBar style="auto" />
      <BackgroundCircles isDarkMode={colorScheme === "dark"} />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View className="mt-6">
          <Text className={`text-3xl font-bold ${themePalette.textPrimary}`}>
            Settings
          </Text>
          <Text className={`mt-2 text-base ${themePalette.textSecondary}`}>
            Tune Flidio to match your travel workflow, update AI access, and
            manage your data.
          </Text>
        </View>

        <View className="gap-4 mt-8 space-y-6">
          {/* Pro subscription status */}
          <SettingsCard
            title="Pro features"
            description={
              subscriptionLoading
                ? "Checking subscription status..."
                : isPro
                  ? "You have access to all premium features including unlimited AI itineraries."
                  : "Upgrade to Pro for unlimited AI-powered travel itineraries and premium features."
            }
            themePalette={themePalette}
            headerRight={
              <View
                className={`p-3 rounded-full ${
                  subscriptionLoading
                    ? themePalette.statusGrayBg
                    : isPro
                      ? themePalette.statusSuccessBg
                      : themePalette.statusWarningBg
                }`}
              >
                <Ionicons
                  name={
                    subscriptionLoading
                      ? "time-outline"
                      : isPro
                        ? "checkmark-circle-outline"
                        : "star-outline"
                  }
                  size={26}
                  color={
                    subscriptionLoading
                      ? themePalette.iconMuted
                      : isPro
                        ? themePalette.statusSuccessText
                        : themePalette.statusWarningText
                  }
                />
              </View>
            }
          >
            <View>
              {subscriptionLoading ? (
                <View className="flex-row items-center gap-3">
                  <View
                    className={`p-3 rounded-full ${themePalette.statusGrayBg}`}
                  >
                    <Ionicons
                      name="hourglass-outline"
                      size={18}
                      color={themePalette.iconMuted}
                    />
                  </View>
                  <Text className={`text-sm ${themePalette.textSecondary}`}>
                    Verifying subscription status...
                  </Text>
                </View>
              ) : subscriptionError ? (
                <View className="flex-row items-center gap-3">
                  <View
                    className={`p-3 rounded-full ${themePalette.statusDangerBg}`}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={18}
                      color={themePalette.iconDanger}
                    />
                  </View>
                  <Text className={`text-sm ${themePalette.textSecondary}`}>
                    {subscriptionError.message}
                  </Text>
                </View>
              ) : isPro ? (
                <View className="gap-3">
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`p-3 rounded-full ${themePalette.statusSuccessBg}`}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${themePalette.textPrimary}`}
                      >
                        Pro subscription active
                      </Text>
                      <Text className={`text-xs ${themePalette.textSecondary}`}>
                        Unlimited AI itineraries and premium features
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`p-3 rounded-full ${themePalette.statusInfoBg}`}
                    >
                      <Ionicons
                        name="sparkles"
                        size={18}
                        color={themePalette.iconAccent}
                      />
                    </View>
                    <Text className={`text-sm ${themePalette.textSecondary}`}>
                      All premium features unlocked
                    </Text>
                  </View>

                  {/* Cancel Subscription Button */}
                  <Pressable
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      Alert.alert(
                        "Cancel Pro Subscription?",
                        "You'll continue to have Pro access until your current billing period ends. After that, you'll return to the free plan.",
                        [
                          { text: "Keep Pro", style: "cancel" },
                          {
                            text: "Cancel Subscription",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                await Haptics.impactAsync(
                                  Haptics.ImpactFeedbackStyle.Medium
                                );
                                await manageSubscription();
                              } catch (error) {
                                console.error(
                                  "Failed to show manage subscriptions:",
                                  error
                                );
                                Alert.alert(
                                  "Couldn't open subscription settings",
                                  "Please go to your device's App Store to manage subscriptions."
                                );
                              }
                            },
                          },
                        ]
                      );
                    }}
                    className={`flex-row items-center justify-center gap-2 px-4 py-2.5 mt-3 rounded-full border ${
                      colorScheme === "dark"
                        ? "border-red-500/30 bg-red-500/10"
                        : "border-red-500/20 bg-red-50"
                    }`}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={16}
                      color={themePalette.iconDanger}
                    />
                    <Text
                      className={`text-sm font-medium ${colorScheme === "dark" ? "text-red-400" : "text-red-600"}`}
                    >
                      Manage Subscription
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="gap-3">
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`p-3 rounded-full ${themePalette.statusWarningBg}`}
                    >
                      <Ionicons name="star-outline" size={18} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${themePalette.textPrimary}`}
                      >
                        Free plan
                      </Text>
                      <Text className={`text-xs ${themePalette.textSecondary}`}>
                        Limited features • Upgrade for unlimited access
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      router.push("/promotionScreen");
                    }}
                    className="flex-row items-center justify-center gap-2 px-5 py-3 mt-3 rounded-full bg-primary-600"
                  >
                    <Ionicons name="arrow-up-outline" size={18} color="white" />
                    <Text className="text-sm font-semibold text-white">
                      Upgrade to Pro
                    </Text>
                  </Pressable>

                  {/* Restore Purchases Button */}
                  <Pressable
                    onPress={handleRestorePurchases}
                    disabled={subscriptionProcessing}
                    className={`flex-row items-center justify-center gap-2 px-4 py-2.5 mt-2 rounded-full border ${
                      colorScheme === "dark"
                        ? "border-primary-500/30 bg-primary-500/10"
                        : "border-primary-500/20 bg-primary-50"
                    } ${subscriptionProcessing ? "opacity-60" : ""}`}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color={themePalette.iconAccent}
                    />
                    <Text
                      className={`text-sm font-medium ${colorScheme === "dark" ? "text-white" : "text-primary-600"}`}
                    >
                      {subscriptionProcessing
                        ? "Restoring..."
                        : "Restore Purchases"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </SettingsCard>

          <Button onPress={AuthService.signOut} title="sign out"/>


          {/* About Flidio */}
          <SettingsCard title="About Flidio" themePalette={themePalette}>
            <View className="gap-2 space-y-3">
              <SettingsCardListItem
                icon="information-circle-outline"
                title="Version"
                value={`v${appVersion}`}
                themePalette={themePalette}
              />

              {SUPPORT_LINKS.map((link) => (
                <SettingsCardListItem
                  key={link.label}
                  icon={link.icon as keyof typeof Ionicons.glyphMap}
                  title={link.label}
                  onPress={() => handleOpenLink(link.url)}
                  themePalette={themePalette}
                  chevronColor={themePalette.iconMuted}
                />
              ))}
            </View>
          </SettingsCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
