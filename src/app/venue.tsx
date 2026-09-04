import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VenueScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ BACK</Text>
        </Pressable>

        <View style={styles.image}>
          <Text style={styles.imageText}>THE DOOR</Text>
        </View>

        <Text style={styles.eyebrow}>WEST VILLAGE</Text>

        <Text style={styles.title}>THE HIDDEN CHAPTER</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.rating}>4.9</Text>
          <Text style={styles.reviews}>128 REVIEWS</Text>
        </View>

        <Text style={styles.description}>
          A hidden cocktail room tucked behind an unmarked door. Intimate,
          moody, and built for late nights.
        </Text>

        <View style={styles.info}>
          <View>
            <Text style={styles.label}>LOCATION</Text>
            <Text style={styles.value}>West Village, NYC</Text>
          </View>

          <View>
            <Text style={styles.label}>HOURS</Text>
            <Text style={styles.value}>5 PM — 2 AM</Text>
          </View>
        </View>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>GET DIRECTIONS</Text>
        </Pressable>
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
    paddingTop: 20,
  },

  back: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 20,
  },

  image: {
    height: 230,
    backgroundColor: "#211D27",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },

  imageText: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 3,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 10,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 27,
    fontWeight: "600",
    letterSpacing: 1.5,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  star: {
    color: "#C9A45C",
    fontSize: 14,
  },

  rating: {
    color: "#F5F1E8",
    fontSize: 14,
    marginLeft: 5,
  },

  reviews: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1,
    marginLeft: 10,
  },

  description: {
    color: "#96919B",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 24,
  },

  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#29242F",
    paddingVertical: 20,
    marginTop: 25,
  },

  label: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  value: {
    color: "#F5F1E8",
    fontSize: 13,
  },

  button: {
    backgroundColor: "#C9A45C",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "#0B0A0F",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
});
