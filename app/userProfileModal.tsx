import { useSettingsContext } from "@/context/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useUserProfileContext } from "@/context/UserProfileContext";
import { getThemePalette } from "@/utils/themePalette";

const TRAVEL_STYLES = [
  "City breaks",
  "Nature escapes",
  "Culinary tours",
  "Cultural deep dives",
  "Adventure thrills",
  "Wellness retreats",
  "Family friendly",
] as const;

const BUDGET_LEVELS = [
  { label: "Value", icon: "wallet-outline" },
  { label: "Balanced", icon: "golf-outline" },
  { label: "Premium", icon: "diamond-outline" },
] as const;

const UserProfileModal = () => {
  const router = useRouter();
  const { settings, updateSettings } = useSettingsContext();
  const { profile, saveProfile, saving } = useUserProfileContext();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [travelStyles, setTravelStyles] = useState<string[]>([]);

  const isDarkMode = settings?.theme === "dark";
  const themePalette = getThemePalette(settings?.theme);
  const placeholderColor = isDarkMode ? "#64748b" : "#94a3b8";

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.name ?? "");
    setLocation(profile.location ?? "");
    setBio(profile.bio ?? "");
    setSelectedBudget(profile.selectedBudget ?? null);
    setTravelStyles(profile.travelStyles ?? []);
    setAge(profile.age !== undefined && profile.age !== null ? String(profile.age) : "");
  }, [profile]);

  const isFormValid = useMemo(() => {
    return name.trim().length > 1 && location.trim().length > 1;
  }, [name, location]);

  const toggleStyle = (style: string) => {
    setTravelStyles((prev) => {
      if (prev.includes(style)) {
        return prev.filter((item) => item !== style);
      }
      return [...prev, style];
    });
  };

  const handleSaveProfile = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Almost there",
        "Please add your name and home base so we can personalize your trips."
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await saveProfile({
        name: name.trim(),
        location: location.trim(),
        age: age ? Number(age) : undefined,
        bio,
        selectedBudget: selectedBudget ?? undefined,
        travelStyles,
      });
      await markOnboardingComplete();
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("[profile] Failed to save user profile", error);
      Alert.alert("Couldn't save profile", "Please try again in a moment.");
    }
  };

  const markOnboardingComplete = useCallback(async () => {
      try {
        await updateSettings({ showOnboarding: false });
      } catch (error) {
        console.error("[onboarding] Failed to mark onboarding complete", error);
      }
    }, [updateSettings]);

  const handleSkip = async () => {
    await Haptics.selectionAsync();
      await markOnboardingComplete();
    router.replace("/(tabs)/home");
  };

  const handleGoBack = async () => {
    await Haptics.selectionAsync();
    router.back();
  };

  return (
    <SafeAreaView className={`flex-1 ${themePalette.background}`}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <BackgroundCircles isDarkMode={isDarkMode} />

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4">
          <Pressable
            onPress={handleGoBack}
            className="flex-row items-center gap-2"
          >
            <Ionicons name="chevron-back" size={22} color={themePalette.iconAccent} />
            <Text className={`text-base font-medium ${themePalette.textPrimary}`}>Back</Text>
          </Pressable>
          <Pressable onPress={handleSkip}>
            <Text className={`text-sm font-semibold uppercase ${themePalette.textAccent}`}>
              Skip for now
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 36 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className={`p-6 mt-8 rounded-3xl ${themePalette.card} border ${themePalette.border} ${isDarkMode ? "shadow-xl shadow-primary-900/20" : "shadow-lg shadow-primary-900/5"}`}>
            <View className="flex-row items-center gap-4">
              <View className={`p-4 rounded-full ${themePalette.accent}`}>
                <Ionicons name="person-outline" size={28} color={themePalette.iconAccent} />
              </View>
              <View className="flex-1">
                <Text className={`text-2xl font-semibold ${themePalette.textPrimary}`}>
                  Complete your traveler profile
                </Text>
                <Text className={`mt-1 text-sm ${themePalette.textSecondary}`}>
                  Share a few details so Flidio can tailor itineraries that feel
                  made for you.
                </Text>
              </View>
            </View>

            <View className="gap-4 mt-6 space-y-5">
              <View>
                <Text className={`text-sm font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                  Full name
                </Text>
                <View className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}>
                  <Ionicons name="id-card-outline" size={20} color={themePalette.iconAccent} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Alex Traveler"
                    placeholderTextColor={placeholderColor}
                    className={`flex-1 text-base h-7 ${themePalette.textPrimary}`}
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className={`text-sm font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                    Age
                  </Text>
                  <View className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}>
                    <Ionicons name="calendar-outline" size={20} color={themePalette.iconAccent} />
                    <TextInput
                      value={age}
                      onChangeText={(value) => {
                        if (value === "" || /^\d+$/.test(value)) {
                          setAge(value);
                        }
                      }}
                      placeholder="28"
                      keyboardType="number-pad"
                      placeholderTextColor={placeholderColor}
                      className={`flex-1 text-base h-7 ${themePalette.textPrimary}`}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                    Home base
                  </Text>
                  <View className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}>
                    <Ionicons name="navigate-outline" size={20} color={themePalette.iconAccent} />
                    <TextInput
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Lisbon, Portugal"
                      placeholderTextColor={placeholderColor}
                      className={`flex-1 text-base h-7 ${themePalette.textPrimary}`}
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text className={`text-sm font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                  Budget preference
                </Text>
                <View className="flex-row flex-wrap gap-3 mt-3">
                  {BUDGET_LEVELS.map((budget) => {
                    const isSelected = budget.label === selectedBudget;
                    return (
                      <Pressable
                        key={budget.label}
                        onPress={() =>
                          setSelectedBudget(isSelected ? null : budget.label)
                        }
                        className={`flex-row items-center gap-2 rounded-full border px-4 py-2 ${
                          isSelected ? `${themePalette.chipActiveBg} ${themePalette.chipActiveBorder}` : `${themePalette.chipInactiveBg} ${themePalette.chipInactiveBorder}`
                        }`}
                      >
                        <Ionicons
                          name={budget.icon as keyof typeof Ionicons.glyphMap}
                          size={18}
                          color={isSelected ? themePalette.iconAccent : themePalette.iconSecondary}
                        />
                        <Text
                          className={`text-sm font-medium ${
                            isSelected ? themePalette.textAccent : themePalette.chipInactiveText
                          }`}
                        >
                          {budget.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className={`text-sm font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                  Travel styles
                </Text>
                <View className="flex-row flex-wrap gap-3 mt-3">
                  {TRAVEL_STYLES.map((style) => {
                    const isActive = travelStyles.includes(style);
                    return (
                      <Pressable
                        key={style}
                        onPress={() => toggleStyle(style)}
                        className={`rounded-full border px-4 py-2 ${
                          isActive ? `${themePalette.chipActiveBg} ${themePalette.chipActiveBorder}` : `${themePalette.chipInactiveBg} ${themePalette.chipInactiveBorder}`
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isActive ? themePalette.textAccent : themePalette.chipInactiveText
                          }`}
                        >
                          {style}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className={`text-sm font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}>
                  Trip wishlist
                </Text>
                <View className={`px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}>
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us the kind of adventures you can’t wait to experience."
                    placeholderTextColor={placeholderColor}
                    className={`min-h-[96px] text-base ${themePalette.textPrimary}`}
                    multiline
                  />
                </View>
              </View>
            </View>
          </View>

          <View className="mt-8">
            <Pressable
              onPress={handleSaveProfile}
              className={`flex-row items-center justify-center gap-2 rounded-full px-6 py-4 ${
                isFormValid && !saving ? "bg-primary-600" : "bg-primary-500/40"
              }`}
              disabled={!isFormValid || saving}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text
                className={`text-base font-semibold text-white ${
                  isFormValid && !saving ? "opacity-100" : "opacity-70"
                }`}
              >
                {saving ? "Saving..." : "Save my profile"}
              </Text>
            </Pressable>

            {/* <Pressable
              onPress={handleSkip}
              className={`flex-row items-center justify-center gap-2 px-6 py-4 rounded-full ${secondaryButtonClass}`}
            >
              <Ionicons name="time-outline" size={20} color={themePalette.iconAccent} />
              <Text className={`text-base font-semibold ${accentMutedTextClass}`}>
                Maybe later
              </Text>
            </Pressable> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserProfileModal;
