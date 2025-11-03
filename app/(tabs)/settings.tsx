import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
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
import { useSettingsContext } from "@/context/SettingsContext";
import { useUserProfileContext } from "@/context/UserProfileContext";
import { resetTravelDatabase } from "@/services/databaseService";
import { StatusBar } from "expo-status-bar";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import {
  SettingsCard,
  SettingsCardItem,
  SettingsCardAction,
  SettingsCardListItem,
} from "@/components/ui/SettingsCard";

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
  const router = useRouter();
  const { settings, updateSettings, saving, clearSettings } =
    useSettingsContext();
  const {
    clearProfile,
    profile,
    hasProfile,
    loading: profileLoading,
    saving: profileSaving,
  } = useUserProfileContext();
  const {
    loading: subscriptionLoading,
    isPro,
    restorePurchases,
    manageSubscription,
    processing: subscriptionProcessing,
    error: subscriptionError,
  } = useSubscriptionContext();

  const selectedTheme = settings?.theme ?? "light";

  const themePalette = useMemo(
    () => getThemePalette(selectedTheme),
    [selectedTheme]
  );

  const isDarkMode = settings?.theme === "dark";

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  type DataAction = "profile-settings" | "itineraries" | "all";
  const [pendingAction, setPendingAction] = useState<DataAction | null>(null);
  const storedApiKey = settings?.aiApiKey?.trim() ?? "";
  const hasStoredApiKey = storedApiKey.length > 0;
  const canRemoveApiKey = hasStoredApiKey || apiKey.trim().length > 0;
  const profileDisabled = profileLoading || profileSaving;

  const profileUpdatedLabel = useMemo(() => {
    if (!profile?.updatedAt) {
      return null;
    }
    const updatedAtDate = new Date(profile.updatedAt);
    if (Number.isNaN(updatedAtDate.getTime())) {
      return null;
    }
    return updatedAtDate.toLocaleDateString();
  }, [profile?.updatedAt]);

  const profileTravelStylesLabel = useMemo(() => {
    const styles = profile?.travelStyles ?? [];
    if (!styles.length) {
      return "Curate the travel styles you love to tailor suggestions.";
    }
    if (styles.length <= 3) {
      return styles.join(", ");
    }
    const visible = styles.slice(0, 3).join(", ");
    const remaining = styles.length - 3;
    return `${visible} +${remaining} more`;
  }, [profile?.travelStyles]);

  const appVersion = useMemo(() => {
    return Constants.expoConfig?.version ?? "1.0.0";
  }, []);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.aiApiKey);
    }
  }, [settings]);

  const handleToggleTheme = useCallback(async () => {
    await Haptics.selectionAsync();
    const nextTheme = isDarkMode ? "light" : "dark";

    try {
      await updateSettings({ theme: nextTheme });
    } catch (error) {
      console.error("Failed to toggle theme", error);
      Alert.alert("Couldn't update theme", "Please try again in a moment.");
    }
  }, [isDarkMode, updateSettings]);

  const handleSaveApiKey = useCallback(async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      Alert.alert(
        "API key required",
        "Paste your Google Generative AI key before saving."
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateSettings({ aiApiKey: trimmedKey });
      Alert.alert(
        "API key saved",
        "You're ready to generate AI travel itineraries."
      );
    } catch (error) {
      console.error("Failed to save settings", error);
      Alert.alert(
        "Couldn't save API key",
        "Please double-check the value and try again."
      );
    }
  }, [apiKey, updateSettings]);

  const handleRemoveApiKey = useCallback(async () => {
    if (!hasStoredApiKey && apiKey.trim().length === 0) {
      return;
    }

    await Haptics.selectionAsync();

    try {
      setApiKey("");
      setShowApiKey(false);
      if (hasStoredApiKey) {
        await updateSettings({ aiApiKey: "" });
        Alert.alert(
          "API key removed",
          "You can add a new Gemini API key at any time."
        );
      }
    } catch (error) {
      console.error("Failed to remove API key", error);
      Alert.alert("Couldn't remove API key", "Please try again in a moment.");
    }
  }, [apiKey, hasStoredApiKey, updateSettings]);

  const executeDataAction = useCallback(
    async (
      key: DataAction,
      action: () => Promise<void>,
      success: { title: string; message: string }
    ) => {
      setPendingAction(key);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      try {
        await action();
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Alert.alert(success.title, success.message);
      } catch (error) {
        console.error(`[settings] Failed to execute ${key} data action`, error);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "Couldn't complete action",
          "Please try again in a moment."
        );
      } finally {
        setPendingAction(null);
      }
    },
    []
  );

  const confirmClearProfileSettings = useCallback(() => {
    void Haptics.selectionAsync();
    Alert.alert(
      "Clear profile & settings?",
      "This removes your saved traveler profile and resets app preferences stored on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () =>
            void executeDataAction(
              "profile-settings",
              async () => {
                await Promise.all([clearProfile(), clearSettings()]);
              },
              {
                title: "Profile & settings cleared",
                message:
                  "Your traveler profile and app preferences have been reset.",
              }
            ),
        },
      ]
    );
  }, [clearProfile, clearSettings, executeDataAction]);

  const confirmDeleteItineraries = useCallback(() => {
    void Haptics.selectionAsync();
    Alert.alert(
      "Delete all itineraries?",
      "This deletes the Flidio travel database and every saved trip on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            void executeDataAction(
              "itineraries",
              async () => {
                await resetTravelDatabase();
              },
              {
                title: "Itineraries deleted",
                message:
                  "All saved itineraries have been removed from this device.",
              }
            ),
        },
      ]
    );
  }, [executeDataAction]);

  const confirmClearAllData = useCallback(() => {
    void Haptics.selectionAsync();
    Alert.alert(
      "Clear every trace?",
      "This removes your profile, settings, and all saved itineraries from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Erase everything",
          style: "destructive",
          onPress: () =>
            void executeDataAction(
              "all",
              async () => {
                await Promise.all([clearProfile(), clearSettings()]);
                await resetTravelDatabase();
              },
              {
                title: "All data cleared",
                message: "Flidio has been reset. You can start fresh any time.",
              }
            ),
        },
      ]
    );
  }, [clearProfile, clearSettings, executeDataAction]);

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
      <BackgroundCircles isDarkMode={isDarkMode} />

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
                      isDarkMode
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
                      className={`text-sm font-medium ${isDarkMode ? "text-red-400" : "text-red-600"}`}
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
                      isDarkMode
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
                      className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-primary-600"}`}
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

          {/* Traveler profile */}
          <SettingsCard
            title="Traveler profile"
            description="Keep your preferences fresh so AI itineraries feel bespoke to you."
            icon="person-circle-outline"
            themePalette={themePalette}
          >
            <View className="gap-4">
              {profileLoading ? (
                <Text className={`text-sm ${themePalette.textSecondary}`}>
                  Loading profile details...
                </Text>
              ) : hasProfile ? (
                <View className="gap-4">
                  <View className="flex-row items-start gap-3">
                    <View
                      className={`p-3 rounded-full ${themePalette.statusInfoBg}`}
                    >
                      <Ionicons
                        name="id-card-outline"
                        size={18}
                        color={themePalette.iconAccent}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base font-semibold ${themePalette.textPrimary}`}
                      >
                        {profile?.name}
                      </Text>
                      <Text
                        className={`mt-0.5 text-sm ${themePalette.textSecondary}`}
                      >
                        {[
                          profile?.location,
                          profile?.age ? `${profile.age} yrs` : null,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start gap-3">
                    <View
                      className={`p-3 rounded-full ${themePalette.statusInfoBg}`}
                    >
                      <Ionicons
                        name="compass-outline"
                        size={18}
                        color={themePalette.iconAccent}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
                      >
                        Travel styles
                      </Text>
                      <Text
                        className={`mt-1 text-sm ${themePalette.textSecondary}`}
                      >
                        {profileTravelStylesLabel}
                      </Text>
                    </View>
                  </View>

                  {profile?.bio ? (
                    <View className="flex-row items-start gap-3">
                      <View
                        className={`p-3 rounded-full ${themePalette.statusInfoBg}`}
                      >
                        <Ionicons
                          name="sparkles-outline"
                          size={18}
                          color={themePalette.iconAccent}
                        />
                      </View>
                      <Text
                        className={`flex-1 text-sm leading-5 ${themePalette.textSecondary}`}
                      >
                        {profile.bio}
                      </Text>
                    </View>
                  ) : null}

                  {profileUpdatedLabel ? (
                    <Text
                      className={`text-[11px] uppercase tracking-[0.2em] ${themePalette.textSecondary}`}
                    >
                      Updated {profileUpdatedLabel}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View className="flex-row items-start gap-3">
                  <View
                    className={`p-3 rounded-full ${themePalette.statusInfoBg}`}
                  >
                    <Ionicons
                      name="trail-sign-outline"
                      size={18}
                      color={themePalette.iconAccent}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold ${themePalette.textPrimary}`}
                    >
                      Build your traveler profile
                    </Text>
                    <Text
                      className={`mt-1 text-sm ${themePalette.textSecondary}`}
                    >
                      Share a few details to help Flidio curate adventures that
                      match your vibe.
                    </Text>
                  </View>
                </View>
              )}

              <SettingsCardAction
                icon="create-outline"
                label={hasProfile ? "Update profile" : "Create profile"}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  router.push("/userProfileModal");
                }}
                disabled={profileDisabled}
                variant="primary"
                themePalette={themePalette}
              />
            </View>
          </SettingsCard>

          {/* Google AI access */}
          <SettingsCard
            title="Google AI access"
            description="Add your Google Generative AI key so we can craft itineraries in real time."
            icon="sparkles-outline"
            themePalette={themePalette}
          >
            <View className="mt-4">
              <Text
                className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
              >
                API key
              </Text>
              <View
                className={`flex-row items-center gap-3 px-4 py-3 mt-2 border rounded-2xl ${themePalette.inputBackground} ${themePalette.border}`}
              >
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={themePalette.iconAccent}
                />
                <TextInput
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="AIza..."
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
                  secureTextEntry={!showApiKey}
                  className={`flex-1 text-base h-7 ${themePalette.textPrimary}`}
                />
                {canRemoveApiKey ? (
                  <Pressable
                    onPress={() => {
                      void handleRemoveApiKey();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Remove API key"
                    className={`p-1.5 rounded-full ${themePalette.statusDangerBg}`}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={themePalette.iconDanger}
                    />
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    setShowApiKey((prev) => !prev);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showApiKey ? "Hide API key" : "Show API key"
                  }
                >
                  <Ionicons
                    name={showApiKey ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={themePalette.iconMuted}
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={handleSaveApiKey}
                disabled={!apiKey.trim() || saving}
                className={`mt-4 flex-row items-center justify-center gap-2 rounded-full px-5 py-3 ${
                  apiKey.trim() && !saving
                    ? "bg-primary-600"
                    : "bg-primary-500/40"
                }`}
              >
                <Ionicons name="cloud-upload-outline" size={18} color="white" />
                <Text
                  className={`text-sm font-semibold text-white ${apiKey.trim() && !saving ? "opacity-100" : "opacity-75"}`}
                >
                  {saving ? "Saving..." : "Save API key"}
                </Text>
              </Pressable>
            </View>
          </SettingsCard>

          {/* theme */}
          <SettingsCard
            title="Dark Theme"
            description="Switch between light and dark to match your environment."
            themePalette={themePalette}
            headerRight={
              <Switch
                value={isDarkMode}
                onValueChange={handleToggleTheme}
                trackColor={{
                  false: themePalette.switchTrackOff,
                  true: themePalette.switchTrackOn,
                }}
                thumbColor={themePalette.switchThumb}
                ios_backgroundColor={themePalette.switchTrackOff}
                disabled={saving}
              />
            }
          />

          {/* Data control */}
          <SettingsCard
            title="Data control"
            description="Manage the travel plans and profile details stored locally on this device."
            themePalette={themePalette}
          >
            <View className="gap-2 space-y-3">
              <Pressable
                onPress={confirmClearProfileSettings}
                disabled={pendingAction !== null}
                className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${themePalette.card} ${themePalette.border} ${
                  pendingAction === "profile-settings"
                    ? isDarkMode
                      ? "border-primary-400 bg-primary-500/10"
                      : "border-primary-500 bg-primary-100/60"
                    : ""
                } ${pendingAction !== null && pendingAction !== "profile-settings" ? "opacity-60" : ""}`}
              >
                <View className="flex-row items-center flex-1 gap-3">
                  <View
                    className={`p-3 rounded-full ${isDarkMode ? "bg-primary-500/20" : "bg-primary-500/10"}`}
                  >
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={themePalette.iconAccent}
                    />
                  </View>
                  <View className="flex-1 mr-2">
                    <Text
                      className={`text-base font-semibold ${themePalette.textPrimary}`}
                    >
                      {pendingAction === "profile-settings"
                        ? "Clearing..."
                        : "Clear profile & settings"}
                    </Text>
                    <Text className={`text-xs ${themePalette.textSecondary}`}>
                      Removes saved traveler profile and app preferences.
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={
                    pendingAction === "profile-settings"
                      ? themePalette.iconAccent
                      : themePalette.iconMuted
                  }
                />
              </Pressable>

              <Pressable
                onPress={confirmDeleteItineraries}
                disabled={pendingAction !== null}
                className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${themePalette.card} ${themePalette.border} ${
                  pendingAction === "itineraries"
                    ? isDarkMode
                      ? "border-red-400 bg-red-500/15"
                      : "border-red-500 bg-red-500/10"
                    : ""
                } ${pendingAction !== null && pendingAction !== "itineraries" ? "opacity-60" : ""}`}
              >
                <View className="flex-row items-center flex-1 gap-3">
                  <View
                    className={`p-3 rounded-full ${themePalette.statusDangerBg}`}
                  >
                    <Ionicons
                      name="map-outline"
                      size={20}
                      color={themePalette.iconDanger}
                    />
                  </View>
                  <View className="flex-1 mr-2">
                    <Text
                      className={`text-base font-semibold ${themePalette.textPrimary}`}
                    >
                      {pendingAction === "itineraries"
                        ? "Deleting..."
                        : "Delete itineraries"}
                    </Text>
                    <Text className={`text-xs ${themePalette.textSecondary}`}>
                      Deletes the Flidio travel database and all saved trips.
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={
                    pendingAction === "itineraries"
                      ? themePalette.iconDanger
                      : themePalette.iconMuted
                  }
                />
              </Pressable>

              <Pressable
                onPress={confirmClearAllData}
                disabled={pendingAction !== null}
                className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${themePalette.card} ${themePalette.border} ${
                  pendingAction === "all"
                    ? isDarkMode
                      ? "border-red-500 bg-red-500/20"
                      : "border-red-600 bg-red-500/15"
                    : ""
                } ${pendingAction !== null && pendingAction !== "all" ? "opacity-60" : ""}`}
              >
                <View className="flex-row items-center flex-1 gap-3">
                  <View
                    className={`p-3 rounded-full ${themePalette.statusDangerBg}`}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={themePalette.iconDanger}
                    />
                  </View>
                  <View className="flex-1 mr-2">
                    <Text
                      className={`text-base font-semibold ${themePalette.textPrimary}`}
                    >
                      {pendingAction === "all" ? "Wiping..." : "Clear all data"}
                    </Text>
                    <Text className={`text-xs ${themePalette.textSecondary}`}>
                      Runs both actions above for a completely fresh start.
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={
                    pendingAction === "all"
                      ? themePalette.iconDanger
                      : themePalette.iconMuted
                  }
                />
              </Pressable>
            </View>
          </SettingsCard>

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
