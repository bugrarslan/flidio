import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import { useUserProfileContext } from "@/context/UserProfileContext";
import { generateResponse, InvalidApiKeyError } from "@/services/aiService";
import { createTravel } from "@/services/databaseService";
import { formatPrompt } from "@/utils/formatPrompt";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
  const [startDateValue, setStartDateValue] = useState<Date | null>(null);
  const [endDateValue, setEndDateValue] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startPickerDate, setStartPickerDate] = useState<Date>(new Date());
  const [endPickerDate, setEndPickerDate] = useState<Date>(new Date());
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [notes, setNotes] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const formatDateValue = useMemo(() => {
    return (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${day}-${month}-${year}`;
    };
  }, []);

  const applyStartDate = (date: Date | null) => {
    if (!date) {
      setStartDateValue(null);
      setStartDate("");
      return;
    }
    setStartDateValue(date);
    setStartDate(formatDateValue(date));
    if (endDateValue && date > endDateValue) {
      setEndDateValue(date);
      setEndDate(formatDateValue(date));
    }
  };

  const applyEndDate = (date: Date | null) => {
    if (!date) {
      setEndDateValue(null);
      setEndDate("");
      return;
    }
    if (startDateValue && date < startDateValue) {
      setEndDateValue(startDateValue);
      setEndDate(formatDateValue(startDateValue));
      return;
    }
    setEndDateValue(date);
    setEndDate(formatDateValue(date));
  };

  const openStartPicker = async () => {
    await Haptics.selectionAsync();
    setStartPickerDate(startDateValue ?? new Date());
    setShowStartPicker(true);
  };

  const openEndPicker = async () => {
    await Haptics.selectionAsync();
    const baseDate = endDateValue ?? startDateValue ?? new Date();
    setEndPickerDate(baseDate);
    setShowEndPicker(true);
  };

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
      if (selectedDate) {
        applyStartDate(selectedDate);
      }
    } else if (selectedDate) {
      setStartPickerDate(selectedDate);
    }
  };

  const handleConfirmStartDate = () => {
    applyStartDate(startPickerDate);
    setShowStartPicker(false);
  };

  const handleCancelStartDate = () => {
    setShowStartPicker(false);
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
      if (selectedDate) {
        applyEndDate(selectedDate);
      }
    } else if (selectedDate) {
      setEndPickerDate(selectedDate);
    }
  };

  const handleConfirmEndDate = () => {
    applyEndDate(endPickerDate);
    setShowEndPicker(false);
  };

  const handleCancelEndDate = () => {
    setShowEndPicker(false);
  };

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

    const normalizedBudget = budget ? Number(budget) : null;
    const normalizedTravelers = travelers ? Number(travelers) : null;

    const prompt = formatPrompt({
      title,
      departure: profile?.location ?? "",
      destination,
      startDate,
      endDate,
      budget: normalizedBudget,
      travellersCount: normalizedTravelers,
      tripVibes: selectedVibes,
      userNotes: notes,
      userCredentials: {
        name: profile?.name ?? "",
        age: profile?.age ?? null,
        location: profile?.location ?? "",
        travelStyles: profile?.travelStyles ?? [],
        bio: profile?.bio ?? "",
      },
    });

    console.log("Prompt generated for AI:", prompt);

    try {
      setIsGenerating(true);
      const apiKeyOverride = settings?.aiApiKey?.trim() || undefined;
      const aiResponse = await generateResponse(prompt, { apiKey: apiKeyOverride });
      console.log("AI itinerary response:", aiResponse);

      const savedTravel = await createTravel({
        title: title.trim(),
        departure: profile?.location?.trim() || "Unknown departure",
        destination: destination.trim(),
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
        budget: normalizedBudget,
        travellersCount: normalizedTravelers,
        itinerary: aiResponse,
      });
      console.log("Saved travel record:", savedTravel);

      Alert.alert("Itinerary ready!", "Your trip has been saved to Travels.", [
        {
          text: "View now",
          onPress: () =>
            router.replace({
              pathname: "/travel/[id]",
              params: { id: String(savedTravel.id) },
            }),
        },
        {
          text: "Close",
          style: "cancel",
        },
      ]);
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      if (error instanceof InvalidApiKeyError) {
        Alert.alert(
          "Check your Gemini API key",
          "The AI couldn't authenticate with the provided key. Update or remove your custom key in Settings to continue."
        );
      } else {
        Alert.alert(
          "Couldn't generate itinerary",
          "Please check your connection and try again."
        );
      }
    } finally {
      setIsGenerating(false);
    }
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
                  <Pressable
                    onPress={openStartPicker}
                    className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${inputContainerClass}`}
                    accessibilityRole="button"
                    accessibilityLabel="Select start date"
                  >
                    <Ionicons name="calendar-outline" size={20} color={iconPrimaryColor} />
                    <Text
                      className={`flex-1 text-xs ${startDate ? inputTextClass : ""}`}
                      style={{ color: startDate ? undefined : placeholderColor }}
                    >
                      {startDate || "2025-05-10"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={iconPrimaryColor} />
                  </Pressable>
                </View>
                <View className="flex-1">
                  <Text className={`text-xs font-semibold tracking-wide uppercase ${labelTextClass}`}>
                    End date
                  </Text>
                  <Pressable
                    onPress={openEndPicker}
                    className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${inputContainerClass}`}
                    accessibilityRole="button"
                    accessibilityLabel="Select end date"
                  >
                    <Ionicons name="calendar-number-outline" size={20} color={iconPrimaryColor} />
                    <Text
                      className={`flex-1 text-xs ${endDate ? inputTextClass : ""}`}
                      style={{ color: endDate ? undefined : placeholderColor }}
                    >
                      {endDate || "2025-05-16"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={iconPrimaryColor} />
                  </Pressable>
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
                isFormValid && !isGenerating ? "bg-primary-600" : "bg-primary-500/40"
              }`}
              disabled={!isFormValid || isGenerating}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text
                className={`text-base font-semibold text-white ${
                  isFormValid && !isGenerating ? "opacity-100" : "opacity-70"
                }`}
              >
                {isGenerating ? "Generating..." : "Generate itinerary with AI"}
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

      {showStartPicker && Platform.OS === "android" ? (
        <DateTimePicker
          value={startDateValue ?? new Date()}
          mode="date"
          display="calendar"
          onChange={handleStartDateChange}
        />
      ) : null}

      {showEndPicker && Platform.OS === "android" ? (
        <DateTimePicker
          value={endDateValue ?? startDateValue ?? new Date()}
          mode="date"
          display="calendar"
          onChange={handleEndDateChange}
          minimumDate={startDateValue ?? undefined}
        />
      ) : null}

      {Platform.OS === "ios" && showStartPicker ? (
        <Modal transparent animationType="slide" visible>
          <View className="justify-end flex-1 bg-black/50">
            <View
              className={`rounded-t-3xl px-5 pt-4 pb-6 ${
                isDarkMode ? "bg-card-dark border border-border-dark" : "bg-white"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Pressable onPress={handleCancelStartDate} className="px-2 py-2">
                  <Text className={`text-sm font-semibold ${accentTextClass}`}>Cancel</Text>
                </Pressable>
                <Text className={`text-sm font-semibold uppercase tracking-[0.2em] ${accentMutedTextClass}`}>
                  Start date
                </Text>
                <Pressable onPress={handleConfirmStartDate} className="px-2 py-2">
                  <Text className={`text-sm font-semibold ${accentTextClass}`}>Done</Text>
                </Pressable>
              </View>
              <View className="mt-2">
                <DateTimePicker
                  value={startPickerDate}
                  mode="date"
                  display="spinner"
                  onChange={handleStartDateChange}
                  themeVariant={isDarkMode ? "dark" : "light"}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}

      {Platform.OS === "ios" && showEndPicker ? (
        <Modal transparent animationType="slide" visible>
          <View className="justify-end flex-1 bg-black/50">
            <View
              className={`rounded-t-3xl px-5 pt-4 pb-6 ${
                isDarkMode ? "bg-card-dark border border-border-dark" : "bg-white"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Pressable onPress={handleCancelEndDate} className="px-2 py-2">
                  <Text className={`text-sm font-semibold ${accentTextClass}`}>Cancel</Text>
                </Pressable>
                <Text className={`text-sm font-semibold uppercase tracking-[0.2em] ${accentMutedTextClass}`}>
                  End date
                </Text>
                <Pressable onPress={handleConfirmEndDate} className="px-2 py-2">
                  <Text className={`text-sm font-semibold ${accentTextClass}`}>Done</Text>
                </Pressable>
              </View>
              <View className="mt-2">
                <DateTimePicker
                  value={endPickerDate}
                  mode="date"
                  display="spinner"
                  onChange={handleEndDateChange}
                  minimumDate={startDateValue ?? undefined}
                  themeVariant={isDarkMode ? "dark" : "light"}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
};

export default CreateTravelModal;
