import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import { useUserProfileContext } from "@/context/UserProfileContext";
import { generateResponse, InvalidApiKeyError } from "@/services/aiService";
import { createTravel } from "@/services/databaseService";
import { formatPrompt } from "@/utils/formatPrompt";
import { getThemePalette } from "@/utils/themePalette";
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
import Purchases from "react-native-purchases";
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
  const { settings, updateSettings } = useSettingsContext();
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

  const selectedTheme = settings?.theme ?? "light";
  const themePalette = useMemo(
    () => getThemePalette(selectedTheme),
    [selectedTheme]
  );

  const isDarkMode = settings?.theme === "dark";

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
        "Give your trip a name and choose a destination and dates to continue."
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // If no API key, check subscription status

    if (settings?.isTrialVersion && settings?.trialCreditUsed) {
      // Show trial promotion
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const hasProSubscription =
          typeof customerInfo.entitlements.active["Flidio Pro"] !==
            "undefined" ||
          customerInfo.activeSubscriptions.includes("flidio_monthly");

        // If no subscription either, show promotion screen
        if (!hasProSubscription) {
          router.push("/promotionScreen");
          return;
        }
      } catch (error) {
        console.error("Failed to check subscription status:", error);
        // If we can't check subscription, show promotion screen as fallback
        router.push("/promotionScreen");
        return;
      }
    }

    // Proceed with travel creation if user has API key or subscription
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
      const aiResponse = await generateResponse(prompt);
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
      if (settings?.isTrialVersion && !settings?.trialCreditUsed) {
        // Allow one free trial generation
        await updateSettings({ trialCreditUsed: true });
        console.log("Trial credit used, updating settings.");
      }
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
    <SafeAreaView className={`flex-1 ${themePalette.background}`}>
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
            <Ionicons name="close" size={22} color={themePalette.iconAccent} />
            <Text
              className={`text-base font-medium ${themePalette.textPrimary}`}
            >
              Close
            </Text>
          </Pressable>
          <Text
            className={`text-sm font-semibold uppercase tracking-[0.2em] ${themePalette.textAccentMuted}`}
          >
            Trip builder
          </Text>
        </View>

        <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
          <View
            className={`p-6 mt-6 rounded-3xl ${themePalette.card} border ${themePalette.border} ${isDarkMode ? "shadow-xl shadow-primary-900/20" : "shadow-lg shadow-primary-900/5"}`}
          >
            <View className="flex-row items-start gap-4">
              <View className={`p-4 rounded-2xl ${themePalette.statusInfoBg}`}>
                <Ionicons
                  name="planet-outline"
                  size={28}
                  color={themePalette.iconAccent}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-2xl font-semibold ${themePalette.textPrimary}`}
                >
                  Describe your dream escape
                </Text>
                <Text className={`mt-1 text-sm ${themePalette.textSecondary}`}>
                  Flidio will pair these details with your traveler profile to
                  craft a tailored itinerary.
                </Text>
              </View>
            </View>

            <View className="gap-4 mt-6 space-y-5">
              <View>
                <Text
                  className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
                >
                  Trip title
                </Text>
                <View
                  className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}
                >
                  <Ionicons
                    name="bookmark-outline"
                    size={20}
                    color={themePalette.iconAccent}
                  />
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Birthday escape to Kyoto"
                    placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
                    className={`flex-1 text-base h-7 ${themePalette.textPrimary}`}
                  />
                </View>
              </View>

              <View>
                <Text
                  className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
                >
                  Destination
                </Text>
                <View
                  className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={themePalette.iconAccent}
                  />
                  <TextInput
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="Kyoto, Japan"
                    placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
                    className={`flex-1 text-base h-7 ${themePalette.textPrimary}`}
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text
                    className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
                  >
                    Start date
                  </Text>
                  <Pressable
                    onPress={openStartPicker}
                    className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}
                    accessibilityRole="button"
                    accessibilityLabel="Select start date"
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={themePalette.iconAccent}
                    />
                    <Text
                      className={`flex-1 text-xs ${startDate ? themePalette.textPrimary : ""}`}
                      style={{
                        color: startDate
                          ? undefined
                          : isDarkMode
                            ? "#64748b"
                            : "#94a3b8",
                      }}
                    >
                      {startDate || "2025-05-10"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={themePalette.iconAccent}
                    />
                  </Pressable>
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
                  >
                    End date
                  </Text>
                  <Pressable
                    onPress={openEndPicker}
                    className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}
                    accessibilityRole="button"
                    accessibilityLabel="Select end date"
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={themePalette.iconAccent}
                    />
                    <Text
                      className={`flex-1 text-xs ${endDate ? themePalette.textPrimary : ""}`}
                      style={{
                        color: endDate
                          ? undefined
                          : isDarkMode
                            ? "#64748b"
                            : "#94a3b8",
                      }}
                    >
                      {endDate || "2025-05-16"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={themePalette.iconAccent}
                    />
                  </Pressable>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text
                    className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
                  >
                    Budget (USD)
                  </Text>
                  <View
                    className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}
                  >
                    <Ionicons
                      name="cash-outline"
                      size={20}
                      color={themePalette.iconAccent}
                    />
                    <TextInput
                      value={budget}
                      onChangeText={(value) => {
                        if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
                          setBudget(value);
                        }
                      }}
                      placeholder="2500"
                      keyboardType="decimal-pad"
                      placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
                      className={`flex-1 text-base h-7 ${themePalette.textPrimary}`}
                    />
                  </View>
                </View>
                <View className="w-28">
                  <Text
                    className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
                  >
                    Travelers
                  </Text>
                  <View
                    className={`flex-row items-center gap-3 px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}
                  >
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={themePalette.iconAccent}
                    />
                    <TextInput
                      value={travelers}
                      onChangeText={(value) => {
                        if (value === "" || /^\d+$/.test(value)) {
                          setTravelers(value);
                        }
                      }}
                      placeholder="2"
                      keyboardType="number-pad"
                      placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
                      className={`flex-1 text-base h-7 ${themePalette.textPrimary}`}
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text
                  className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
                >
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
                            ? `${themePalette.vibeActiveBg} ${themePalette.vibeActiveBorder}`
                            : `${themePalette.vibeInactiveBg} ${themePalette.vibeInactiveBorder}`
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isActive
                              ? themePalette.textAccent
                              : themePalette.vibeInactiveText
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
                <Text
                  className={`text-xs font-semibold tracking-wide uppercase ${themePalette.textSecondary}`}
                >
                  Special requests
                </Text>
                <View
                  className={`px-4 py-3 mt-2 rounded-2xl ${themePalette.inputBackground} border ${themePalette.border}`}
                >
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add must-see spots, dietary needs, or mobility notes."
                    placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
                    multiline
                    className={`min-h-[96px] text-base ${themePalette.textPrimary}`}
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
                isFormValid && !isGenerating
                  ? "bg-primary-600"
                  : "bg-primary-500/40"
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
              <Ionicons name="arrow-back" size={20} color={themePalette.iconAccent} />
              <Text className={`text-base font-semibold ${themePalette.textAccent}`}>
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
                isDarkMode
                  ? "bg-card-dark border border-border-dark"
                  : "bg-white"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Pressable
                  onPress={handleCancelStartDate}
                  className="px-2 py-2"
                >
                  <Text
                    className={`text-sm font-semibold ${themePalette.textAccent}`}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Text
                  className={`text-sm font-semibold uppercase tracking-[0.2em] ${themePalette.textAccentMuted}`}
                >
                  Start date
                </Text>
                <Pressable
                  onPress={handleConfirmStartDate}
                  className="px-2 py-2"
                >
                  <Text
                    className={`text-sm font-semibold ${themePalette.textAccent}`}
                  >
                    Done
                  </Text>
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
                isDarkMode
                  ? "bg-card-dark border border-border-dark"
                  : "bg-white"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Pressable onPress={handleCancelEndDate} className="px-2 py-2">
                  <Text
                    className={`text-sm font-semibold ${themePalette.textAccent}`}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Text
                  className={`text-sm font-semibold uppercase tracking-[0.2em] ${themePalette.textAccentMuted}`}
                >
                  End date
                </Text>
                <Pressable onPress={handleConfirmEndDate} className="px-2 py-2">
                  <Text
                    className={`text-sm font-semibold ${themePalette.textAccent}`}
                  >
                    Done
                  </Text>
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
