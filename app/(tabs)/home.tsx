import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import { useUserProfileContext } from "@/context/UserProfileContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllTravels, type TravelRecord } from "@/services/databaseService";

const Home = () => {
  const router = useRouter();
  const { profile } = useUserProfileContext();
  const { settings } = useSettingsContext();
  const [travels, setTravels] = useState<TravelRecord[]>([]);
  const [isLoadingTravels, setIsLoadingTravels] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDarkMode = settings?.theme === "dark";
  const screenBackgroundClass = isDarkMode ? "bg-background-dark" : "bg-background-light";
  const accentTextClass = isDarkMode ? "text-accent-text-dark" : "text-accent-text-light";
  const accentMutedTextClass = isDarkMode
    ? "text-accent-text-muted-dark"
    : "text-accent-text-muted-light";
  const headingTextClass = isDarkMode ? "text-text-primary-dark" : "text-text-primary-light";
  const bodyTextClass = isDarkMode ? "text-text-secondary-dark" : "text-text-secondary-light";
  const cardClass = isDarkMode ? "bg-card-dark border-border-dark" : "bg-card-light border-border-light";
  const secondaryButtonClass = isDarkMode ? "border-border-dark bg-card-dark" : "border-primary-500/30 bg-white";
  const iconAccentColor = isDarkMode ? "#60a5fa" : "#2563eb";
  const iconTipColor = isDarkMode ? "#93c5fd" : "#bfdbfe";
  const tipCardClass = isDarkMode
    ? "bg-card-dark border border-border-dark"
    : "bg-primary-900/90 border border-primary-900/60";
  const tipHeadingClass = isDarkMode ? "text-text-primary-dark" : "text-white";
  const tipBodyClass = isDarkMode ? "text-text-secondary-dark" : "text-primary-50/90";
  const tipLinkTextClass = isDarkMode ? "text-text-primary-dark" : "text-primary-50";
  const travelCardClass = isDarkMode
    ? "bg-card-dark border border-border-dark"
    : "bg-card-light border border-border-light";
  const travelMetaTextClass = isDarkMode ? "text-text-secondary-dark" : "text-secondary-600";

  const fetchTravels = useCallback(async () => {
    try {
      setIsLoadingTravels(true);
      setLoadError(null);
      const records = await getAllTravels();
      setTravels(records);
    } catch (error) {
      console.error("Failed to load travels", error);
      setLoadError(error instanceof Error ? error.message : "Unable to load travels");
    } finally {
      setIsLoadingTravels(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTravels();
    }, [fetchTravels])
  );

  const handleCreateTrip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/createTravelModal");
  };

  const handleOpenTravel = async (travelId: number) => {
    await Haptics.selectionAsync();
    router.push({
      pathname: "/travel/[id]",
      params: { id: String(travelId) },
    });
  };

  const handleRetryLoadTravels = async () => {
    await Haptics.selectionAsync();
    fetchTravels();
  };

  const travelList = useMemo(() => travels.slice(0, 3), [travels]);

  const getDateRangeLabel = (travel: TravelRecord): string => {
    if (travel.startDate && travel.endDate) {
      return `${travel.startDate} → ${travel.endDate}`;
    }
    if (travel.startDate) {
      return `Starting ${travel.startDate}`;
    }
    return "Flexible dates";
  };

  const getTravelersLabel = (travel: TravelRecord): string => {
    if (!travel.travellers) {
      return "Group size tbd";
    }
    const count = Number(travel.travellers);
    if (Number.isFinite(count)) {
      return `${count} ${count === 1 ? "traveler" : "travelers"}`;
    }
    return travel.travellers;
  };

  const getBudgetLabel = (travel: TravelRecord): string | null => {
    if (!travel.budget) {
      return null;
    }
    const numericBudget = Number(travel.budget);
    if (Number.isFinite(numericBudget)) {
      return `$${numericBudget.toLocaleString()}`;
    }
    return travel.budget;
  };

  return (
    <SafeAreaView className={`flex-1 ${screenBackgroundClass}`}>
      <BackgroundCircles isDarkMode={isDarkMode} />

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 50 }}>
        <View className="pt-10">
          <Text className={`text-sm font-semibold uppercase tracking-[0.2em] ${accentMutedTextClass}`}>
            Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
          </Text>
          <Text className={`mt-2 text-3xl font-bold ${headingTextClass}`}>
            Ready for your next escape?
          </Text>
          <Text className={`mt-3 text-base ${bodyTextClass}`}>
            Tap into Flidio’s AI to craft bespoke trips, or revisit your saved
            adventures.
          </Text>

          <View className="mt-6">
            <Pressable
              onPress={handleCreateTrip}
              className="flex-row items-center justify-center flex-1 gap-2 px-5 py-4 rounded-3xl bg-primary-600"
            >
              <Ionicons name="add-circle" size={22} color="white" />
              <Text className="text-base font-semibold text-white">
                Plan a trip
              </Text>
            </Pressable>

            {/* <Pressable
              onPress={handleDiscoverInspiration}
              className="flex-row items-center justify-center flex-1 gap-2 px-5 py-4 bg-white border rounded-3xl border-primary-500/30"
            >
              <Ionicons name="compass-outline" size={22} color="#2563eb" />
              <Text className="text-base font-semibold text-primary-600">Inspiration</Text>
            </Pressable> */}
          </View>
        </View>

        <View className="mt-10">
          <View className="flex-row items-center justify-between">
            <Text className={`text-lg font-semibold ${headingTextClass}`}>
              Upcoming journeys
            </Text>
            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                // TODO: Navigate to travel archive once implemented
              }}
              className="flex-row items-center gap-1"
            >
              <Text className={`text-sm font-medium ${accentTextClass}`}>
                See all
              </Text>
              <Ionicons name="chevron-forward" size={16} color={iconAccentColor} />
            </Pressable>
          </View>

          <View className="mt-4">
            {isLoadingTravels ? (
              <View className={`p-6 rounded-3xl ${cardClass}`}>
                <Text className={`text-sm ${bodyTextClass}`}>Loading your journeys...</Text>
              </View>
            ) : loadError ? (
              <View className={`p-6 rounded-3xl ${cardClass}`}>
                <Text className={`text-sm ${bodyTextClass}`}>
                  We couldn&apos;t load your saved trips.
                </Text>
                <Pressable
                  onPress={handleRetryLoadTravels}
                  className={`flex-row items-center justify-center gap-2 px-4 py-3 mt-4 border rounded-full ${secondaryButtonClass}`}
                >
                  <Ionicons name="refresh" size={18} color={iconAccentColor} />
                  <Text className={`text-sm font-semibold ${accentTextClass}`}>Try again</Text>
                </Pressable>
              </View>
            ) : travelList.length === 0 ? (
              <View className={`p-6 border rounded-3xl ${cardClass}`}>
                <View className="flex-row items-start gap-4">
                  <View
                    className={`p-4 rounded-2xl ${isDarkMode ? "bg-primary-600/15" : "bg-primary-600/10"}`}
                  >
                    <Ionicons name="airplane-outline" size={28} color={iconAccentColor} />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${headingTextClass}`}>
                      No trips yet
                    </Text>
                    <Text className={`mt-1 text-sm ${bodyTextClass}`}>
                      Create your first itinerary and it will appear right here ready for takeoff.
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleCreateTrip}
                  className={`flex-row items-center justify-center gap-2 px-4 py-3 mt-5 border rounded-full ${secondaryButtonClass}`}
                >
                  <Ionicons name="sparkles-outline" size={18} color={iconAccentColor} />
                  <Text className={`text-sm font-semibold ${accentTextClass}`}>
                    Generate an itinerary
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="gap-4">
                {travelList.map((travel) => {
                  const budgetLabel = getBudgetLabel(travel);
                  const createdAtDate = travel.createdAt ? new Date(travel.createdAt) : null;
                  const createdAtLabel =
                    createdAtDate && !Number.isNaN(createdAtDate.getTime())
                      ? createdAtDate.toLocaleDateString()
                      : travel.createdAt ?? "";
                  return (
                    <Pressable
                      key={travel.id}
                      onPress={() => handleOpenTravel(travel.id)}
                      className={`p-5 rounded-3xl ${travelCardClass}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                          <Text className={`text-base font-semibold ${headingTextClass}`} numberOfLines={1}>
                            {travel.title}
                          </Text>
                          <Text className={`mt-1 text-sm ${accentTextClass}`} numberOfLines={1}>
                            {travel.departure} → {travel.destination}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={iconAccentColor} />
                      </View>

                      <View className="flex-row flex-wrap items-center mt-4 gap-x-4 gap-y-2">
                        <View className="flex-row items-center gap-2">
                          <Ionicons name="calendar-outline" size={16} color={iconAccentColor} />
                          <Text className={`text-xs ${travelMetaTextClass}`}>
                            {getDateRangeLabel(travel)}
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-2">
                          <Ionicons name="people-outline" size={16} color={iconAccentColor} />
                          <Text className={`text-xs ${travelMetaTextClass}`}>
                            {getTravelersLabel(travel)}
                          </Text>
                        </View>

                        {budgetLabel && (
                          <View className="flex-row items-center gap-2">
                            <Ionicons name="cash-outline" size={16} color={iconAccentColor} />
                            <Text className={`text-xs ${travelMetaTextClass}`}>{budgetLabel}</Text>
                          </View>
                        )}
                      </View>

                      {createdAtLabel ? (
                        <Text className={`mt-3 text-[11px] uppercase tracking-[0.2em] ${travelMetaTextClass}`}>
                          Saved {createdAtLabel}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}

                {travels.length > travelList.length && (
                  <Pressable
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      // TODO: implement travels archive screen
                    }}
                    className={`flex-row items-center justify-center gap-2 px-4 py-3 border rounded-full ${secondaryButtonClass}`}
                  >
                    <Ionicons name="map-outline" size={18} color={iconAccentColor} />
                    <Text className={`text-sm font-semibold ${accentTextClass}`}>
                      View all saved itineraries
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>

        <View className="mt-10">
          <View className={`p-6 rounded-3xl ${tipCardClass}`}>
            <Text className={`text-lg font-semibold ${tipHeadingClass}`}>Pro tip</Text>
            <Text className={`mt-2 text-sm ${tipBodyClass}`}>
              Personalize your traveler profile to help Flidio recommend
              experiences that match your vibe.
            </Text>

            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                router.push("/userProfileModal");
              }}
              className="flex-row items-center gap-2 mt-5"
            >
              <Text className={`text-sm font-semibold ${tipLinkTextClass}`}>
                Update profile
              </Text>
              <Ionicons name="arrow-forward" size={16} color={iconTipColor} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
