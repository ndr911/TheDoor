import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

const FALLBACK_IMAGE = require("../../assets/the_door_venue_placeholder.jpg");

const categories = ["ALL", "COCKTAILS", "SPEAKEASIES", "ROOFTOPS"];

type Venue = {
  id: string;
  name: string;
  neighborhood: string | null;
  rating: number | null;
  category: string | null;
  image_url: string | null;
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
      .select("id, name, neighborhood, rating, category, image_url")
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
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Text style={styles.eyebrow}>THE DOOR</Text>

            <Text style={styles.title}>EXPLORE</Text>

            <View style={styles.goldLine} />

            <Text style={styles.subtitle}>Find what's behind the door.</Text>
          </View>

          {/* SEARCH */}

          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              style={styles.search}
              placeholder="Search bars, cocktails, neighborhoods..."
              placeholderTextColor="#77727C"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* CATEGORIES */}

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

          {/* SECTION HEADER */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>VENUES</Text>

            <Text style={styles.sectionCount}>
              {filteredVenues.length}{" "}
              {filteredVenues.length === 1 ? "SPOT" : "SPOTS"}
            </Text>
          </View>

          {/* CONTENT */}

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
            filteredVenues.map((venue) => {
              const venueImage = venue.image_url
                ? { uri: venue.image_url }
                : FALLBACK_IMAGE;

              return (
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
                  {/* IMAGE */}

                  <View style={styles.imageContainer}>
                    <Image
                      source={venueImage}
                      style={styles.venueImage}
                      resizeMode="cover"
                    />

                    <View style={styles.imageOverlay} />

                    <View style={styles.imageLabel}>
                      <Text style={styles.imageLabelText}>
                        {venue.category
                          ? venue.category.toUpperCase()
                          : "THE DOOR"}
                      </Text>
                    </View>

                    {venue.rating !== null && (
                      <View style={styles.imageRating}>
                        <Text style={styles.star}>★</Text>

                        <Text style={styles.imageRatingText}>
                          {Number(venue.rating).toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* VENUE INFORMATION */}

                  <View style={styles.venueInfo}>
                    <View style={styles.venueMain}>
                      <Text style={styles.venueName} numberOfLines={2}>
                        {venue.name}
                      </Text>

                      <Text style={styles.neighborhood}>
                        {(venue.neighborhood ?? "NEW YORK").toUpperCase()}
                      </Text>
                    </View>

                    <Text style={styles.arrow}>→</Text>
                  </View>
                </Pressable>
              );
            })
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* BOTTOM NAVIGATION */}

        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/home")}
          >
            <Text style={styles.navIcon}>⌂</Text>

            <Text style={styles.navText}>HOME</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/explore")}
          >
            <View style={styles.activeNavIndicator} />

            <Text style={styles.navIconActive}>⌕</Text>

            <Text style={styles.navTextActive}>EXPLORE</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/saved")}
          >
            <Text style={styles.navIcon}>♡</Text>

            <Text style={styles.navText}>SAVED</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.navIcon}>○</Text>

            <Text style={styles.navText}>PROFILE</Text>
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
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 110,
  },

  /* HEADER */

  header: {
    marginBottom: 4,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 12,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 40,
    lineHeight: 43,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_500Medium",
  },

  goldLine: {
    width: 48,
    height: 1,
    backgroundColor: "#C9A45C",
    marginTop: 13,
    marginBottom: 14,
  },

  subtitle: {
    color: "#96919B",
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "CormorantGaramond_500Medium",
  },

  /* SEARCH */

  searchWrapper: {
    height: 54,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 27,
  },

  searchIcon: {
    color: "#C9A45C",
    fontSize: 26,
    marginLeft: 15,
    marginRight: 2,
    transform: [{ rotate: "-15deg" }],
  },

  search: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    color: "#F5F1E8",
    fontSize: 14,
    fontFamily: "CormorantGaramond_500Medium",
  },

  /* CATEGORIES */

  categories: {
    paddingVertical: 20,
    gap: 9,
  },

  category: {
    height: 34,
    borderWidth: 1,
    borderColor: "#332E38",
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryActive: {
    borderColor: "#C9A45C",
    backgroundColor: "#1A1710",
  },

  categoryText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.6,
  },

  categoryTextActive: {
    color: "#C9A45C",
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#29242F",
    paddingTop: 20,
    marginTop: 3,
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#F5F1E8",
    fontSize: 12,
    letterSpacing: 3,
  },

  sectionCount: {
    color: "#C9A45C",
    fontSize: 9,
    letterSpacing: 2,
  },

  /* VENUE CARD */

  venueCard: {
    backgroundColor: "#141219",
    borderWidth: 1,
    borderColor: "#29242F",
    marginBottom: 18,
    overflow: "hidden",
  },

  imageContainer: {
    height: 205,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#211D27",
  },

  venueImage: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.20)",
  },

  imageLabel: {
    position: "absolute",
    left: 17,
    bottom: 15,
  },

  imageLabelText: {
    color: "#D9B65E",
    fontSize: 9,
    letterSpacing: 2.5,
  },

  imageRating: {
    position: "absolute",
    right: 15,
    bottom: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  star: {
    color: "#D9B65E",
    fontSize: 15,
  },

  imageRatingText: {
    color: "#F5F1E8",
    fontSize: 12,
    marginLeft: 5,
    fontFamily: "CormorantGaramond_500Medium",
  },

  venueInfo: {
    minHeight: 76,
    paddingHorizontal: 17,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  venueMain: {
    flex: 1,
    paddingRight: 12,
  },

  venueName: {
    color: "#F5F1E8",
    fontSize: 21,
    lineHeight: 24,
    fontFamily: "CormorantGaramond_500Medium",
    textTransform: "uppercase",
  },

  neighborhood: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 7,
  },

  arrow: {
    color: "#C9A45C",
    fontSize: 23,
    fontWeight: "200",
  },

  /* LOADING */

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },

  loadingText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 12,
  },

  /* EMPTY */

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 55,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 3,
  },

  emptyText: {
    color: "#77727C",
    fontSize: 14,
    textAlign: "center",
    marginTop: 11,
    lineHeight: 21,
    fontFamily: "CormorantGaramond_500Medium",
  },

  bottomSpace: {
    height: 20,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: "#0B0A0F",
    borderTopWidth: 1,
    borderTopColor: "#29242F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 5,
  },

  navItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  activeNavIndicator: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 1,
    backgroundColor: "#C9A45C",
  },

  navIcon: {
    color: "#77727C",
    fontSize: 23,
    lineHeight: 25,
  },

  navIconActive: {
    color: "#C9A45C",
    fontSize: 23,
    lineHeight: 25,
  },

  navText: {
    color: "#77727C",
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 5,
  },

  navTextActive: {
    color: "#C9A45C",
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 5,
  },
});
