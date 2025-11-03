import React, { ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  children?: ReactNode;
  themePalette: {
    card: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    iconAccent: string;
  };
  headerRight?: ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  children,
  themePalette,
  headerRight,
}) => {
  return (
    <View
      className={`p-6 shadow-lg rounded-3xl border shadow-primary-900/5 ${themePalette.card} ${themePalette.border}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Text className={`text-lg font-semibold ${themePalette.textPrimary}`}>
            {title}
          </Text>
          {description && (
            <Text className={`mt-1 text-sm ${themePalette.textSecondary}`}>
              {description}
            </Text>
          )}
        </View>
        {headerRight ? (
          headerRight
        ) : icon ? (
          <Ionicons
            name={icon}
            size={26}
            color={iconColor || themePalette.iconAccent}
          />
        ) : null}
      </View>

      {/* Content */}
      {children && <View className="mt-5">{children}</View>}
    </View>
  );
};

interface SettingsCardItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description?: string;
  themePalette: {
    textPrimary: string;
    textSecondary: string;
    statusInfoBg: string;
  };
}

export const SettingsCardItem: React.FC<SettingsCardItemProps> = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
  themePalette,
}) => {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className={`p-3 rounded-full ${iconBgColor || themePalette.statusInfoBg}`}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-semibold ${themePalette.textPrimary}`}>
          {title}
        </Text>
        {description && (
          <Text className={`text-xs ${themePalette.textSecondary}`}>
            {description}
          </Text>
        )}
      </View>
    </View>
  );
};

interface SettingsCardActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  isDarkMode?: boolean;
  themePalette: {
    iconAccent: string;
    iconDanger?: string;
  };
  processing?: boolean;
  processingLabel?: string;
}

export const SettingsCardAction: React.FC<SettingsCardActionProps> = ({
  icon,
  iconColor,
  label,
  onPress,
  disabled = false,
  variant = "primary",
  isDarkMode = false,
  themePalette,
  processing = false,
  processingLabel,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return disabled
          ? "bg-primary-500/30"
          : "bg-primary-600";
      case "secondary":
        return `border ${
          isDarkMode
            ? "border-primary-500/30 bg-primary-500/10"
            : "border-primary-500/20 bg-primary-50"
        }`;
      case "danger":
        return `border ${
          isDarkMode
            ? "border-red-500/30 bg-red-500/10"
            : "border-red-500/20 bg-red-50"
        }`;
      default:
        return "bg-primary-600";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return "text-white";
      case "secondary":
        return isDarkMode ? "text-white" : "text-primary-600";
      case "danger":
        return isDarkMode ? "text-red-400" : "text-red-600";
      default:
        return "text-white";
    }
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    switch (variant) {
      case "primary":
        return "white";
      case "secondary":
        return themePalette.iconAccent;
      case "danger":
        return themePalette.iconDanger || "#ef4444";
      default:
        return "white";
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || processing}
      className={`flex-row items-center justify-center gap-2 px-5 py-3 rounded-full ${getVariantStyles()} ${
        disabled || processing ? "opacity-60" : ""
      }`}
    >
      <Ionicons name={icon} size={18} color={getIconColor()} />
      <Text className={`text-sm font-semibold ${getTextColor()}`}>
        {processing && processingLabel ? processingLabel : label}
      </Text>
    </Pressable>
  );
};

interface SettingsCardListItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  chevronColor?: string;
  themePalette: {
    card: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    iconAccent: string;
    iconMuted: string;
  };
  isHighlighted?: boolean;
  isDarkMode?: boolean;
  highlightColor?: "primary" | "danger";
}

export const SettingsCardListItem: React.FC<SettingsCardListItemProps> = ({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
  value,
  onPress,
  disabled = false,
  chevronColor,
  themePalette,
  isHighlighted = false,
  isDarkMode = false,
  highlightColor = "primary",
}) => {
  const getHighlightStyles = () => {
    if (!isHighlighted) return "";
    
    if (highlightColor === "danger") {
      return isDarkMode
        ? "border-red-400 bg-red-500/15"
        : "border-red-500 bg-red-500/10";
    }
    
    return isDarkMode
      ? "border-primary-400 bg-primary-500/10"
      : "border-primary-500 bg-primary-100/60";
  };

  const content = (
    <>
      <View className="flex-row items-center flex-1 gap-3">
        <View className={`p-3 rounded-full ${iconBgColor || themePalette.card}`}>
          <Ionicons name={icon} size={20} color={iconColor || themePalette.iconAccent} />
        </View>
        <View className="flex-1 mr-2">
          <Text className={`text-base font-semibold ${themePalette.textPrimary}`}>
            {title}
          </Text>
          {description && (
            <Text className={`text-xs ${themePalette.textSecondary}`}>
              {description}
            </Text>
          )}
        </View>
      </View>
      {value ? (
        <Text className={`text-sm font-semibold ${themePalette.textSecondary}`}>
          {value}
        </Text>
      ) : onPress ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={chevronColor || themePalette.iconMuted}
        />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${themePalette.card} ${themePalette.border} ${getHighlightStyles()} ${
          disabled ? "opacity-60" : ""
        }`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 border rounded-2xl ${themePalette.card} ${themePalette.border}`}
    >
      {content}
    </View>
  );
};
