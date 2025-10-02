import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import type { TravelItineraryPlan } from "@/services/aiService";
import { getTravelById, type TravelRecord } from "@/services/databaseService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TravelDetails = () => {
  const router = useRouter();
  const { settings } = useSettingsContext();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  const [travel, setTravel] = useState<TravelRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numericId = useMemo(() => {
    if (!id) {
      return null;
    }
    const raw = Array.isArray(id) ? id[0] : id;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  const fetchTravel = useCallback(async () => {
    if (numericId === null) {
      setError("Trip not found.");
      setTravel(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const record = await getTravelById(numericId);
      setTravel(record);
    } catch (err) {
      console.error("Failed to load travel", err);
      setTravel(null);
      setError(err instanceof Error ? err.message : "Unable to load trip details.");
    } finally {
      setIsLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    fetchTravel();
  }, [fetchTravel]);

  const isDarkMode = settings?.theme === "dark";
  const screenBackgroundClass = isDarkMode ? "bg-background-dark" : "bg-background-light";
  const headingTextClass = isDarkMode ? "text-text-primary-dark" : "text-text-primary-light";
  const bodyTextClass = isDarkMode ? "text-text-secondary-dark" : "text-text-secondary-light";
  const accentTextClass = isDarkMode ? "text-accent-text-dark" : "text-accent-text-light";
  const accentMutedTextClass = isDarkMode
    ? "text-accent-text-muted-dark"
    : "text-accent-text-muted-light";
  const cardClass = isDarkMode
    ? "bg-card-dark border border-border-dark"
    : "bg-card-light border border-border-light";
  const chipClass = isDarkMode
    ? "bg-primary-600/15 border border-border-dark"
    : "bg-primary-100/80 border border-border-light";

  const displayTitle = travel?.itinerary?.title?.toString().trim() || travel?.title || "Trip details";
  const displayDeparture =
    travel?.itinerary?.departure?.toString().trim() || travel?.departure || "Unknown departure";
  const displayDestination =
    travel?.itinerary?.destination?.toString().trim() || travel?.destination || "Unknown destination";

  const dateRangeLabel = useMemo(() => {
    if (!travel) {
      return null;
    }
    const start =
      travel.itinerary?.date_range?.start?.toString().trim() || travel.startDate || undefined;
    const end = travel.itinerary?.date_range?.end?.toString().trim() || travel.endDate || undefined;

    if (start && end) {
      return `${start} → ${end}`;
    }
    if (start) {
      return `Starting ${start}`;
    }
    if (end) {
      return `Until ${end}`;
    }
    return null;
  }, [travel]);

  const travellersLabel = useMemo(() => {
    const itineraryCount = travel?.itinerary?.travellers_count;
    if (typeof itineraryCount === "number" && Number.isFinite(itineraryCount)) {
      const rounded = Math.max(0, Math.round(itineraryCount));
      return `${rounded} ${rounded === 1 ? "traveler" : "travelers"}`;
    }

    const storedTravellers = travel?.travellers;
    if (storedTravellers) {
      const asNumber = Number(storedTravellers);
      if (Number.isFinite(asNumber)) {
        const normalized = Math.max(0, Math.round(asNumber));
        return `${normalized} ${normalized === 1 ? "traveler" : "travelers"}`;
      }
      return storedTravellers;
    }

    return null;
  }, [travel]);

  const budgetLabel = useMemo(() => {
    const itineraryBudget = travel?.itinerary?.budget_usd;
    if (typeof itineraryBudget === "number" && Number.isFinite(itineraryBudget)) {
      return `$${Math.max(0, itineraryBudget).toLocaleString()}`;
    }

    const storedBudget = travel?.budget;
    if (storedBudget) {
      const asNumber = Number(storedBudget);
      if (Number.isFinite(asNumber)) {
        return `$${Math.max(0, asNumber).toLocaleString()}`;
      }
      return storedBudget;
    }

    return null;
  }, [travel]);

  const createdAtLabel = useMemo(() => {
    if (!travel?.createdAt) {
      return null;
    }
    const parsed = new Date(travel.createdAt);
    if (Number.isNaN(parsed.getTime())) {
      return `Saved ${travel.createdAt}`;
    }
    return `Saved ${parsed.toLocaleDateString()}`;
  }, [travel]);

  const itineraryDays = useMemo(() => {
    const days = travel?.itinerary?.itinerary;
    if (Array.isArray(days)) {
      return days.filter((day) => !!day);
    }
    return [];
  }, [travel]);

  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpandedDays((prev) => {
      const next: Record<string, boolean> = {};
      itineraryDays.forEach((day, index) => {
        const key = `${day?.day ?? "day"}-${day?.date ?? index}`;
        next[key] = prev[key] ?? true;
      });
      return next;
    });
  }, [itineraryDays]);

  const toggleDayExpansion = async (key: string) => {
    await Haptics.selectionAsync();
    setExpandedDays((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  };

  const handleGoBack = async () => {
    await Haptics.selectionAsync();
    router.back();
  };

  const handleRetry = async () => {
    await Haptics.selectionAsync();
    fetchTravel();
  };

  return (
    <SafeAreaView className={`flex-1 ${screenBackgroundClass}`}>
      <BackgroundCircles isDarkMode={isDarkMode} />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 24 }}
      >
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={handleGoBack}
            className="flex-row items-center gap-2 px-3 py-2 rounded-full"
          >
            <Ionicons name="arrow-back" size={20} color={isDarkMode ? "#bfdbfe" : "#2563eb"} />
            <Text className={`text-sm font-semibold ${accentTextClass}`}>Back</Text>
          </Pressable>

          <Text className={`text-xs font-semibold uppercase tracking-[0.25em] ${accentMutedTextClass}`}>
            Trip itinerary
          </Text>

          <View className="w-[68px]" />
        </View>

        {isLoading ? (
          <View className={`items-center justify-center p-8 rounded-3xl ${cardClass}`}>
            <ActivityIndicator size="small" color={isDarkMode ? "#bfdbfe" : "#2563eb"} />
            <Text className={`mt-3 text-sm ${bodyTextClass}`}>Loading your itinerary...</Text>
          </View>
        ) : error ? (
          <View className={`p-6 rounded-3xl ${cardClass}`}>
            <Text className={`text-base font-semibold ${headingTextClass}`}>
              We hit some turbulence
            </Text>
            <Text className={`mt-2 text-sm ${bodyTextClass}`}>{error}</Text>

            <View className="flex-row gap-3 mt-5">
              <Pressable
                onPress={handleGoBack}
                className="flex-row items-center justify-center flex-1 gap-2 px-4 py-3 border border-transparent rounded-full bg-primary-600/10"
              >
                <Ionicons name="close" size={16} color={isDarkMode ? "#bfdbfe" : "#2563eb"} />
                <Text className={`text-sm font-semibold ${accentTextClass}`}>Close</Text>
              </Pressable>
              <Pressable
                onPress={handleRetry}
                className="flex-row items-center justify-center flex-1 gap-2 px-4 py-3 rounded-full bg-primary-600"
              >
                <Ionicons name="refresh" size={16} color="white" />
                <Text className="text-sm font-semibold text-white">Retry</Text>
              </Pressable>
            </View>
          </View>
        ) : travel ? (
          <>
            <View className={`p-6 rounded-3xl ${cardClass}`}>
              <Text className={`text-2xl font-semibold ${headingTextClass}`}>{displayTitle}</Text>
              <Text className={`mt-2 text-sm ${accentTextClass}`}>
                {displayDeparture} → {displayDestination}
              </Text>

              <View className="flex-row flex-wrap gap-3 mt-5">
                {dateRangeLabel ? (
                  <View className={`flex-row items-center gap-2 px-3 py-2 rounded-full ${chipClass}`}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={isDarkMode ? "#93c5fd" : "#2563eb"}
                    />
                    <Text className={`text-xs font-semibold ${accentMutedTextClass}`}>{dateRangeLabel}</Text>
                  </View>
                ) : null}

                {travellersLabel ? (
                  <View className={`flex-row items-center gap-2 px-3 py-2 rounded-full ${chipClass}`}>
                    <Ionicons
                      name="people-outline"
                      size={16}
                      color={isDarkMode ? "#93c5fd" : "#2563eb"}
                    />
                    <Text className={`text-xs font-semibold ${accentMutedTextClass}`}>{travellersLabel}</Text>
                  </View>
                ) : null}

                {budgetLabel ? (
                  <View className={`flex-row items-center gap-2 px-3 py-2 rounded-full ${chipClass}`}>
                    <Ionicons
                      name="cash-outline"
                      size={16}
                      color={isDarkMode ? "#93c5fd" : "#2563eb"}
                    />
                    <Text className={`text-xs font-semibold ${accentMutedTextClass}`}>{budgetLabel}</Text>
                  </View>
                ) : null}

                {createdAtLabel ? (
                  <View className={`flex-row items-center gap-2 px-3 py-2 rounded-full ${chipClass}`}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={isDarkMode ? "#93c5fd" : "#2563eb"}
                    />
                    <Text className={`text-xs font-semibold ${accentMutedTextClass}`}>{createdAtLabel}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View className="mt-6">
              <Text className={`text-lg font-semibold ${headingTextClass}`}>Daily game plan</Text>
              <Text className={`mt-1 text-xs ${bodyTextClass}`}>
                Curated specifically for you based on your traveler profile and trip details.
              </Text>
            </View>

            {itineraryDays.length === 0 ? (
              <View className={`p-6 mt-4 rounded-3xl ${cardClass}`}>
                <Text className={`text-sm ${bodyTextClass}`}>
                  This itinerary doesn&apos;t include a detailed schedule yet. Regenerate the trip from the
                  home screen to get fresh ideas.
                </Text>
              </View>
            ) : (
              <View className="gap-4 mt-4">
                {itineraryDays.map((day, index) => {
                  const plan: Partial<TravelItineraryPlan> = day.plan ?? {};
                  const dayLabelParts: string[] = [];
                  if (typeof day.day === "number") {
                    dayLabelParts.push(`Day ${day.day}`);
                  }
                  if (day.date) {
                    dayLabelParts.push(day.date);
                  }

                  const dayLabel = dayLabelParts.join(" · ") || "Itinerary day";
                  const dayKey = `${day.day ?? "day"}-${day.date ?? index}`;
                  const isExpanded = expandedDays[dayKey] ?? true;
                  const toggleIcon = isExpanded ? "chevron-up-outline" : "chevron-down-outline";
                  const toggleIconColor = isDarkMode ? "#bfdbfe" : "#2563eb";

                  return (
                    <View key={dayKey} className={`p-5 rounded-3xl ${cardClass}`}>
                      <Pressable
                        onPress={() => toggleDayExpansion(dayKey)}
                        className="flex-row items-center justify-between"
                        accessibilityRole="button"
                        accessibilityLabel={`Toggle details for ${dayLabel}`}
                      >
                        <Text className={`text-base font-semibold ${headingTextClass}`}>{dayLabel}</Text>
                        <Ionicons name={toggleIcon} size={20} color={toggleIconColor} />
                      </Pressable>

                      {isExpanded ? (
                        <View className="gap-3 mt-4">
                          {plan.morning ? (
                            <View className="flex-row items-start gap-3">
                              <Ionicons
                                name="cafe-outline"
                                size={18}
                                color={isDarkMode ? "#bfdbfe" : "#2563eb"}
                              />
                              <View className="flex-1">
                                <Text
                                  className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentMutedTextClass}`}
                                >
                                  Morning
                                </Text>
                                <Text className={`mt-1 text-sm leading-relaxed ${bodyTextClass}`}>
                                  {plan.morning}
                                </Text>
                              </View>
                            </View>
                          ) : null}

                          {plan.afternoon ? (
                            <View className="flex-row items-start gap-3">
                              <Ionicons
                                name="partly-sunny-outline"
                                size={18}
                                color={isDarkMode ? "#bfdbfe" : "#2563eb"}
                              />
                              <View className="flex-1">
                                <Text
                                  className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentMutedTextClass}`}
                                >
                                  Afternoon
                                </Text>
                                <Text className={`mt-1 text-sm leading-relaxed ${bodyTextClass}`}>
                                  {plan.afternoon}
                                </Text>
                              </View>
                            </View>
                          ) : null}

                          {plan.evening ? (
                            <View className="flex-row items-start gap-3">
                              <Ionicons
                                name="moon-outline"
                                size={18}
                                color={isDarkMode ? "#bfdbfe" : "#2563eb"}
                              />
                              <View className="flex-1">
                                <Text
                                  className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentMutedTextClass}`}
                                >
                                  Evening
                                </Text>
                                <Text className={`mt-1 text-sm leading-relaxed ${bodyTextClass}`}>
                                  {plan.evening}
                                </Text>
                              </View>
                            </View>
                          ) : null}

                          {!plan.morning && !plan.afternoon && !plan.evening ? (
                            <Text className={`text-sm ${bodyTextClass}`}>
                              No schedule provided for this day.
                            </Text>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TravelDetails;