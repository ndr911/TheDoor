import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>THE DOOR</Text>

        <Text style={styles.title}>SAVED</Text>

        <Text style={styles.subtitle}>
          Your favorite spots, all in one place.
        </Text>

        <View style={styles.emptyCard}>
          <Text style={styles.icon}>♡</Text>

          <Text style={styles.emptyTitle}>Nothing saved yet</Text>

          <Text style={styles.emptyText}>
            Explore hidden gems and save the places you want to visit.
          </Text>
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 14,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: 2,
  },

  subtitle: {
    color: "#96919B",
    fontSize: 16,
    marginTop: 12,
  },

  emptyCard: {
    marginTop: 50,
    padding: 30,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    alignItems: "center",
  },

  icon: {
    color: "#C9A45C",
    fontSize: 42,
    marginBottom: 18,
  },

  emptyTitle: {
    color: "#F5F1E8",
    fontSize: 20,
    fontWeight: "600",
  },

  emptyText: {
    color: "#96919B",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },
});
