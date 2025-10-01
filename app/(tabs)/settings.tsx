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

  const isDarkMode = settings?.theme === "dark";

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
    <SafeAreaView className="flex-1 bg-secondary-50">
      <BackgroundCircles />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6">
          <Text className="text-3xl font-bold text-primary-900">Settings</Text>
          <Text className="mt-2 text-base text-secondary-600">
            Tune Flidio to match your travel workflow, update AI access, and manage your data.
          </Text>
        </View>

        <View className="gap-4 mt-8 space-y-6">
          <View className="p-6 shadow-lg rounded-3xl bg-white/80 shadow-primary-900/5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-primary-900">Google AI access</Text>
                <Text className="mt-1 text-sm text-secondary-500">
                  Add your Google Generative AI key so we can craft itineraries in real time.
                </Text>
              </View>
              <Ionicons name="sparkles-outline" size={24} color="#2563eb" />
            </View>

            <View className="mt-4">
              <Text className="text-xs font-semibold tracking-wide uppercase text-secondary-500">API key</Text>
              <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                <Ionicons name="key-outline" size={20} color="#2563eb" />
                <TextInput
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="AIza..."
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showApiKey}
                  className="flex-1 text-base text-primary-900 h-7"
                />
                <Pressable
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    setShowApiKey((prev) => !prev);
                  }}
                >
                  <Ionicons name={showApiKey ? "eye-off-outline" : "eye-outline"} size={20} color="#475569" />
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

            <View className="p-6 shadow-lg rounded-3xl bg-white/80 shadow-primary-900/5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
              <Text className="text-lg font-semibold text-primary-900">Dark Theme</Text>
              <Text className="flex-shrink mt-1 text-sm text-secondary-500">
                Switch between light and dark to match your environment.
              </Text>
              </View>
              <Switch
                value={isDarkMode ?? false}
                onValueChange={handleToggleTheme}
                thumbColor={isDarkMode ? "#2563eb" : "#e2e8f0"}
                disabled={saving}
              />
            </View>
            </View>

          <View className="p-6 shadow-lg rounded-3xl bg-white/80 shadow-primary-900/5">
            <Text className="text-lg font-semibold text-primary-900">Data control</Text>
            <Text className="mt-1 text-sm text-secondary-500">
              Manage the travel plans and profile details stored locally on this device.
            </Text>

            <Pressable
              onPress={handleClearData}
              className={`mt-5 flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
              confirmingClear ? "border-red-500 bg-red-50" : "border-primary-500/20 bg-white"
              }`}
            >
              <View className="flex-row items-center flex-1 gap-3">
              <View className="p-3 rounded-full bg-red-500/15">
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </View>
              <View className="flex-1 mr-2">
                <Text className="text-base font-semibold text-primary-900">Clear local data</Text>
                <Text className="text-xs text-secondary-500">Removes saved itineraries, profile, and settings.</Text>
              </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={confirmingClear ? "#ef4444" : "#94a3b8"} />
            </Pressable>
          </View>

          <View className="p-6 shadow-lg rounded-3xl bg-white/80 shadow-primary-900/5">
            <Text className="text-lg font-semibold text-primary-900">About Flidio</Text>
            <View className="gap-2 mt-4 space-y-3">
              <View className="flex-row items-center justify-between px-4 py-3 bg-white border rounded-2xl border-primary-500/20">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="information-circle-outline" size={20} color="#2563eb" />
                  <Text className="text-base font-medium text-primary-900">Version</Text>
                </View>
                <Text className="text-sm font-semibold text-secondary-500">v{appVersion}</Text>
              </View>

              {SUPPORT_LINKS.map((link) => (
                <Pressable
                  key={link.label}
                  onPress={() => handleOpenLink(link.url)}
                  className="flex-row items-center justify-between px-4 py-3 bg-white border rounded-2xl border-primary-500/20"
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons name={link.icon as keyof typeof Ionicons.glyphMap} size={20} color="#2563eb" />
                    <Text className="text-base font-medium text-primary-900">{link.label}</Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color="#64748b" />
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