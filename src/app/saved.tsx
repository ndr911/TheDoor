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

          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>♡</Text>
            </View>

            <Text style={styles.emptyTitle}>NOTHING SAVED YET</Text>

            <Text style={styles.emptyText}>
              Explore hidden gems and save the places you want to visit.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.exploreButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push("/explore")}
            >
              <Text style={styles.exploreButtonText}>EXPLORE VENUES</Text>
            </Pressable>
          </View>
        ) : (
          /* SAVED VENUES */

          <View style={styles.venueList}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>YOUR SPOTS</Text>

                <View style={styles.sectionAccent} />
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.sectionCount}>{savedVenues.length}</Text>
              </View>
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
                  style={({ pressed }) => [
                    styles.venueCard,
                    pressed && styles.cardPressed,
                  ]}
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

                    {/* IMAGE OVERLAY */}

                    <View style={styles.imageOverlay} />

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
                        <Text style={styles.neighborhood} numberOfLines={1}>
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

                    <View style={styles.chevronContainer}>
                      <Text style={styles.chevron}>›</Text>
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
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 10,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  title: {
    color: "#F5F1E8",
    fontSize: 38,
    letterSpacing: 3,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  subtitle: {
    color: "#96919B",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontFamily: "CormorantGaramond_400Regular",
  },

  /* LOADING */

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 70,
  },

  loadingText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 12,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* EMPTY */

  emptyCard: {
    marginTop: 38,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 42,
    alignItems: "center",
  },

  emptyIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#1D1921",
    borderWidth: 1,
    borderColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyIcon: {
    color: "#C9A45C",
    fontSize: 30,
    marginTop: -2,
  },

  emptyTitle: {
    color: "#F5F1E8",
    fontSize: 15,
    letterSpacing: 2.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  emptyText: {
    color: "#77727C",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 280,
    fontFamily: "CormorantGaramond_400Regular",
  },

  exploreButton: {
    height: 52,
    width: "100%",
    backgroundColor: "#C9A45C",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },

  exploreButtonText: {
    color: "#0B0A0F",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* SECTION */

  venueList: {
    marginTop: 34,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#F5F1E8",
    fontSize: 16,
    letterSpacing: 2.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  sectionAccent: {
    width: 24,
    height: 1,
    backgroundColor: "#C9A45C",
    marginTop: 6,
  },

  countBadge: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    backgroundColor: "#1A1710",
    borderWidth: 1,
    borderColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionCount: {
    color: "#D9B65E",
    fontSize: 13,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* VENUE CARD */

  venueCard: {
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },

  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.992 }],
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

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: "rgba(11, 10, 15, 0.16)",
  },

  /* RATING */

  imageRating: {
    position: "absolute",
    right: 14,
    bottom: 12,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 10, 15, 0.88)",
    borderWidth: 1,
    borderColor: "#C9A45C",
    borderRadius: 12,
    paddingHorizontal: 11,
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
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* VENUE INFO */

  venueInfo: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 12,
  },

  venueMain: {
    flex: 1,
  },

  venueName: {
    color: "#F5F1E8",
    fontSize: 17,
    letterSpacing: 1.1,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  neighborhood: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 1.3,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  metaDivider: {
    color: "#4D4853",
    fontSize: 10,
    marginHorizontal: 7,
  },

  price: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1D1921",
    borderWidth: 1,
    borderColor: "#29242F",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  chevron: {
    color: "#C9A45C",
    fontSize: 21,
    lineHeight: 22,
    marginTop: -2,
  },

  /* BUTTON PRESS */

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});
