import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

type Venue = {
  id: string;
  name: string;
  neighborhood: string | null;
  rating: number | null;
};

type SavedVenue = {
  id: string;
  venue_id: string;
  venue: Venue | null;
};

type SupabaseSavedVenue = {
  id: string;
  venue_id: string;
  venue: Venue[] | null;
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
          rating
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
      venue: saved.venue?.[0] ?? null,
    }));

    setSavedVenues(formattedVenues);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.eyebrow}>THE DOOR</Text>

        <Text style={styles.title}>SAVED</Text>

        <Text style={styles.subtitle}>
          Your favorite spots, all in one place.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#C9A45C" />

            <Text style={styles.loadingText}>OPENING THE DOOR...</Text>
          </View>
        ) : savedVenues.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.icon}>♡</Text>

            <Text style={styles.emptyTitle}>Nothing saved yet</Text>

            <Text style={styles.emptyText}>
              Explore hidden gems and save the places you want to visit.
            </Text>
          </View>
        ) : (
          <View style={styles.venueList}>
            {savedVenues.map((saved) => {
              if (!saved.venue) return null;

              return (
                <Pressable
                  key={saved.id}
                  style={styles.venueCard}
                  onPress={() =>
                    router.push({
                      pathname: "/venue",
                      params: { id: saved.venue!.id },
                    })
                  }
                >
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imageText}>THE DOOR</Text>
                  </View>

                  <View style={styles.venueInfo}>
                    <View style={styles.venueMain}>
                      <Text style={styles.venueName}>{saved.venue.name}</Text>

                      <Text style={styles.neighborhood}>
                        {saved.venue.neighborhood ?? "NEW YORK"}
                      </Text>
                    </View>

                    {saved.venue.rating !== null && (
                      <View style={styles.rating}>
                        <Text style={styles.star}>★</Text>

                        <Text style={styles.ratingText}>
                          {Number(saved.venue.rating).toFixed(1)}
                        </Text>
                      </View>
                    )}
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
    paddingTop: 40,
    paddingBottom: 120,
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

  loadingContainer: {
    marginTop: 50,
    alignItems: "center",
    paddingVertical: 40,
  },

  loadingText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
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

  venueList: {
    marginTop: 35,
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
