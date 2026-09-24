import {
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import { router } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpSupportScreen() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
  });

  const supportEmail = "support@thedoor.com";

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>OPENING THE DOOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.headerContent}>
            <Text style={styles.eyebrow}>THE DOOR</Text>

            <Text style={styles.title}>HELP & SUPPORT</Text>

            <View style={styles.goldLine} />
          </View>
        </View>

        {/* CONTENT */}

        <View style={styles.content}>
          <Text style={styles.heading}>NEED SOME HELP?</Text>

          <Text style={styles.description}>
            Have a question or need help? Get in touch with us.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.emailCard,
              pressed && styles.pressed,
            ]}
            onPress={() => Linking.openURL(`mailto:${supportEmail}`)}
          >
            <Text style={styles.emailLabel}>CONTACT US</Text>

            <Text style={styles.email}>{supportEmail}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  screen: {
    flex: 1,
    backgroundColor: "#0B0A0F",
    paddingHorizontal: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 26,
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
  },

  backArrow: {
    color: "#C9A45C",
    fontSize: 38,
    lineHeight: 38,
    fontFamily: "CormorantGaramond_500Medium",
  },

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 10,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: 1.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  goldLine: {
    width: 48,
    height: 1,
    backgroundColor: "#C9A45C",
    marginTop: 13,
  },

  content: {
    marginTop: 70,
  },

  heading: {
    color: "#F5F1E8",
    fontSize: 22,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  description: {
    color: "#96919B",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    fontFamily: "CormorantGaramond_500Medium",
  },

  emailCard: {
    marginTop: 40,
    paddingVertical: 22,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#29242F",
  },

  pressed: {
    opacity: 0.65,
  },

  emailLabel: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 2.5,
    marginBottom: 8,
  },

  email: {
    color: "#C9A45C",
    fontSize: 20,
    letterSpacing: 0.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#D9B65E",
    fontSize: 18,
    letterSpacing: 3,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
});
