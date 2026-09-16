import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

const categories = ["ALL", "COCKTAILS", "SPEAKEASIES", "ROOFTOPS"];

type Venue = {
  id: string;
  name: string;
  neighborhood: string | null;
  rating: number | null;
  category: string | null;
};

export default function DiscoverScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  async function loadVenues() {
    setLoading(true);

    const { data, error } = await supabase
      .from("venues")
      .select("id, name, neighborhood, rating, category")
      .order("rating", { ascending: false });

    if (error) {
      console.log("Error loading venues:", error.message);
      setLoading(false);
      return;
    }

    setVenues(data ?? []);
    setLoading(false);
  }

  const filteredVenues = venues.filter((venue) => {
    const search = searchText.trim().toLowerCase();

    const matchesSearch =
      !search ||
      venue.name.toLowerCase().includes(search) ||
      venue.neighborhood?.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "ALL" ||
      venue.category?.toUpperCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.category, isActive && styles.categoryActive]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TOP SPOTS</Text>

          <Text style={styles.sectionLink}>
            {filteredVenues.length}{" "}
            {filteredVenues.length === 1 ? "SPOT" : "SPOTS"}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#C9A45C" />

            <Text style={styles.loadingText}>OPENING THE DOOR...</Text>
          </View>
        ) : filteredVenues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>NO SPOTS FOUND</Text>

            <Text style={styles.emptyText}>
              Try another category, neighborhood, or search term.
            </Text>
          </View>
        ) : (
          filteredVenues.map((venue) => (
            <Pressable
              key={venue.id}
              style={styles.venueCard}
              onPress={() =>
                router.push({
                  pathname: "/venue",
                  params: { id: venue.id },
                })
              }
            >
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>THE DOOR</Text>
              </View>

              <View style={styles.venueInfo}>
                <View style={styles.venueMain}>
                  <Text style={styles.venueName}>{venue.name}</Text>

                  <Text style={styles.neighborhood}>
                    {venue.neighborhood ?? "NEW YORK"}
                  </Text>
                </View>

                {venue.rating !== null && (
                  <View style={styles.rating}>
                    <Text style={styles.star}>★</Text>

                    <Text style={styles.ratingText}>
                      {Number(venue.rating).toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))
        )}
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

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },

  loadingText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 12,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 2,
  },

  emptyText: {
    color: "#77727C",
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
});
