import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

const TabLayout = () => {
  return (
    <NativeTabs minimizeBehavior="automatic">
      <NativeTabs.Trigger name="home">
        <Label>Home</Label>
        <Icon sf={{ default: "house", selected: "house.fill" }} drawable="ic_menu_home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="myTravels">
        <Icon sf={{ default: "map", selected: "map.fill" }} drawable="ic_menu_travels" />
        <Label>My Travels</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} drawable="ic_menu_preferences" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="create" role="search">
        <Icon sf={{ default: "plus", selected: "plus" }} drawable="ic_menu_preferences" />
        <Label>Create</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabLayout;
