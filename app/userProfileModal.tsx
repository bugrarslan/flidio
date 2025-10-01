import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

import { useUserProfileContext } from "@/context/UserProfileContext";

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
  const { profile, saveProfile, saving } = useUserProfileContext();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [travelStyles, setTravelStyles] = useState<string[]>([]);

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
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("[profile] Failed to save user profile", error);
      Alert.alert("Couldn't save profile", "Please try again in a moment.");
    }
  };

  const handleSkip = async () => {
    await Haptics.selectionAsync();
    router.replace("/(tabs)/home");
  };

  const handleGoBack = async () => {
    await Haptics.selectionAsync();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <View className="absolute inset-0">
          <View className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-primary-500/15" />
          <View className="absolute w-64 h-64 rounded-full bottom-24 -left-10 bg-primary-900/10" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4">
          <Pressable
            onPress={handleGoBack}
            className="flex-row items-center gap-2"
          >
            <Ionicons name="chevron-back" size={22} color="#1e3a8a" />
            <Text className="text-base font-medium text-primary-900">Back</Text>
          </Pressable>
          <Pressable onPress={handleSkip}>
            <Text className="text-sm font-semibold uppercase text-primary-600">
              Skip for now
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 36 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-6 mt-8 shadow-lg rounded-3xl bg-white/80 shadow-primary-900/5">
            <View className="flex-row items-center gap-4">
              <View className="p-4 rounded-full bg-primary-500/20">
                <Ionicons name="person-outline" size={28} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-semibold text-primary-900">
                  Complete your traveler profile
                </Text>
                <Text className="mt-1 text-sm text-secondary-500">
                  Share a few details so Flidio can tailor itineraries that feel
                  made for you.
                </Text>
              </View>
            </View>

            <View className="gap-4 mt-6 space-y-5">
              <View>
                <Text className="text-sm font-semibold tracking-wide uppercase text-secondary-600">
                  Full name
                </Text>
                <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                  <Ionicons name="id-card-outline" size={20} color="#2563eb" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Alex Traveler"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 text-base h-7 text-primary-900"
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold tracking-wide uppercase text-secondary-600">
                    Age
                  </Text>
                  <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#2563eb"
                    />
                    <TextInput
                      value={age}
                      onChangeText={(value) => {
                        if (value === "" || /^\d+$/.test(value)) {
                          setAge(value);
                        }
                      }}
                      placeholder="28"
                      keyboardType="number-pad"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 text-base text-primary-900 h-7"
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold tracking-wide uppercase text-secondary-600">
                    Home base
                  </Text>
                  <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                    <Ionicons
                      name="navigate-outline"
                      size={20}
                      color="#2563eb"
                    />
                    <TextInput
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Lisbon, Portugal"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 text-base text-primary-900 h-7"
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold tracking-wide uppercase text-secondary-600">
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
                          isSelected
                            ? "border-primary-600 bg-primary-600/10"
                            : "border-primary-500/20 bg-white"
                        }`}
                      >
                        <Ionicons
                          name={budget.icon as keyof typeof Ionicons.glyphMap}
                          size={18}
                          color={isSelected ? "#2563eb" : "#475569"}
                        />
                        <Text
                          className={`text-sm font-medium ${isSelected ? "text-primary-600" : "text-secondary-600"}`}
                        >
                          {budget.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold tracking-wide uppercase text-secondary-600">
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
                          isActive
                            ? "border-primary-600 bg-primary-600/10"
                            : "border-primary-500/20 bg-white"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${isActive ? "text-primary-700" : "text-secondary-600"}`}
                        >
                          {style}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold tracking-wide uppercase text-secondary-600">
                  Trip wishlist
                </Text>
                <View className="px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us the kind of adventures you can’t wait to experience."
                    placeholderTextColor="#94a3b8"
                    className="min-h-[96px] text-base text-primary-900"
                    multiline
                  />
                </View>
              </View>
            </View>
          </View>

          <View className="gap-4 mt-8 space-y-4">
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

            <Pressable
              onPress={handleSkip}
              className="flex-row items-center justify-center gap-2 px-6 py-4 bg-white border rounded-full border-primary-500/40"
            >
              <Ionicons name="time-outline" size={20} color="#2563eb" />
              <Text className="text-base font-semibold text-primary-600">
                Maybe later
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserProfileModal;
