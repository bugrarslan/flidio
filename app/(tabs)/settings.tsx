import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
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
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";

const SUPPORT_LINKS = [
  {
    label: "Privacy policy",
    icon: "shield-checkmark-outline",
    url: "https://example.com/privacy",
  },
  {
    label: "Terms of service",
    icon: "document-text-outline",
    url: "https://example.com/terms",
  },
  {
    label: "Contact support",
    icon: "chatbubble-ellipses-outline",
    url: "mailto:hello@flidio.app",
  },
] as const;

const Settings = () => {
  const { settings, updateSettings, saving } = useSettingsContext();

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
  const switchTrackColors = isDarkMode
    ? { false: "#1f2937", true: "#2563eb" }
    : { false: "#cbd5f5", true: "#2563eb" };
  const switchThumbColor = isDarkMode ? "#f1f5f9" : "#f8fafc";

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

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

  const handleClearData = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setConfirmingClear(true);
    Alert.alert(
      "Clear all data",
      "This removes your profile and travel plans stored on this device.",
      [
        { text: "Cancel", style: "cancel", onPress: () => setConfirmingClear(false) },
        {
          text: "Erase",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setConfirmingClear(false);
            // TODO: Wire up SQLite + context reset once data layer is ready
            console.log("Clearing local data");
          },
        },
      ]
    );
  };

  const handleOpenLink = async (url: string) => {
    await Haptics.selectionAsync();
    Linking.openURL(url).catch(() => {
      Alert.alert("Something went wrong", "Could not open the requested link. Please try again later.");
    });
  };

  return (
    <SafeAreaView className={`flex-1 ${backgroundClass}`}>
      <BackgroundCircles isDarkMode={isDarkMode} />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6">
          <Text className={`text-3xl font-bold ${textPrimaryClass}`}>Settings</Text>
          <Text className={`mt-2 text-base ${textSecondaryClass}`}>
            Tune Flidio to match your travel workflow, update AI access, and manage your data.
          </Text>
        </View>

        <View className="gap-4 mt-8 space-y-6">
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
                <Pressable
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    setShowApiKey((prev) => !prev);
                  }}
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

          <View className={`p-6 shadow-lg rounded-3xl border shadow-primary-900/5 ${cardClass}`}>
            <Text className={`text-lg font-semibold ${textPrimaryClass}`}>Data control</Text>
            <Text className={`mt-1 text-sm ${textSecondaryClass}`}>
              Manage the travel plans and profile details stored locally on this device.
            </Text>

            <Pressable
              onPress={handleClearData}
              className={`mt-5 flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
                confirmingClear ? "border-red-500 bg-red-500/10" : cardClass
              }`}
            >
              <View className="flex-row items-center flex-1 gap-3">
              <View className="p-3 rounded-full bg-red-500/15">
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </View>
              <View className="flex-1 mr-2">
                <Text className={`text-base font-semibold ${textPrimaryClass}`}>Clear local data</Text>
                <Text className={`text-xs ${textSecondaryClass}`}>
                  Removes saved itineraries, profile, and settings.
                </Text>
              </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={confirmingClear ? "#ef4444" : iconMutedColor} />
            </Pressable>
          </View>

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