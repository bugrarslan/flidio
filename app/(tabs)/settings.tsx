import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import Purchases from "react-native-purchases";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import { useUserProfileContext } from "@/context/UserProfileContext";
import { resetTravelDatabase } from "@/services/databaseService";
import { StatusBar } from "expo-status-bar";

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
  const { settings, updateSettings, saving, clearSettings } = useSettingsContext();
  const {
    clearProfile,
    profile,
    hasProfile,
    loading: profileLoading,
    saving: profileSaving,
  } = useUserProfileContext();

  const isDarkMode = settings?.theme === "dark";

  const backgroundClass = isDarkMode ? "bg-background-dark" : "bg-background-light";
  const textPrimaryClass = isDarkMode ? "text-text-primary-dark" : "text-text-primary-light";
  const textSecondaryClass = isDarkMode ? "text-text-secondary-dark" : "text-text-secondary-light";
  const cardClass = isDarkMode ? "bg-card-dark border-border-dark" : "bg-card-light border-border-light";
  const inputSurfaceClass = isDarkMode
    ? "bg-input-background-dark border-border-dark"
    : "bg-input-background-light border-border-light";
  const placeholderColor = isDarkMode ? "#64748b" : "#94a3b8";
  const iconAccentColor = isDarkMode ? "#60a5fa" : "#2563eb";
  const iconMutedColor = isDarkMode ? "#94a3b8" : "#475569";
  const iconDangerColor = isDarkMode ? "#f87171" : "#dc2626";
  const iconDangerBgClass = isDarkMode ? "bg-red-500/20" : "bg-red-500/10";
  const switchTrackColors = isDarkMode
    ? { false: "#1f2937", true: "#2563eb" }
    : { false: "#cbd5f5", true: "#2563eb" };
  const switchThumbColor = isDarkMode ? "#f1f5f9" : "#f8fafc";

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasProSubscription: boolean;
    loading: boolean;
    error: string | null;
  }>({ hasProSubscription: false, loading: true, error: null });
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

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      setSubscriptionStatus(prev => ({ ...prev, loading: true, error: null }));
      const customerInfo = await Purchases.getCustomerInfo();
      const hasProSubscription = typeof customerInfo.entitlements.active["Flidio Pro"] !== "undefined" ||
                                customerInfo.activeSubscriptions.includes("flidio_monthly");
      setSubscriptionStatus({ hasProSubscription, loading: false, error: null });
    } catch (error) {
      console.error("Failed to check subscription status:", error);
      setSubscriptionStatus({ hasProSubscription: false, loading: false, error: "Failed to check subscription" });
    }
  };

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
      Alert.alert("API key required", "Paste your Google Generative AI key before saving.");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateSettings({ aiApiKey: trimmedKey });
      Alert.alert("API key saved", "You're ready to generate AI travel itineraries.");
    } catch (error) {
      console.error("Failed to save settings", error);
      Alert.alert("Couldn't save API key", "Please double-check the value and try again.");
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
        Alert.alert("API key removed", "You can add a new Gemini API key at any time.");
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
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(success.title, success.message);
      } catch (error) {
        console.error(`[settings] Failed to execute ${key} data action`, error);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Couldn't complete action", "Please try again in a moment.");
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
                message: "Your traveler profile and app preferences have been reset.",
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
                message: "All saved itineraries have been removed from this device.",
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
      Alert.alert("Something went wrong", "Could not open the requested link. Please try again later.");
    });
  };

  const handleRestorePurchases = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const restoredInfo = await Purchases.restorePurchases();

      const isPremium = typeof restoredInfo.entitlements.active["Flidio Pro"] !== "undefined" ||
                        restoredInfo.activeSubscriptions.includes("flidio_monthly");

      if (isPremium) {
        console.log('Purchases restored successfully. User is now premium.');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Purchases Restored',
          'Your purchases have been restored successfully. Thank you!',
          [{ text: 'OK', onPress: () => checkSubscriptionStatus() }]
        );
      } else {
        console.log('Restore process completed, but no active subscription found.');
        Alert.alert(
          'No Purchases Found',
          'No active purchase found to restore.',
          [{ text: 'OK' }]
        );
      }

      return restoredInfo;

    } catch (e) {
      console.error('An error occurred while restoring purchases:', e);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Restore Failed',
        'An issue occurred while restoring your purchases. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${backgroundClass}`}>
      <StatusBar style="auto" />
      <BackgroundCircles isDarkMode={isDarkMode} />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View className="mt-6">
          <Text className={`text-3xl font-bold ${textPrimaryClass}`}>Settings</Text>
          <Text className={`mt-2 text-base ${textSecondaryClass}`}>
            Tune Flidio to match your travel workflow, update AI access, and manage your data.
          </Text>
        </View>

        <View className="gap-4 mt-8 space-y-6">
          {/* Pro subscription status */}
          <View className={`p-6 shadow-lg rounded-3xl border shadow-primary-900/5 ${cardClass}`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className={`text-lg font-semibold ${textPrimaryClass}`}>Pro features</Text>
                <Text className={`mt-1 text-sm ${textSecondaryClass}`}>
                  {subscriptionStatus.loading 
                    ? "Checking subscription status..."
                    : subscriptionStatus.hasProSubscription
                    ? "You have access to all premium features including unlimited AI itineraries."
                    : "Upgrade to Pro for unlimited AI-powered travel itineraries and premium features."
                  }
                </Text>
              </View>
              <View className={`p-3 rounded-full ${
                subscriptionStatus.loading 
                  ? isDarkMode ? "bg-gray-500/15" : "bg-gray-500/10"
                  : subscriptionStatus.hasProSubscription
                  ? isDarkMode ? "bg-green-500/15" : "bg-green-500/10"
                  : isDarkMode ? "bg-orange-500/15" : "bg-orange-500/10"
              }`}>
                <Ionicons 
                  name={
                    subscriptionStatus.loading 
                      ? "time-outline"
                      : subscriptionStatus.hasProSubscription
                      ? "checkmark-circle-outline"
                      : "star-outline"
                  } 
                  size={26} 
                  color={
                    subscriptionStatus.loading 
                      ? iconMutedColor
                      : subscriptionStatus.hasProSubscription
                      ? "#22c55e"
                      : "#f59e0b"
                  } 
                />
              </View>
            </View>

            <View className="mt-5">
              {subscriptionStatus.loading ? (
                <View className="flex-row items-center gap-3">
                  <View className={`p-3 rounded-full ${isDarkMode ? "bg-gray-500/15" : "bg-gray-500/10"}`}>
                    <Ionicons name="hourglass-outline" size={18} color={iconMutedColor} />
                  </View>
                  <Text className={`text-sm ${textSecondaryClass}`}>Verifying subscription status...</Text>
                </View>
              ) : subscriptionStatus.error ? (
                <View className="flex-row items-center gap-3">
                  <View className={`p-3 rounded-full ${isDarkMode ? "bg-red-500/15" : "bg-red-500/10"}`}>
                    <Ionicons name="warning-outline" size={18} color={iconDangerColor} />
                  </View>
                  <Text className={`text-sm ${textSecondaryClass}`}>{subscriptionStatus.error}</Text>
                </View>
              ) : subscriptionStatus.hasProSubscription ? (
                <View className="gap-3">
                  <View className="flex-row items-center gap-3">
                    <View className={`p-3 rounded-full ${isDarkMode ? "bg-green-500/15" : "bg-green-500/10"}`}>
                      <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-sm font-semibold ${textPrimaryClass}`}>Pro subscription active</Text>
                      <Text className={`text-xs ${textSecondaryClass}`}>Unlimited AI itineraries and premium features</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <View className={`p-3 rounded-full ${isDarkMode ? "bg-primary-500/15" : "bg-primary-500/10"}`}>
                      <Ionicons name="sparkles" size={18} color={iconAccentColor} />
                    </View>
                    <Text className={`text-sm ${textSecondaryClass}`}>All premium features unlocked</Text>
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
                                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                // This will open the subscription management in the App Store/Play Store
                                await Purchases.showManageSubscriptions();
                                // Refresh subscription status after user returns
                                setTimeout(() => {
                                  checkSubscriptionStatus();
                                }, 1000);
                              } catch (error) {
                                console.error("Failed to show manage subscriptions:", error);
                                Alert.alert(
                                  "Couldn't open subscription settings",
                                  "Please go to your device's App Store to manage subscriptions."
                                );
                              }
                            }
                          }
                        ]
                      );
                    }}
                    className={`flex-row items-center justify-center gap-2 px-4 py-2.5 mt-3 rounded-full border ${
                      isDarkMode 
                        ? "border-red-500/30 bg-red-500/10" 
                        : "border-red-500/20 bg-red-50"
                    }`}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={iconDangerColor} />
                    <Text className={`text-sm font-medium ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                      Manage Subscription
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="gap-3">
                  <View className="flex-row items-center gap-3">
                    <View className={`p-3 rounded-full ${isDarkMode ? "bg-orange-500/15" : "bg-orange-500/10"}`}>
                      <Ionicons name="star-outline" size={18} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-sm font-semibold ${textPrimaryClass}`}>Free plan</Text>
                      <Text className={`text-xs ${textSecondaryClass}`}>Limited features • Upgrade for unlimited access</Text>
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
                    <Text className="text-sm font-semibold text-white">Upgrade to Pro</Text>
                  </Pressable>
                  
                  {/* Restore Purchases Button */}
                  <Pressable
                    onPress={handleRestorePurchases}
                    className={`flex-row items-center justify-center gap-2 px-4 py-2.5 mt-2 rounded-full border ${
                      isDarkMode 
                        ? "border-primary-500/30 bg-primary-500/10" 
                        : "border-primary-500/20 bg-primary-50"
                    }`}
                  >
                    <Ionicons name="refresh-outline" size={16} color={iconAccentColor} />
                    <Text className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-primary-600"}`}>
                      Restore Purchases
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Traveler profile */}
          <View className={`p-6 shadow-lg rounded-3xl border shadow-primary-900/5 ${cardClass}`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className={`text-lg font-semibold ${textPrimaryClass}`}>Traveler profile</Text>
                <Text className={`mt-1 text-sm ${textSecondaryClass}`}>
                  Keep your preferences fresh so AI itineraries feel bespoke to you.
                </Text>
              </View>
              <Ionicons name="person-circle-outline" size={26} color={iconAccentColor} />
            </View>

            <View className="gap-4 mt-5">
              {profileLoading ? (
                <Text className={`text-sm ${textSecondaryClass}`}>Loading profile details...</Text>
              ) : hasProfile ? (
                <View className="gap-4">
                  <View className="flex-row items-start gap-3">
                    <View className={`p-3 rounded-full ${isDarkMode ? "bg-primary-500/15" : "bg-primary-500/10"}`}>
                      <Ionicons name="id-card-outline" size={18} color={iconAccentColor} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-base font-semibold ${textPrimaryClass}`}>
                        {profile?.name}
                      </Text>
                      <Text className={`mt-0.5 text-sm ${textSecondaryClass}`}>
                        {[profile?.location, profile?.age ? `${profile.age} yrs` : null]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start gap-3">
                    <View className={`p-3 rounded-full ${isDarkMode ? "bg-primary-500/15" : "bg-primary-500/10"}`}>
                      <Ionicons name="compass-outline" size={18} color={iconAccentColor} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-xs font-semibold tracking-wide uppercase ${textSecondaryClass}`}>
                        Travel styles
                      </Text>
                      <Text className={`mt-1 text-sm ${textSecondaryClass}`}>{profileTravelStylesLabel}</Text>
                    </View>
                  </View>

                  {profile?.bio ? (
                    <View className="flex-row items-start gap-3">
                      <View className={`p-3 rounded-full ${isDarkMode ? "bg-primary-500/15" : "bg-primary-500/10"}`}>
                        <Ionicons name="sparkles-outline" size={18} color={iconAccentColor} />
                      </View>
                      <Text className={`flex-1 text-sm leading-5 ${textSecondaryClass}`}>{profile.bio}</Text>
                    </View>
                  ) : null}

                  {profileUpdatedLabel ? (
                    <Text
                      className={`text-[11px] uppercase tracking-[0.2em] ${textSecondaryClass}`}
                    >
                      Updated {profileUpdatedLabel}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View className="flex-row items-start gap-3">
                  <View className={`p-3 rounded-full ${isDarkMode ? "bg-primary-500/15" : "bg-primary-500/10"}`}>
                    <Ionicons name="trail-sign-outline" size={18} color={iconAccentColor} />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${textPrimaryClass}`}>
                      Build your traveler profile
                    </Text>
                    <Text className={`mt-1 text-sm ${textSecondaryClass}`}>
                      Share a few details to help Flidio curate adventures that match your vibe.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                router.push("/userProfileModal");
              }}
              disabled={profileDisabled}
              className={`mt-5 flex-row items-center justify-center gap-2 rounded-full px-5 py-3 ${
                profileDisabled ? "bg-primary-500/30" : "bg-primary-600"
              }`}
            >
              <Ionicons name="create-outline" size={18} color="white" />
              <Text
                className={`text-sm font-semibold text-white ${
                  profileDisabled ? "opacity-75" : "opacity-100"
                }`}
              >
                {hasProfile ? "Update profile" : "Create profile"}
              </Text>
            </Pressable>
          </View>          

          {/* Google AI access */}
          <View className={`p-6 shadow-lg rounded-3xl border shadow-primary-900/5 ${cardClass}`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${textPrimaryClass}`}>Google AI access</Text>
                <Text className={`mt-1 text-sm ${textSecondaryClass}`}>
                  Add your Google Generative AI key so we can craft itineraries in real time.
                </Text>
              </View>
              <Ionicons name="sparkles-outline" size={24} color={iconAccentColor} />
            </View>

            <View className="mt-4">
              <Text className={`text-xs font-semibold tracking-wide uppercase ${textSecondaryClass}`}>
                API key
              </Text>
              <View
                className={`flex-row items-center gap-3 px-4 py-3 mt-2 border rounded-2xl ${inputSurfaceClass}`}
              >
                <Ionicons name="key-outline" size={20} color={iconAccentColor} />
                <TextInput
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="AIza..."
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showApiKey}
                  className={`flex-1 text-base h-7 ${textPrimaryClass}`}
                />
                {canRemoveApiKey ? (
                  <Pressable
                    onPress={() => {
                      void handleRemoveApiKey();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Remove API key"
                    className={`p-1.5 rounded-full ${isDarkMode ? "bg-red-500/20" : "bg-red-500/10"}`}
                  >
                    <Ionicons name="close-circle" size={18} color={iconDangerColor} />
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    setShowApiKey((prev) => !prev);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={showApiKey ? "Hide API key" : "Show API key"}
                >
                  <Ionicons
                    name={showApiKey ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={iconMutedColor}
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={handleSaveApiKey}
                disabled={!apiKey.trim() || saving}
                className={`mt-4 flex-row items-center justify-center gap-2 rounded-full px-5 py-3 ${
                  apiKey.trim() && !saving ? "bg-primary-600" : "bg-primary-500/40"
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
          </View>

          {/* theme */}
          <View className={`p-6 shadow-lg rounded-3xl border shadow-primary-900/5 ${cardClass}`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className={`text-lg font-semibold ${textPrimaryClass}`}>Dark Theme</Text>
                <Text className={`flex-shrink mt-1 text-sm ${textSecondaryClass}`}>
                  Switch between light and dark to match your environment.
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleToggleTheme}
                trackColor={switchTrackColors}
                thumbColor={switchThumbColor}
                ios_backgroundColor={switchTrackColors.false}
                disabled={saving}
              />
            </View>
          </View>

          {/* Data control */}
          <View className={`p-6 shadow-lg rounded-3xl border shadow-primary-900/5 ${cardClass}`}>
            <Text className={`text-lg font-semibold ${textPrimaryClass}`}>Data control</Text>
            <Text className={`mt-1 text-sm ${textSecondaryClass}`}>
              Manage the travel plans and profile details stored locally on this device.
            </Text>

            <View className="gap-2 mt-5 space-y-3">
              <Pressable
                onPress={confirmClearProfileSettings}
                disabled={pendingAction !== null}
                className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${cardClass} ${
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
                    <Ionicons name="people-outline" size={20} color={iconAccentColor} />
                  </View>
                  <View className="flex-1 mr-2">
                    <Text className={`text-base font-semibold ${textPrimaryClass}`}>
                      {pendingAction === "profile-settings" ? "Clearing..." : "Clear profile & settings"}
                    </Text>
                    <Text className={`text-xs ${textSecondaryClass}`}>
                      Removes saved traveler profile and app preferences.
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={pendingAction === "profile-settings" ? iconAccentColor : iconMutedColor}
                />
              </Pressable>

              <Pressable
                onPress={confirmDeleteItineraries}
                disabled={pendingAction !== null}
                className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${cardClass} ${
                  pendingAction === "itineraries"
                    ? isDarkMode
                      ? "border-red-400 bg-red-500/15"
                      : "border-red-500 bg-red-500/10"
                    : ""
                } ${pendingAction !== null && pendingAction !== "itineraries" ? "opacity-60" : ""}`}
              >
                <View className="flex-row items-center flex-1 gap-3">
                  <View className={`p-3 rounded-full ${iconDangerBgClass}`}>
                    <Ionicons name="map-outline" size={20} color={iconDangerColor} />
                  </View>
                  <View className="flex-1 mr-2">
                    <Text className={`text-base font-semibold ${textPrimaryClass}`}>
                      {pendingAction === "itineraries" ? "Deleting..." : "Delete itineraries"}
                    </Text>
                    <Text className={`text-xs ${textSecondaryClass}`}>
                      Deletes the Flidio travel database and all saved trips.
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={pendingAction === "itineraries" ? iconDangerColor : iconMutedColor}
                />
              </Pressable>

              <Pressable
                onPress={confirmClearAllData}
                disabled={pendingAction !== null}
                className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${cardClass} ${
                  pendingAction === "all"
                    ? isDarkMode
                      ? "border-red-500 bg-red-500/20"
                      : "border-red-600 bg-red-500/15"
                    : ""
                } ${pendingAction !== null && pendingAction !== "all" ? "opacity-60" : ""}`}
              >
                <View className="flex-row items-center flex-1 gap-3">
                  <View className={`p-3 rounded-full ${iconDangerBgClass}`}>
                    <Ionicons name="trash-outline" size={20} color={iconDangerColor} />
                  </View>
                  <View className="flex-1 mr-2">
                    <Text className={`text-base font-semibold ${textPrimaryClass}`}>
                      {pendingAction === "all" ? "Wiping..." : "Clear all data"}
                    </Text>
                    <Text className={`text-xs ${textSecondaryClass}`}>
                      Runs both actions above for a completely fresh start.
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={pendingAction === "all" ? iconDangerColor : iconMutedColor}
                />
              </Pressable>
            </View>
          </View>

          {/* About Flidio */}
          <View className={`p-6 shadow-lg rounded-3xl border shadow-primary-900/5 ${cardClass}`}>
            <Text className={`text-lg font-semibold ${textPrimaryClass}`}>About Flidio</Text>
            <View className="gap-2 mt-4 space-y-3">
              <View className={`flex-row items-center justify-between px-4 py-3 border rounded-2xl ${cardClass}`}>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="information-circle-outline" size={20} color={iconAccentColor} />
                  <Text className={`text-base font-medium ${textPrimaryClass}`}>Version</Text>
                </View>
                <Text className={`text-sm font-semibold ${textSecondaryClass}`}>v{appVersion}</Text>
              </View>

              {SUPPORT_LINKS.map((link) => (
                <Pressable
                  key={link.label}
                  onPress={() => handleOpenLink(link.url)}
                  className={`flex-row items-center justify-between px-4 py-3 border rounded-2xl ${cardClass}`}
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name={link.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={iconAccentColor}
                    />
                    <Text className={`text-base font-medium ${textPrimaryClass}`}>{link.label}</Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color={iconMutedColor} />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;