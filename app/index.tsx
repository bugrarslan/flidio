import BackgroundCircles from "@/components/ui/BackgroundCircles";
import { useSettingsContext } from "@/context/SettingsContext";
import { StatusBar } from "expo-status-bar";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  const { settings } = useSettingsContext();
  const isDarkMode = settings?.theme === "dark";
  const backgroundClass = isDarkMode
    ? "bg-background-dark"
    : "bg-background-light";

  return (
    <SafeAreaView className={`flex-1 ${backgroundClass} justify-center items-center`}>
      <StatusBar style="auto" />
      <BackgroundCircles isDarkMode={isDarkMode} />
      <Image
        source={require("@/assets/images/icon.png")}
        style={{ resizeMode: "contain", aspectRatio: 1 }}
        height={200}
      />
    </SafeAreaView>
  );
};

export default index;
