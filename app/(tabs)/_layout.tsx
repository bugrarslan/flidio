import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";

const TabLayout = () => {
  const iconMap: Record<string, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
    home: {
      focused: "home",
      default: "home-outline",
    },
    settings: {
      focused: "settings",
      default: "settings-outline",
    },
  };

  const handleTabPress = () => {
    void Haptics.selectionAsync();
  };

  return (
    <Tabs
      screenOptions={({ route }) => {
        const icons = iconMap[route.name] ?? iconMap.home;

        return {
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? icons.focused : icons.default}
              size={size}
              color={color}
            />
          ),
        };
      }}
    >
      <Tabs.Screen
        name="home"
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="settings"
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
