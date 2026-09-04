import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = ["ALL", "COCKTAILS", "SPEAKEASIES", "ROOFTOPS"];

const venues = [
  {
    name: "THE HIDDEN CHAPTER",
    neighborhood: "WEST VILLAGE",
    rating: "4.9",
  },
  {
    name: "VELVET & SMOKE",
    neighborhood: "SOHO",
    rating: "4.8",
  },
  {
    name: "THE MIDNIGHT ROOM",
    neighborhood: "LOWER EAST SIDE",
    rating: "4.9",
  },
];

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.eyebrow}>THE DOOR</Text>

        <Text style={styles.title}>EXPLORE</Text>

        <Text style={styles.subtitle}>Find what's behind the door.</Text>

        <TextInput
          style={styles.search}
          placeholder="Search bars, cocktails, neighborhoods..."
          placeholderTextColor="#77727C"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category, index) => (
            <Pressable
              key={category}
              style={[styles.category, index === 0 && styles.categoryActive]}
            >
              <Text
                style={[
                  styles.categoryText,
                  index === 0 && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TOP SPOTS</Text>
          <Text style={styles.sectionLink}>VIEW ALL</Text>
        </View>

        {venues.map((venue) => (
          <Pressable
            key={venue.name}
            style={styles.venueCard}
            onPress={() =>
              venue.name === "THE HIDDEN CHAPTER" && router.push("/venue")
            }
          >
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>THE DOOR</Text>
            </View>

            <View style={styles.venueInfo}>
              <View style={styles.venueMain}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.neighborhood}>{venue.neighborhood}</Text>
              </View>

              <View style={styles.rating}>
                <Text style={styles.star}>★</Text>
                <Text style={styles.ratingText}>{venue.rating}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 11,
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
    fontSize: 15,
    marginTop: 10,
  },

  search: {
    height: 52,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    paddingHorizontal: 16,
    color: "#F5F1E8",
    marginTop: 28,
    fontSize: 14,
  },

  categories: {
    paddingVertical: 20,
    gap: 10,
  },

  category: {
    borderWidth: 1,
    borderColor: "#29242F",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  categoryActive: {
    borderColor: "#C9A45C",
    backgroundColor: "#1A1710",
  },

  categoryText: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 1.2,
  },

  categoryTextActive: {
    color: "#C9A45C",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#F5F1E8",
    fontSize: 12,
    letterSpacing: 2,
  },

  sectionLink: {
    color: "#C9A45C",
    fontSize: 9,
    letterSpacing: 1.5,
  },

  venueCard: {
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    marginBottom: 16,
  },

  imagePlaceholder: {
    height: 170,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#211D27",
  },

  imageText: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 3,
  },

  venueInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  venueMain: {
    flex: 1,
  },

  venueName: {
    color: "#F5F1E8",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },

  neighborhood: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.3,
    marginTop: 6,
  },

  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },

  star: {
    color: "#C9A45C",
    fontSize: 12,
  },

  ratingText: {
    color: "#F5F1E8",
    fontSize: 12,
    marginLeft: 4,
  },
});
