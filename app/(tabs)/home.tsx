import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import { useUserProfileContext } from "@/context/UserProfileContext";
import { deleteTravel, getAllTravels, type TravelRecord } from "@/services/databaseService";
import { fetchFoursquarePlaces, fetchMapboxDirections } from "@/services/supabase/edge-functions/test";
import { getThemePalette } from "@/utils/themePalette";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Button, FlatList, PanResponder, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACTION_WIDTH = 96;

const readAnimatedValue = (value: Animated.Value): number => {
  const candidate = value as unknown as { __getValue?: () => number; _value?: number };
  if (typeof candidate.__getValue === "function") {
    try {
      return candidate.__getValue();
    } catch {
      // ignore and fall back
    }
  }
  if (typeof candidate._value === "number") {
    return candidate._value;
  }
  return 0;
};

const Home = () => {
  const router = useRouter();
  const { profile } = useUserProfileContext();
  const { settings } = useSettingsContext();
  const [travels, setTravels] = useState<TravelRecord[]>([]);
  const [isLoadingTravels, setIsLoadingTravels] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openCardId, setOpenCardId] = useState<number | null>(null);
  const translateXRefs = useRef<Map<number, Animated.Value>>(new Map());
  const openCardIdRef = useRef(openCardId);

  useEffect(() => {
    openCardIdRef.current = openCardId;
  }, [openCardId]);

  const selectedTheme = settings?.theme ?? "light";
  const themePalette = useMemo(
    () => getThemePalette(selectedTheme),
    [selectedTheme]
  );

  const isDarkMode = settings?.theme === "dark";

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

  const handleFetchFoursquarePlaces = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await fetchFoursquarePlaces();
  };

  const handleFetchMapboxDirections = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await fetchMapboxDirections();
  };

  const handleRetryLoadTravels = async () => {
    await Haptics.selectionAsync();
    fetchTravels();
  };

  const getTranslateX = useCallback(
    (id: number) => {
      let value = translateXRefs.current.get(id);
      if (!value) {
        value = new Animated.Value(0);
        translateXRefs.current.set(id, value);
      }
      return value;
    },
    [translateXRefs]
  );

  const animateCardTo = useCallback(
    (id: number, toValue: number) => {
      const value = translateXRefs.current.get(id);
      if (!value) {
        return;
      }
      Animated.spring(value, {
        toValue,
        useNativeDriver: true,
      }).start();
    },
    [translateXRefs]
  );

  const animateCardToRef = useRef(animateCardTo);
  useEffect(() => {
    animateCardToRef.current = animateCardTo;
  }, [animateCardTo]);

  const closeCard = useCallback(
    (id: number) => {
      animateCardTo(id, 0);
      setOpenCardId((current) => (current === id ? null : current));
    },
    [animateCardTo]
  );

  const closeAllCards = useCallback(() => {
    translateXRefs.current.forEach((_, id) => {
      animateCardTo(id, 0);
    });
    setOpenCardId(null);
  }, [animateCardTo, translateXRefs]);

  const handleDeleteTravel = useCallback(
    async (travel: TravelRecord) => {
      try {
        await deleteTravel(travel.id);
        translateXRefs.current.delete(travel.id);
        setTravels((previous) => previous.filter((item) => item.id !== travel.id));
        setOpenCardId((current) => (current === travel.id ? null : current));
      } catch (error) {
        console.error("Failed to delete travel", error);
        Alert.alert("Couldn’t delete trip", "Please try again in a moment.");
      }
    },
    [translateXRefs]
  );

  const confirmDeleteTravel = useCallback(
    async (travel: TravelRecord) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      closeCard(travel.id);
      Alert.alert(
        "Delete this trip?",
        `“${travel.title}” will be removed permanently.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              void handleDeleteTravel(travel);
            },
          },
        ]
      );
    },
    [closeCard, handleDeleteTravel]
  );

  const handleOpenTravel = useCallback(
    async (travelId: number) => {
      await Haptics.selectionAsync();
      closeAllCards();
      router.push({
        pathname: "/travel/[id]",
        params: { id: String(travelId) },
      });
    },
    [closeAllCards, router]
  );

  const travelList = useMemo(() => travels.slice(0, 3), [travels]);
  const hasMoreTravels = travels.length > travelList.length;

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

  const TravelCardItem = ({ travel }: { travel: TravelRecord }) => {
    const translateX = getTranslateX(travel.id);
    const latestValueRef = useRef(0);
    const startXRef = useRef(0);
    const deleteButtonOpacity = useMemo(
      () =>
        translateX.interpolate({
          inputRange: [-ACTION_WIDTH, -ACTION_WIDTH * 0.6, -8, 0],
          outputRange: [1, 0.5, 0.1, 0],
          extrapolate: "clamp",
        }),
      [translateX]
    );
    const isCardOpen = openCardId === travel.id;

    useEffect(() => {
      latestValueRef.current = readAnimatedValue(translateX);
      startXRef.current = latestValueRef.current;
    }, [translateX]);

    useEffect(() => {
      const listenerId = translateX.addListener(({ value }) => {
        latestValueRef.current = value;
      });
      return () => {
        translateX.removeListener(listenerId);
      };
    }, [translateX]);

    const panResponder = useMemo(() => {
      return PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) => {
          const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
          return isHorizontal && Math.abs(gestureState.dx) > 5;
        },
        onPanResponderGrant: () => {
          startXRef.current = latestValueRef.current;
          const previousId = openCardIdRef.current;
          if (previousId !== null && previousId !== travel.id) {
            animateCardToRef.current(previousId, 0);
            setOpenCardId((current) => (current === previousId ? null : current));
            openCardIdRef.current = null;
          }
        },
        onPanResponderMove: (_event, gestureState) => {
          const nextValue = Math.min(0, Math.max(-ACTION_WIDTH, startXRef.current + gestureState.dx));
          translateX.setValue(nextValue);
          latestValueRef.current = nextValue;
        },
        onPanResponderRelease: (_event, gestureState) => {
          const finalValue = startXRef.current + gestureState.dx;
          const shouldOpen = finalValue < -ACTION_WIDTH / 2;
          if (shouldOpen) {
            const previousId = openCardIdRef.current;
            if (previousId !== null && previousId !== travel.id) {
              animateCardToRef.current(previousId, 0);
            }
            setOpenCardId(travel.id);
            openCardIdRef.current = travel.id;
            animateCardToRef.current(travel.id, -ACTION_WIDTH);
            latestValueRef.current = -ACTION_WIDTH;
          } else {
            animateCardToRef.current(travel.id, 0);
            setOpenCardId((current) => (current === travel.id ? null : current));
            openCardIdRef.current = null;
            latestValueRef.current = 0;
          }
        },
        onPanResponderTerminate: () => {
          const currentValue = latestValueRef.current;
          const shouldOpen = currentValue < -ACTION_WIDTH / 2;
          if (shouldOpen) {
            const previousId = openCardIdRef.current;
            if (previousId !== null && previousId !== travel.id) {
              animateCardToRef.current(previousId, 0);
            }
            setOpenCardId(travel.id);
            openCardIdRef.current = travel.id;
            animateCardToRef.current(travel.id, -ACTION_WIDTH);
            latestValueRef.current = -ACTION_WIDTH;
          } else {
            animateCardToRef.current(travel.id, 0);
            setOpenCardId((current) => (current === travel.id ? null : current));
            openCardIdRef.current = null;
            latestValueRef.current = 0;
          }
        },
      });
    }, [travel.id, translateX]);

    const budgetLabel = getBudgetLabel(travel);
    const createdAtDate = travel.createdAt ? new Date(travel.createdAt) : null;
    const createdAtLabel =
      createdAtDate && !Number.isNaN(createdAtDate.getTime())
        ? createdAtDate.toLocaleDateString()
        : travel.createdAt ?? "";

    return (
      <View className="relative">
        <View
          className="absolute inset-y-0 right-0 flex-row items-center pr-4"
          pointerEvents={isCardOpen ? "auto" : "none"}
        >
          <Animated.View style={{ opacity: deleteButtonOpacity }}>
            <Pressable
              onPress={() => confirmDeleteTravel(travel)}
              accessibilityRole="button"
              accessibilityLabel="Delete trip"
              className={`rounded-full ${themePalette.statusDangerBg} p-4`}
            >
              <Ionicons name="trash-outline" size={20} color={themePalette.iconDanger} />
            </Pressable>
          </Animated.View>
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={{ transform: [{ translateX: translateX }], width: "100%" }}
        >
          <Pressable
            onPress={() => handleOpenTravel(travel.id)}
            className={`p-5 rounded-3xl ${themePalette.card} border ${themePalette.border}`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className={`text-base font-semibold ${themePalette.textPrimary}`} numberOfLines={1}>
                  {travel.title}
                </Text>
                <Text className={`mt-1 text-sm ${themePalette.textAccent}`} numberOfLines={1}>
                  {travel.departure} → {travel.destination}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={themePalette.iconAccent} />
            </View>

            <View className="flex-row flex-wrap items-center mt-4 gap-x-4 gap-y-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={16} color={themePalette.iconAccent} />
                <Text className={`text-xs ${themePalette.textSecondary}`}>
                  {getDateRangeLabel(travel)}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Ionicons name="people-outline" size={16} color={themePalette.iconAccent} />
                <Text className={`text-xs ${themePalette.textSecondary}`}>
                  {getTravelersLabel(travel)}
                </Text>
              </View>

              {budgetLabel ? (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="cash-outline" size={16} color={themePalette.iconAccent} />
                  <Text className={`text-xs ${themePalette.textSecondary}`}>{budgetLabel}</Text>
                </View>
              ) : null}
            </View>

            {createdAtLabel ? (
              <Text className={`mt-3 text-[11px] uppercase tracking-[0.2em] ${themePalette.textSecondary}`}>
                Saved {createdAtLabel}
              </Text>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${themePalette.background}`}>
      <StatusBar style="auto" />
      <BackgroundCircles isDarkMode={isDarkMode} />

      <FlatList
        data={travelList}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TravelCardItem travel={item} />}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListHeaderComponent={
          <View className="pt-10">
            <Text className={`text-sm font-semibold uppercase tracking-[0.2em] ${themePalette.textAccentMuted}`}>
              Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
            </Text>
            <Text className={`mt-2 text-3xl font-bold ${themePalette.textPrimary}`}>
              Ready for your next escape?
            </Text>
            <Text className={`mt-3 text-base ${themePalette.textSecondary}`}>
              Tap into Flidio’s AI to craft bespoke trips, or revisit your saved
              adventures.
            </Text>

            <View className="mt-6">
              <Pressable
                onPress={handleCreateTrip}
                className={`flex-row items-center justify-center flex-1 gap-2 px-5 py-4 rounded-3xl ${themePalette.buttonPrimary}`}
              >
                <Ionicons name="add-circle" size={22} color="white" />
                <Text className={`text-base font-semibold ${themePalette.textWhite}`}>
                  Plan a trip
                </Text>
              </Pressable>
            </View>

            <Button title="Foursquare Places" onPress={fetchFoursquarePlaces} />
            <Button title="Mapbox Directions" onPress={fetchMapboxDirections} />

            <View className="mt-10">
              <View className="flex-row items-center justify-between">
                <Text className={`text-lg font-semibold ${themePalette.textPrimary}`}>
                  Your journeys
                </Text>
                {/* <Pressable
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    // TODO: Navigate to travel archive once implemented
                  }}
                  className="flex-row items-center gap-1"
                >
                  <Text className={`text-sm font-medium ${themePalette.textAccent}`}>
                    See all
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={themePalette.iconAccent} />
                </Pressable> */}
              </View>
            </View>

            <View className="mt-4" />
          </View>
        }
        ListEmptyComponent={
          <View className="mt-4">
            {isLoadingTravels ? (
              <View className={`p-6 rounded-3xl ${themePalette.card} ${themePalette.border}`}>
                <Text className={`text-sm ${themePalette.textSecondary}`}>Loading your journeys...</Text>
              </View>
            ) : loadError ? (
              <View className={`p-6 rounded-3xl ${themePalette.card} ${themePalette.border}`}>
                <Text className={`text-sm ${themePalette.textSecondary}`}>
                  We couldn&apos;t load your saved trips.
                </Text>
                <Pressable
                  onPress={handleRetryLoadTravels}
                  className={`flex-row items-center justify-center gap-2 px-4 py-3 mt-4 border rounded-full ${themePalette.buttonSecondary} ${themePalette.buttonSecondaryBorder}`}
                >
                  <Ionicons name="refresh" size={18} color={themePalette.iconAccent} />
                  <Text className={`text-sm font-semibold ${themePalette.textAccent}`}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <View className={`p-6 border rounded-3xl ${themePalette.card} ${themePalette.border}`}>
                <View className="flex-row items-start gap-4">
                  <View
                    className={`p-4 rounded-2xl ${themePalette.statusInfoBg}`}
                  >
                    <Ionicons name="airplane-outline" size={28} color={themePalette.iconAccent} />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>
                      No trips yet
                    </Text>
                    <Text className={`mt-1 text-sm ${themePalette.textSecondary}`}>
                      Create your first itinerary and it will appear right here ready for takeoff.
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleCreateTrip}
                  className={`flex-row items-center justify-center gap-2 px-4 py-3 mt-5 border rounded-full ${themePalette.buttonSecondary} ${themePalette.buttonSecondaryBorder}`}
                >
                  <Ionicons name="sparkles-outline" size={18} color={themePalette.iconAccent} />
                  <Text className={`text-sm font-semibold ${themePalette.textAccent}`}>
                    Generate an itinerary
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View className="mt-6">
            {hasMoreTravels ? (
              <Pressable
                onPress={async () => {
                  await Haptics.selectionAsync();
                  // TODO: implement travels archive screen
                }}
                className={`flex-row items-center justify-center gap-2 px-4 py-3 border rounded-full ${themePalette.buttonSecondary} ${themePalette.buttonSecondaryBorder}`}
              >
                <Ionicons name="map-outline" size={18} color={themePalette.iconAccent} />
                <Text className={`text-sm font-semibold ${themePalette.textAccent}`}>
                  View all saved itineraries
                </Text>
              </Pressable>
            ) : null}

            <View className="mt-10">
              <View className={`p-6 rounded-3xl ${themePalette.tipBackground} border ${themePalette.tipBorder}`}>
                <Text className={`text-lg font-semibold ${themePalette.tipHeading}`}>Pro tip</Text>
                <Text className={`mt-2 text-sm ${themePalette.tipBody}`}>
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
                  <Text className={`text-sm font-semibold ${themePalette.tipLink}`}>
                    Update profile
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={themePalette.iconTip} />
                </Pressable>
              </View>
            </View>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 50,
          paddingHorizontal: 20,
        }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Home;
