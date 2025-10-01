import BackgroundCircles from "@/components/ui/BackgroundCircles";
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

  const handleCreateTrip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/createTravelModal");
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <BackgroundCircles />

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 50 }}>
        <View className="pt-10">
          <Text className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600/80">
            Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
          </Text>
          <Text className="mt-2 text-3xl font-bold text-primary-900">
            Ready for your next escape?
          </Text>
          <Text className="mt-3 text-base text-secondary-600">
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
            <Text className="text-lg font-semibold text-primary-900">
              Upcoming journeys
            </Text>
            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                // TODO: Navigate to travel archive once implemented
              }}
              className="flex-row items-center gap-1"
            >
              <Text className="text-sm font-medium text-primary-600">
                See all
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#2563eb" />
            </Pressable>
          </View>

          <View className="p-6 mt-4 border rounded-3xl border-primary-500/15 bg-white/70">
            <View className="flex-row items-start gap-4">
              <View className="p-4 rounded-2xl bg-primary-600/10">
                <Ionicons name="airplane-outline" size={28} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-primary-900">
                  No trips yet
                </Text>
                <Text className="mt-1 text-sm text-secondary-600">
                  Create your first itinerary and it will appear right here
                  ready for takeoff.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleCreateTrip}
              className="flex-row items-center justify-center gap-2 px-4 py-3 mt-5 border rounded-full border-primary-500/30"
            >
              <Ionicons name="sparkles-outline" size={18} color="#2563eb" />
              <Text className="text-sm font-semibold text-primary-600">
                Generate an itinerary
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-10">
          <View className="p-6 border rounded-3xl border-primary-500/15 bg-primary-900/90">
            <Text className="text-lg font-semibold text-white">Pro tip</Text>
            <Text className="mt-2 text-sm text-primary-50/90">
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
              <Text className="text-sm font-semibold text-primary-50">
                Update profile
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#bfdbfe" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
