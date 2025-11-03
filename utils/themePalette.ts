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
  iconAccent: string;
  iconMuted: string;
  iconDanger: string;
  iconSuccess: string;
  iconWarning: string;
  statusSuccessBg: string;
  statusSuccessText: string;
  statusWarningBg: string;
  statusWarningText: string;
  statusDangerBg: string;
  statusDangerText: string;
  statusInfoBg: string;
  statusInfoText: string;
  statusGrayBg: string;
  statusGrayText: string;
  switchTrackOff: string;
  switchTrackOn: string;
  switchThumb: string;
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
      iconAccent: "#60a5fa",
      iconMuted: "#94a3b8",
      iconDanger: "#f87171",
      iconSuccess: "#22c55e",
      iconWarning: "#f59e0b",
      statusSuccessBg: "bg-dark-status-success-bg",
      statusSuccessText: "#22c55e",
      statusWarningBg: "bg-dark-status-warning-bg",
      statusWarningText: "#f59e0b",
      statusDangerBg: "bg-dark-status-danger-bg",
      statusDangerText: "#f87171",
      statusInfoBg: "bg-dark-status-info-bg",
      statusInfoText: "#60a5fa",
      statusGrayBg: "bg-dark-status-gray-bg",
      statusGrayText: "#9ca3af",
      switchTrackOff: "#1f2937",
      switchTrackOn: "#2563eb",
      switchThumb: "#f1f5f9",
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
    iconAccent: "#2563eb",
    iconMuted: "#475569",
    iconDanger: "#dc2626",
    iconSuccess: "#22c55e",
    iconWarning: "#f59e0b",
    statusSuccessBg: "bg-light-status-success-bg",
    statusSuccessText: "#22c55e",
    statusWarningBg: "bg-light-status-warning-bg",
    statusWarningText: "#f59e0b",
    statusDangerBg: "bg-light-status-danger-bg",
    statusDangerText: "#dc2626",
    statusInfoBg: "bg-light-status-info-bg",
    statusInfoText: "#2563eb",
    statusGrayBg: "bg-light-status-gray-bg",
    statusGrayText: "#6b7280",
    switchTrackOff: "#cbd5f5",
    switchTrackOn: "#2563eb",
    switchThumb: "#f8fafc",
  };
}