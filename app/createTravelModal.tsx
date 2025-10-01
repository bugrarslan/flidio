import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import { useUserProfileContext } from "@/context/UserProfileContext";
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
  const { settings } = useSettingsContext();
  const { profile } = useUserProfileContext();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [notes, setNotes] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  const isDarkMode = settings?.theme === "dark";
  const screenBackgroundClass = isDarkMode ? "bg-background-dark" : "bg-background-light";
  const headingTextClass = isDarkMode ? "text-text-primary-dark" : "text-text-primary-light";
  const bodyTextClass = isDarkMode ? "text-text-secondary-dark" : "text-text-secondary-light";
  const accentTextClass = isDarkMode ? "text-accent-text-dark" : "text-accent-text-light";
  const accentMutedTextClass = isDarkMode
    ? "text-accent-text-muted-dark"
    : "text-accent-text-muted-light";
  const labelTextClass = isDarkMode ? "text-text-secondary-dark" : "text-secondary-600";
  const cardClass = isDarkMode
    ? "bg-card-dark border border-border-dark"
    : "bg-card-light border border-border-light";
  const cardShadowClass = isDarkMode ? "shadow-xl shadow-primary-900/20" : "shadow-lg shadow-primary-900/5";
  const inputContainerClass = isDarkMode
    ? "bg-input-background-dark border border-border-dark"
    : "bg-input-background-light border border-border-light";
  const inputTextClass = isDarkMode ? "text-text-primary-dark" : "text-text-primary-light";
  const placeholderColor = isDarkMode ? "#64748b" : "#94a3b8";
  const iconPrimaryColor = isDarkMode ? "#93c5fd" : "#2563eb";
  const vibeActiveContainerClass = isDarkMode
    ? "border-primary-500 bg-primary-600/20"
    : "border-primary-600 bg-primary-600/10";
  const vibeInactiveContainerClass = isDarkMode
    ? "border-border-dark bg-card-dark"
    : "border-primary-500/20 bg-white";
  const vibeInactiveTextClass = isDarkMode ? "text-text-secondary-dark" : "text-secondary-600";

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
    <SafeAreaView className={`flex-1 ${screenBackgroundClass}`}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
      >
        {/* Background decorative circles */}
        <BackgroundCircles isDarkMode={isDarkMode} />

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4">
          <Pressable
            onPress={handleCloseModal}
            className="flex-row items-center gap-2"
          >
            <Ionicons name="close" size={22} color={iconPrimaryColor} />
            <Text className={`text-base font-medium ${headingTextClass}`}>
              Close
            </Text>
          </Pressable>
          <Text className={`text-sm font-semibold uppercase tracking-[0.2em] ${accentMutedTextClass}`}>
            Trip builder
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className={`p-6 mt-6 rounded-3xl ${cardClass} ${cardShadowClass}`}>
            <View className="flex-row items-start gap-4">
              <View className={`p-4 rounded-2xl ${isDarkMode ? "bg-primary-600/20" : "bg-primary-600/10"}`}>
                <Ionicons name="planet-outline" size={28} color={iconPrimaryColor} />
              </View>
              <View className="flex-1">
                <Text className={`text-2xl font-semibold ${headingTextClass}`}>
                  Describe your dream escape
                </Text>
                <Text className={`mt-1 text-sm ${bodyTextClass}`}>
                  Flidio will pair these details with your traveler profile to
                  craft a tailored itinerary.
                </Text>
              </View>
            </View>

            <View className="gap-4 mt-6 space-y-5">
              <View>
                <Text className={`text-xs font-semibold tracking-wide uppercase ${labelTextClass}`}>
                  Trip title
                </Text>
                <View className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${inputContainerClass}`}>
                  <Ionicons name="bookmark-outline" size={20} color={iconPrimaryColor} />
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Birthday escape to Kyoto"
                    placeholderTextColor={placeholderColor}
                    className={`flex-1 text-base h-7 ${inputTextClass}`}
                  />
                </View>
              </View>

              <View>
                <Text className={`text-xs font-semibold tracking-wide uppercase ${labelTextClass}`}>
                  Destination
                </Text>
                <View className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${inputContainerClass}`}>
                  <Ionicons name="location-outline" size={20} color={iconPrimaryColor} />
                  <TextInput
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="Kyoto, Japan"
                    placeholderTextColor={placeholderColor}
                    className={`flex-1 text-base h-7 ${inputTextClass}`}
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className={`text-xs font-semibold tracking-wide uppercase ${labelTextClass}`}>
                    Start date
                  </Text>
                  <View className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${inputContainerClass}`}>
                    <Ionicons name="calendar-outline" size={20} color={iconPrimaryColor} />
                    <TextInput
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="2025-05-10"
                      placeholderTextColor={placeholderColor}
                      className={`flex-1 text-base h-7 ${inputTextClass}`}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className={`text-xs font-semibold tracking-wide uppercase ${labelTextClass}`}>
                    End date
                  </Text>
                  <View className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${inputContainerClass}`}>
                    <Ionicons name="calendar-number-outline" size={20} color={iconPrimaryColor} />
                    <TextInput
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="2025-05-16"
                      placeholderTextColor={placeholderColor}
                      className={`flex-1 text-base h-7 ${inputTextClass}`}
                    />
                  </View>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className={`text-xs font-semibold tracking-wide uppercase ${labelTextClass}`}>
                    Budget (USD)
                  </Text>
                  <View className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${inputContainerClass}`}>
                    <Ionicons name="cash-outline" size={20} color={iconPrimaryColor} />
                    <TextInput
                      value={budget}
                      onChangeText={(value) => {
                        if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
                          setBudget(value);
                        }
                      }}
                      placeholder="2500"
                      keyboardType="decimal-pad"
                      placeholderTextColor={placeholderColor}
                      className={`flex-1 text-base h-7 ${inputTextClass}`}
                    />
                  </View>
                </View>
                <View className="w-28">
                  <Text className={`text-xs font-semibold tracking-wide uppercase ${labelTextClass}`}>
                    Travelers
                  </Text>
                  <View className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${inputContainerClass}`}>
                    <Ionicons name="people-outline" size={20} color={iconPrimaryColor} />
                    <TextInput
                      value={travelers}
                      onChangeText={(value) => {
                        if (value === "" || /^\d+$/.test(value)) {
                          setTravelers(value);
                        }
                      }}
                      placeholder="2"
                      keyboardType="number-pad"
                      placeholderTextColor={placeholderColor}
                      className={`flex-1 text-base h-7 ${inputTextClass}`}
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text className={`text-xs font-semibold tracking-wide uppercase ${labelTextClass}`}>
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
                          isActive ? vibeActiveContainerClass : vibeInactiveContainerClass
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isActive ? accentTextClass : vibeInactiveTextClass
                          }`}
                        >
                          {vibe}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className={`text-xs font-semibold tracking-wide uppercase ${labelTextClass}`}>
                  Special requests
                </Text>
                <View className={`px-4 py-3 mt-2 rounded-2xl ${inputContainerClass}`}>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add must-see spots, dietary needs, or mobility notes."
                    placeholderTextColor={placeholderColor}
                    multiline
                    className={`min-h-[96px] text-base ${inputTextClass}`}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Generate itinerary button */}
          <View className="mt-8">
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

            {/* <Pressable
              onPress={handleCloseModal}
              className={`flex-row items-center justify-center gap-2 rounded-full px-6 py-4 ${secondaryButtonClass}`}
            >
              <Ionicons name="arrow-back" size={20} color={iconPrimaryColor} />
              <Text className={`text-base font-semibold ${accentTextClass}`}>
                Keep exploring
              </Text>
            </Pressable> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateTravelModal;
