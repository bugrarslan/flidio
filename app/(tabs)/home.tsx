import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import { useUserProfileContext } from "@/context/UserProfileContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const router = useRouter();
  const { profile } = useUserProfileContext();
  const { settings } = useSettingsContext();

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

  const handleCreateTrip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/createTravelModal");
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

          <View className={`p-6 mt-4 border rounded-3xl ${cardClass}`}>
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
                  Create your first itinerary and it will appear right here
                  ready for takeoff.
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
