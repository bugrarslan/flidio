import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { getThemePalette } from "@/utils/themePalette";
import {
  validateSignUpForm,
  FormData,
  FormErrors,
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/utils/formValidation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthService } from "@/services/supabase/auth/authSerivce";
import { useSubscriptionContext } from "@/context/SubscriptionContext";

const SignUp = () => {
  const colorScheme = useColorScheme();
  const theme = getThemePalette(colorScheme ?? "light");
  const router = useRouter();
  const { customerInfo } = useSubscriptionContext();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation for touched fields
    if (touchedFields[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: keyof FormData) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field: keyof FormData, value: string) => {
    let fieldError: string | undefined;

    switch (field) {
      case "fullName":
        const nameValidation = validateFullName(value);
        fieldError = nameValidation.isValid ? undefined : nameValidation.error;
        break;
      case "email":
        const emailValidation = validateEmail(value);
        fieldError = emailValidation.isValid
          ? undefined
          : emailValidation.error;
        break;
      case "password":
        const passwordValidation = validatePassword(value);
        fieldError = passwordValidation.isValid
          ? undefined
          : passwordValidation.error;
        // Also revalidate confirm password if it's been touched
        if (touchedFields.confirmPassword && formData.confirmPassword) {
          const confirmValidation = validateConfirmPassword(
            value,
            formData.confirmPassword
          );
          setErrors((prev) => ({
            ...prev,
            confirmPassword: confirmValidation.isValid
              ? undefined
              : confirmValidation.error,
          }));
        }
        break;
      case "confirmPassword":
        const confirmValidation = validateConfirmPassword(
          formData.password,
          value
        );
        fieldError = confirmValidation.isValid
          ? undefined
          : confirmValidation.error;
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const handleSignUp = async () => {
    // Validate all fields
    const validationErrors = validateSignUpForm(formData);
    setErrors(validationErrors);

    // Mark all fields as touched
    setTouchedFields({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // If no errors, proceed with sign up
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const { user, session, error } = await AuthService.signUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          revenuecatCustomerId: customerInfo?.originalAppUserId,
        });

        if (error) {
          Alert.alert(
            "Sign Up Failed",
            error.message ||
              "An error occurred during sign up. Please try again."
          );
          return;
        }

        if (user && session) {
          Alert.alert(
            "Success!",
            "Your account has been created successfully.",
            [
              {
                text: "OK",
                onPress: () => router.replace("/(tabs)/home"),
              },
            ]
          );
        } else if (user && !session) {
          // Email confirmation required
          Alert.alert(
            "Verify Your Email",
            "Please check your email to verify your account before signing in.",
            [
              {
                text: "OK",
                onPress: () => router.push("/signIn"),
              },
            ]
          );
        }
      } catch (error) {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
        console.error("Sign up error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await AuthService.signInWithGoogle();

      if (error) {
        Alert.alert(
          "Google Sign In Failed",
          error.message ||
            "An error occurred during Google sign in. Please try again."
        );
      }
      // Note: Success handling is done via onAuthStateChange listener
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await AuthService.signInWithApple();

      if (error) {
        Alert.alert(
          "Apple Sign In Failed",
          error.message ||
            "An error occurred during Apple sign in. Please try again."
        );
      }
      // Note: Success handling is done via onAuthStateChange listener
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      console.error("Apple sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToSignIn = () => {
    router.push("/signIn");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className={`flex-1 ${theme.background}`}
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Logo/Icon Section */}
          <View className="items-center mb-8">
            <View
              className={`w-20 h-20 rounded-3xl items-center justify-center mb-4 ${theme.accent}`}
            >
              <Image
                source={require("@/assets/images/icon.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
            <Text className={`text-3xl font-bold ${theme.textPrimary}`}>
              Create Account
            </Text>
            <Text
              className={`text-base ${theme.textSecondary} mt-2 text-center`}
            >
              Join us and start exploring amazing places
            </Text>
          </View>

          {/* Social Sign In Buttons */}
          <View className="gap-3 mb-6">
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              className={`flex-row items-center justify-center py-4 px-6 rounded-2xl border-2 ${theme.socialButtonGoogle} ${theme.socialButtonGoogleBorder}`}
              activeOpacity={0.7}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
              <Text
                className={`ml-3 text-base font-semibold ${theme.socialButtonGoogleText}`}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAppleSignIn}
              className={`flex-row items-center justify-center py-4 px-6 rounded-2xl border-2 ${theme.socialButtonApple} ${theme.socialButtonAppleBorder}`}
              activeOpacity={0.7}
            >
              <Ionicons
                name="logo-apple"
                size={22}
                color={colorScheme === "dark" ? "#000" : "#fff"}
              />
              <Text
                className={`ml-3 text-base font-semibold ${theme.socialButtonAppleText}`}
              >
                Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className={`flex-1 h-[1px] ${theme.dividerLine}`} />
            <Text className={`mx-4 text-sm ${theme.dividerText}`}>
              or sign up with email
            </Text>
            <View className={`flex-1 h-[1px] ${theme.dividerLine}`} />
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Full Name Input */}
            <View>
              <Text className={`text-sm font-medium ${theme.textPrimary} mb-2`}>
                Full Name
              </Text>
              <View
                className={`flex-row items-center ${theme.inputBackground} border-2 ${
                  errors.fullName ? theme.errorBorder : theme.border
                } rounded-xl px-4`}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.fullName ? theme.iconDanger : theme.iconMuted}
                />
                <TextInput
                  className={`flex-1 py-4 px-3 ${theme.textPrimary}`}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.iconMuted}
                  value={formData.fullName}
                  onChangeText={(value) => handleFieldChange("fullName", value)}
                  onBlur={() => handleFieldBlur("fullName")}
                  autoCapitalize="words"
                />
              </View>
              {errors.fullName && (
                <Text className={`text-sm ${theme.errorText} mt-1 ml-1`}>
                  {errors.fullName}
                </Text>
              )}
            </View>

            {/* Email Input */}
            <View>
              <Text className={`text-sm font-medium ${theme.textPrimary} mb-2`}>
                Email Address
              </Text>
              <View
                className={`flex-row items-center ${theme.inputBackground} border-2 ${
                  errors.email ? theme.errorBorder : theme.border
                } rounded-xl px-4`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? theme.iconDanger : theme.iconMuted}
                />
                <TextInput
                  className={`flex-1 py-4 px-3 ${theme.textPrimary}`}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.iconMuted}
                  value={formData.email}
                  onChangeText={(value) => handleFieldChange("email", value)}
                  onBlur={() => handleFieldBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text className={`text-sm ${theme.errorText} mt-1 ml-1`}>
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <Text className={`text-sm font-medium ${theme.textPrimary} mb-2`}>
                Password
              </Text>
              <View
                className={`flex-row items-center ${theme.inputBackground} border-2 ${
                  errors.password ? theme.errorBorder : theme.border
                } rounded-xl px-4`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? theme.iconDanger : theme.iconMuted}
                />
                <TextInput
                  className={`flex-1 py-4 px-3 ${theme.textPrimary}`}
                  placeholder="Create a password"
                  placeholderTextColor={theme.iconMuted}
                  value={formData.password}
                  onChangeText={(value) => handleFieldChange("password", value)}
                  onBlur={() => handleFieldBlur("password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={theme.iconMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className={`text-sm ${theme.errorText} mt-1 ml-1`}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text className={`text-sm font-medium ${theme.textPrimary} mb-2`}>
                Confirm Password
              </Text>
              <View
                className={`flex-row items-center ${theme.inputBackground} border-2 ${
                  errors.confirmPassword ? theme.errorBorder : theme.border
                } rounded-xl px-4`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    errors.confirmPassword ? theme.iconDanger : theme.iconMuted
                  }
                />
                <TextInput
                  className={`flex-1 py-4 px-3 ${theme.textPrimary}`}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.iconMuted}
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleFieldChange("confirmPassword", value)
                  }
                  onBlur={() => handleFieldBlur("confirmPassword")}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color={theme.iconMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className={`text-sm ${theme.errorText} mt-1 ml-1`}>
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              className={`${theme.buttonPrimary} py-4 rounded-xl mt-2 ${
                isLoading ? "opacity-70" : ""
              }`}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-center text-white">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View className="flex-row justify-center mt-4 mb-2">
              <Text className={`text-sm ${theme.textSecondary}`}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={handleToSignIn}>
                <Text className={`text-sm font-semibold ${theme.textAccent}`}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
