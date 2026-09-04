import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>D</Text>
          </View>
        </View>

        {/* App name */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>THE DOOR</Text>

          <View style={styles.line} />

          <Text style={styles.subtitle}>DISCOVER WHAT'S BEHIND THE DOOR</Text>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <Text style={styles.description}>
            Discover hidden cocktail bars, secret entrances, and unforgettable
            nights.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.buttonText}>ENTER THE DOOR</Text>
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

  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 45,
  },

  logoContainer: {
    alignItems: "center",
  },

  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#C9A45C",
    fontSize: 55,
    fontWeight: "300",
  },

  titleContainer: {
    alignItems: "center",
  },

  title: {
    color: "#F5F1E8",
    fontSize: 42,
    fontWeight: "300",
    letterSpacing: 8,
  },

  line: {
    width: 70,
    height: 1,
    backgroundColor: "#C9A45C",
    marginVertical: 22,
  },

  subtitle: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 3,
    textAlign: "center",
  },

  bottomSection: {
    alignItems: "center",
  },

  description: {
    color: "#A6A1AA",
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: 32,
  },

  button: {
    backgroundColor: "#C9A45C",
    width: "100%",
    paddingVertical: 19,
    borderRadius: 4,
    alignItems: "center",
  },

  buttonText: {
    color: "#0B0A0F",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
