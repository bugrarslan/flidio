import { useSettingsContext } from "@/context/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Purchases, { PurchasesOfferings, PurchasesPackage } from "react-native-purchases";
import { SafeAreaView } from "react-native-safe-area-context";

const PROMO_FEATURES = [
  "Unlimited travel itineraries",
  "AI-powered recommendations", 
  "Offline access everywhere",
  "Priority customer support",
  "Advanced customization",
  "Early access to new features"
] as const;

const PromotionScreen = () => {
  const router = useRouter();
  const { settings } = useSettingsContext();
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  useEffect(() => {
    getOfferings();
  }, []);

  async function getOfferings() {
    const offerings = await Purchases.getOfferings();
    if (
      offerings.current !== null &&
      offerings.current.availablePackages.length !== 0
    ) {
      console.log("Offerings:", JSON.stringify(offerings, null, 2));
      setOfferings(offerings);
    }
  }

  const isDarkMode = settings?.theme === "dark";

  const handleUnlockPro = useCallback(async (pkg: PurchasesPackage) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (typeof customerInfo.entitlements.active["$rc_monthly"] !== "undefined") {
        router.back();
      } 
    } catch (e) {
      console.log("Purchase error:", e);
    }
  }, [router]);

  const handleMaybeLater = useCallback(async () => {
    await Haptics.selectionAsync();
    router.back();
  }, [router]);

  return (
    <View 
      style={{ 
        flex: 1,
        backgroundColor: isDarkMode ? '#1e293b' : '#1e3a8a'
      }}
    >
      <StatusBar style="auto" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pt-4 pb-8">
            <Pressable onPress={handleMaybeLater}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
          </View>

          {/* Title */}
          <Text className="mb-2 text-3xl font-bold text-white">
            Unlock Premium Flidio
          </Text>
          <Text className="mb-8 text-lg text-white/80">
            Choose the perfect plan for your travel obsession
          </Text>

          {/* What You'll Get Section */}
          <Text className="mb-4 text-xl font-bold text-white">
            What You&apos;ll Get:
          </Text>
          
          <View className="mb-8">
            {PROMO_FEATURES.map((feature, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <View className="items-center justify-center w-6 h-6 mr-4 bg-green-500 rounded-full">
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
                <Text className="flex-1 text-base text-white">{feature}</Text>
              </View>
            ))}
          </View>

          {/* Premium Plan Card */}
          <View className="p-6 mb-8 bg-white/10 rounded-3xl">
            <Text className="mb-4 text-2xl font-bold text-white">
              Premium Flidio
            </Text>
            
            <View className="flex-row items-baseline mb-6">
              <Text className="text-4xl font-bold text-white">$2.99</Text>
              <Text className="ml-2 text-lg text-white/80">/monthly</Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text className="ml-3 text-white">Unlock all trips</Text>
              </View>
              {/* <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text className="ml-3 text-white">Remove blur effect</Text>
              </View> */}
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text className="ml-3 text-white">Monthly new destinations</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text className="ml-3 text-white">Basic support</Text>
              </View>
            </View>
            
            <Pressable 
              onPress={() => handleUnlockPro(offerings?.current!.availablePackages[0]!)}
              className="py-4 mt-6 bg-white/20 rounded-2xl"
            >
              <Text className="text-lg font-semibold text-center text-white">
                Select Plan
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <Text className="text-sm text-center text-white/60">
            Cancel anytime • Secure payment • Instant access
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PromotionScreen;
