import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

const TabLayout = () => {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="ic_menu_home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gear" drawable="ic_menu_preferences" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>

    // <Tabs
    //   screenOptions={({ route }) => {
    //     const icons = iconMap[route.name] ?? iconMap.home;

    //     return {
    //       headerShown: false,
    //       tabBarIcon: ({ color, size, focused }) => (
    //         <Ionicons
    //           name={focused ? icons.focused : icons.default}
    //           size={size}
    //           color={color}
    //         />
    //       ),
    //     };
    //   }}
    // >
    //   <Tabs.Screen
    //     name="home"
    //     listeners={{
    //       tabPress: handleTabPress,
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="settings"
    //     listeners={{
    //       tabPress: handleTabPress,
    //     }}
    //   />
    // </Tabs>
  );
};

export default TabLayout;
