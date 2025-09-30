import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

const TRIP_VIBES = [
  "City explorer",
  "Coastal chill",
  "Mountain retreat",
  "Foodie tour",
  "Art & culture",
  "Nightlife",
] as const;

const CreateTravelModal = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [notes, setNotes] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  const isFormValid = useMemo(() => {
    return title.trim().length > 2 && destination.trim().length > 2;
  }, [title, destination]);

  const toggleVibe = async (vibe: string) => {
    await Haptics.selectionAsync();
    setSelectedVibes((prev) => {
      if (prev.includes(vibe)) {
        return prev.filter((value) => value !== vibe);
      }
      return [...prev, vibe];
    });
  };

  const handleGenerateItinerary = async () => {
    if (!isFormValid) {
      Alert.alert(
        "A few more details",
        "Give your trip a name and choose a destination to continue."
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // TODO: Connect to AI service + SQLite persistence once data layer is in place
    console.log("Generating itinerary", {
      title,
      destination,
      startDate,
      endDate,
      budget: budget ? Number(budget) : null,
      travelers: travelers ? Number(travelers) : 1,
      notes,
      selectedVibes,
    });
  };

  const handleCloseModal = async () => {
    await Haptics.selectionAsync();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
      >
        {/* Background decorative circles */}
        <View className="absolute inset-0">
          <View className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-primary-500/15" />
          <View className="absolute w-64 h-64 rounded-full bottom-24 -left-10 bg-primary-900/10" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4">
          <Pressable
            onPress={handleCloseModal}
            className="flex-row items-center gap-2"
          >
            <Ionicons name="close" size={22} color="#1e3a8a" />
            <Text className="text-base font-medium text-primary-900">
              Close
            </Text>
          </Pressable>
          <Text className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600/80">
            Trip builder
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-6 mt-6 shadow-lg rounded-3xl bg-white/85 shadow-primary-900/5">
            <View className="flex-row items-start gap-4">
              <View className="p-4 rounded-2xl bg-primary-600/10">
                <Ionicons name="planet-outline" size={28} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-semibold text-primary-900">
                  Describe your dream escape
                </Text>
                <Text className="mt-1 text-sm text-secondary-500">
                  Flidio will pair these details with your traveler profile to
                  craft a tailored itinerary.
                </Text>
              </View>
            </View>

            <View className="gap-4 mt-6 space-y-5">
              <View>
                <Text className="text-xs font-semibold tracking-wide uppercase text-secondary-600">
                  Trip title
                </Text>
                <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                  <Ionicons name="bookmark-outline" size={20} color="#2563eb" />
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Birthday escape to Kyoto"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 text-base text-primary-900 h-7"
                  />
                </View>
              </View>

              <View>
                <Text className="text-xs font-semibold tracking-wide uppercase text-secondary-600">
                  Destination
                </Text>
                <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                  <Ionicons name="location-outline" size={20} color="#2563eb" />
                  <TextInput
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="Kyoto, Japan"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 text-base text-primary-900 h-7"
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold tracking-wide uppercase text-secondary-600">
                    Start date
                  </Text>
                  <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#2563eb"
                    />
                    <TextInput
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="2025-05-10"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 text-base text-primary-900 h-7"
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold tracking-wide uppercase text-secondary-600">
                    End date
                  </Text>
                  <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                    <Ionicons
                      name="calendar-number-outline"
                      size={20}
                      color="#2563eb"
                    />
                    <TextInput
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="2025-05-16"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 text-base text-primary-900 h-7"
                    />
                  </View>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold tracking-wide uppercase text-secondary-600">
                    Budget (USD)
                  </Text>
                  <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                    <Ionicons name="cash-outline" size={20} color="#2563eb" />
                    <TextInput
                      value={budget}
                      onChangeText={(value) => {
                        if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
                          setBudget(value);
                        }
                      }}
                      placeholder="2500"
                      keyboardType="decimal-pad"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 text-base text-primary-900 h-7"
                    />
                  </View>
                </View>
                <View className="w-28">
                  <Text className="text-xs font-semibold tracking-wide uppercase text-secondary-600">
                    Travelers
                  </Text>
                  <View className="flex-row items-center gap-3 px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                    <Ionicons name="people-outline" size={20} color="#2563eb" />
                    <TextInput
                      value={travelers}
                      onChangeText={(value) => {
                        if (value === "" || /^\d+$/.test(value)) {
                          setTravelers(value);
                        }
                      }}
                      placeholder="2"
                      keyboardType="number-pad"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 text-base text-primary-900 h-7"
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-xs font-semibold tracking-wide uppercase text-secondary-600">
                  Trip vibe
                </Text>
                <View className="flex-row flex-wrap gap-3 mt-3">
                  {TRIP_VIBES.map((vibe) => {
                    const isActive = selectedVibes.includes(vibe);
                    return (
                      <Pressable
                        key={vibe}
                        onPress={() => toggleVibe(vibe)}
                        className={`rounded-full border px-4 py-2 ${
                          isActive
                            ? "border-primary-600 bg-primary-600/10"
                            : "border-primary-500/20 bg-white"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${isActive ? "text-primary-700" : "text-secondary-600"}`}
                        >
                          {vibe}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-xs font-semibold tracking-wide uppercase text-secondary-600">
                  Special requests
                </Text>
                <View className="px-4 py-3 mt-2 bg-white border rounded-2xl border-primary-500/30">
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add must-see spots, dietary needs, or mobility notes."
                    placeholderTextColor="#94a3b8"
                    multiline
                    className="min-h-[96px] text-base text-primary-900"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Generate itinerary button */}
          <View className="mt-8 space-y-4">
            <Pressable
              onPress={handleGenerateItinerary}
              className={`flex-row items-center justify-center gap-2 rounded-full px-6 py-4 ${
                isFormValid ? "bg-primary-600" : "bg-primary-500/40"
              }`}
              disabled={!isFormValid}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text
                className={`text-base font-semibold text-white ${isFormValid ? "opacity-100" : "opacity-70"}`}
              >
                Generate itinerary with AI
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateTravelModal;
