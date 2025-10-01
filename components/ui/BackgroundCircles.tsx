import React from "react";
import { View } from "react-native";

const BackgroundCircles = () => {
  return (
    <View className="absolute inset-0">
      <View className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-primary-500/15" />
      <View className="absolute w-64 h-64 rounded-full bottom-24 -left-10 bg-primary-900/10" />
    </View>
  );
};

export default BackgroundCircles;
