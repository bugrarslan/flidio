export type ThemePalette = {
  background: string;
  surface: string;
  card: string;
  border: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  textAccentMuted: string;
  inputBackground: string;
  inputPlaceholder: string;
};

export function getThemePalette(theme?: string): ThemePalette {
  const isDark = theme === "dark";

  if (isDark) {
    return {
      background: "bg-dark-background",
      surface: "bg-dark-surface",
      card: "bg-dark-card",
      border: "border-dark-border",
      accent: "bg-dark-accent",
      textPrimary: "text-dark-text-primary",
      textSecondary: "text-dark-text-secondary",
      textMuted: "text-dark-text-muted",
      textAccent: "text-dark-text-accent",
      textAccentMuted: "text-dark-text-accentMuted",
      inputBackground: "bg-dark-input-background",
      inputPlaceholder: "placeholder:text-dark-input-placeholder",
    };
  }

  return {
    background: "bg-light-background",
    surface: "bg-light-surface",
    card: "bg-light-card",
    border: "border-light-border",
    accent: "bg-light-accent",
    textPrimary: "text-light-text-primary",
    textSecondary: "text-light-text-secondary",
    textMuted: "text-light-text-muted",
    textAccent: "text-light-text-accent",
    textAccentMuted: "text-light-text-accentMuted",
    inputBackground: "bg-light-input-background",
    inputPlaceholder: "placeholder:text-light-input-placeholder",
  };
}