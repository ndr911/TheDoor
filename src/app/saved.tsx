import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

const venuePlaceholder = require("../../assets/the_door_venue_placeholder.jpg");

type Venue = {
  id: string;
  name: string;
  neighborhood: string | null;
  rating: number | null;
  price_level: number | null;
  image_url: string | null;
};

type SavedVenue = {
  id: string;
  venue_id: string;
  venue: Venue | null;
};

type SupabaseSavedVenue = {
  id: string;
  venue_id: string;
  venue: Venue | Venue[] | null;
};

export default function SavedScreen() {
  const [savedVenues, setSavedVenues] = useState<SavedVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedVenues();
  }, []);

  async function loadSavedVenues() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("saved_venues")
      .select(
        `
        id,
        venue_id,
        venue:venues (
          id,
          name,
          neighborhood,
          rating,
          price_level,
          image_url
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error loading saved venues:", error.message);
      setLoading(false);
      return;
    }

    const formattedVenues: SavedVenue[] = (
      (data as SupabaseSavedVenue[]) ?? []
    ).map((saved) => ({
      id: saved.id,
      venue_id: saved.venue_id,
      venue: Array.isArray(saved.venue)
        ? (saved.venue[0] ?? null)
        : (saved.venue ?? null),
    }));

    setSavedVenues(formattedVenues);
    setLoading(false);
  }

  function getPrice(priceLevel: number | null) {
    if (priceLevel === null || priceLevel < 1 || priceLevel > 4) {
      return null;
    }

    return "$".repeat(priceLevel);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <Text style={styles.eyebrow}>THE DOOR</Text>

        <Text style={styles.title}>SAVED</Text>

        <Text style={styles.subtitle}>
          Your favorite spots, all in one place.
        </Text>

        {/* LOADING */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#C9A45C" />

            <Text style={styles.loadingText}>OPENING THE DOOR...</Text>
          </View>
        ) : savedVenues.length === 0 ? (
          /* EMPTY STATE */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>NOTHING SAVED YET</Text>

            <Text style={styles.emptyText}>
              Explore hidden gems and save the places you want to visit.
            </Text>

            <Pressable
              style={styles.exploreButton}
              onPress={() => router.push("/explore")}
            >
              <Text style={styles.exploreButtonText}>EXPLORE VENUES</Text>
            </Pressable>
          </View>
        ) : (
          /* SAVED VENUES */
          <View style={styles.venueList}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>YOUR SPOTS</Text>

              <Text style={styles.sectionCount}>
                {savedVenues.length}{" "}
                {savedVenues.length === 1 ? "SPOT" : "SPOTS"}
              </Text>
            </View>

            {savedVenues.map((saved) => {
              if (!saved.venue) {
                return null;
              }

              const venue = saved.venue;
              const price = getPrice(venue.price_level);

              return (
                <Pressable
                  key={saved.id}
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
                      source={
                        venue.image_url
                          ? { uri: venue.image_url }
                          : venuePlaceholder
                      }
                      style={styles.venueImage}
                      resizeMode="cover"
                    />

                    {/* RATING */}
                    {venue.rating !== null && (
                      <View style={styles.imageRating}>
                        <Text style={styles.star}>★</Text>

                        <Text style={styles.ratingText}>
                          {Number(venue.rating).toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* VENUE INFO */}
                  <View style={styles.venueInfo}>
                    <View style={styles.venueMain}>
                      <Text style={styles.venueName} numberOfLines={1}>
                        {venue.name}
                      </Text>

                      <View style={styles.metaRow}>
                        <Text style={styles.neighborhood}>
                          {venue.neighborhood ?? "NEW YORK"}
                        </Text>

                        {price && (
                          <>
                            <Text style={styles.metaDivider}>•</Text>

                            <Text style={styles.price}>{price}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
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

  /* HEADER */

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

  /* SECTION */

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

  sectionCount: {
    color: "#C9A45C",
    fontSize: 9,
    letterSpacing: 1.5,
  },

  /* LOADING */

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },

  loadingText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 12,
  },

  /* EMPTY */

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 55,
  },

  emptyTitle: {
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 2,
  },

  emptyText: {
    color: "#77727C",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 300,
  },

  exploreButton: {
    height: 50,
    backgroundColor: "#C9A45C",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  exploreButtonText: {
    color: "#0B0A0F",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
  },

  /* VENUE LIST */

  venueList: {
    marginTop: 28,
  },

  venueCard: {
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    marginBottom: 16,
    overflow: "hidden",
  },

  /* IMAGE */

  imageContainer: {
    height: 190,
    position: "relative",
    backgroundColor: "#211D27",
  },

  venueImage: {
    width: "100%",
    height: "100%",
  },

  /* RATING */

  imageRating: {
    position: "absolute",
    right: 14,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 10, 15, 0.82)",
    borderWidth: 1,
    borderColor: "#C9A45C",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  star: {
    color: "#D9B65E",
    fontSize: 18,
    fontWeight: "600",
  },

  ratingText: {
    color: "#F5F1E8",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },

  /* VENUE INFO */

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

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  neighborhood: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.3,
  },

  metaDivider: {
    color: "#4D4853",
    fontSize: 10,
    marginHorizontal: 7,
  },

  price: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 1,
  },
});
