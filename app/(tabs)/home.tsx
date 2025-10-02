import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import { useUserProfileContext } from "@/context/UserProfileContext";
import { deleteTravel, getAllTravels, type TravelRecord } from "@/services/databaseService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, PanResponder, Pressable, ScrollView, Text, View } from "react-native";
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
              className={`rounded-full ${isDarkMode ? "bg-red-500/20" : "bg-red-500/15"} p-4`}
            >
              <Ionicons name="trash-outline" size={20} color={isDarkMode ? "#f87171" : "#dc2626"} />
            </Pressable>
          </Animated.View>
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={{ transform: [{ translateX: translateX }], width: "100%" }}
        >
          <Pressable
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

              {budgetLabel ? (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="cash-outline" size={16} color={iconAccentColor} />
                  <Text className={`text-xs ${travelMetaTextClass}`}>{budgetLabel}</Text>
                </View>
              ) : null}
            </View>

            {createdAtLabel ? (
              <Text className={`mt-3 text-[11px] uppercase tracking-[0.2em] ${travelMetaTextClass}`}>
                Saved {createdAtLabel}
              </Text>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    );
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
          </View>
        </View>

        <View className="mt-10">
          <View className="flex-row items-center justify-between">
            <Text className={`text-lg font-semibold ${headingTextClass}`}>
              Your journeys
            </Text>
            {/* <Pressable
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
            </Pressable> */}
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
                {travelList.map((travel) => (
                  <TravelCardItem key={travel.id} travel={travel} />
                ))}

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
