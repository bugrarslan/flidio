import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signIn" />
      <Stack.Screen name="signUp" />
      <Stack.Screen name="onboardingScreen" />
    </Stack>
  );
};

export default AuthLayout;
