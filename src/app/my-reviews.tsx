import {
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

const COLORS = {
  background: "#0B0A0F",
  card: "#17141C",
  cardBorder: "#29242F",
  gold: "#C9A45C",
  goldBright: "#D9B65E",
  text: "#F5F1E8",
  muted: "#96919B",
  subtle: "#77727C",
};

type Venue = {
  name: string;
  neighborhood: string | null;
  city: string | null;
};

type Review = {
  id: string;
  venue_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  venue: Venue | null;
};

export default function MyReviewsScreen() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fontsLoaded) loadMyReviews();
  }, [fontsLoaded]);

  async function loadMyReviews() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        Alert.alert("Sign in required", "Please sign in to view your reviews.");
        router.back();
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id,
          venue_id,
          rating,
          review_text,
          created_at,
          venue:venues (
            name,
            neighborhood,
            city
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("REVIEWS FROM SUPABASE:", JSON.stringify(data, null, 2));

      const normalizedReviews: Review[] = (data ?? []).map((review) => {
        const rawVenue = review.venue;

        const venue: Venue | null = Array.isArray(rawVenue)
          ? (rawVenue[0] ?? null)
          : (rawVenue ?? null);

        return {
          id: review.id,
          venue_id: review.venue_id,
          rating: Number(review.rating),
          review_text: review.review_text,
          created_at: review.created_at,
          venue,
        };
      });

      setReviews(normalizedReviews);
    } catch (error) {
      console.log("My reviews error:", error);
      Alert.alert(
        "Unable to load reviews",
        "Something went wrong while loading your reviews.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openVenue(venueId: string) {
    router.push({ pathname: "/venue", params: { id: venueId } });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function renderStars(rating: number) {
    const safeRating = Math.max(0, Math.min(Number(rating), 5));
    return "★".repeat(Math.round(safeRating));
  }

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.loadingText}>OPENING YOUR REVIEWS...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={25} color={COLORS.text} />
            <Text style={styles.backText}>BACK</Text>
          </Pressable>
          <Text style={styles.headerTitle}>MY REVIEWS</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>YOUR EXPERIENCES</Text>
            <View style={styles.titleRow}>
              <Text style={styles.titleNumber}>{reviews.length}</Text>

              <Text style={styles.titleText}>
                {reviews.length === 1 ? "REVIEW" : "REVIEWS"}
              </Text>
            </View>
            <View style={styles.goldLine} />
          </View>

          {reviews.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="create-outline" size={32} color={COLORS.gold} />
              </View>
              <Text style={styles.emptyTitle}>NO REVIEWS YET</Text>
              <Text style={styles.emptyText}>
                Your reviews will appear here after you share your experience at
                a venue.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.exploreButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push("/explore")}
              >
                <Text style={styles.exploreButtonText}>EXPLORE VENUES</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.reviewList}>
              {reviews.map((review) => {
                const venue = review.venue;
                const location = [venue?.neighborhood, venue?.city]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <Pressable
                    key={review.id}
                    style={({ pressed }) => [
                      styles.reviewCard,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => openVenue(review.venue_id)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.venueInfo}>
                        <Text style={styles.venueName} numberOfLines={2}>
                          {venue?.name || "UNKNOWN VENUE"}
                        </Text>
                        {location ? (
                          <Text style={styles.location} numberOfLines={1}>
                            {location.toUpperCase()}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.ratingContainer}>
                        <Text style={styles.stars}>
                          {renderStars(review.rating)}
                        </Text>
                        <Text style={styles.ratingNumber}>
                          {Number(review.rating).toFixed(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {review.review_text ? (
                      <Text style={styles.reviewText} numberOfLines={5}>
                        {review.review_text}
                      </Text>
                    ) : (
                      <Text style={styles.noReview}>NO WRITTEN REVIEW</Text>
                    )}

                    <View style={styles.cardFooter}>
                      <Text style={styles.date}>
                        {formatDate(review.created_at).toUpperCase()}
                      </Text>
                      <View style={styles.viewVenue}>
                        <Text style={styles.viewVenueText}>VIEW VENUE</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={15}
                          color={COLORS.gold}
                        />
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>

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
            <Text style={styles.navIcon}>⌕</Text>
            <Text style={styles.navText}>EXPLORE</Text>
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
            <View style={styles.activeNavIndicator} />
            <Text style={styles.navIconActive}>○</Text>
            <Text style={styles.navTextActive}>PROFILE</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1 },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  backButton: { flexDirection: "row", alignItems: "center", width: 90 },
  backText: {
    color: COLORS.text,
    fontSize: 10,
    letterSpacing: 2.5,
    marginLeft: 2,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 16,
    letterSpacing: 3,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  headerSpacer: { width: 90 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  intro: {
    paddingTop: 28,
    paddingBottom: 22,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  titleNumber: {
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 1,
    fontFamily: "System",
    fontWeight: "600",
  },

  titleText: {
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_600SemiBold",
    marginLeft: 7,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 6,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_600SemiBold",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  goldLine: {
    width: 38,
    height: 1,
    backgroundColor: COLORS.gold,
    marginTop: 12,
  },
  reviewList: { gap: 14 },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 18,
  },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  venueInfo: { flex: 1, paddingRight: 14, minWidth: 0 },
  venueName: {
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 25,
    letterSpacing: 0.7,
    fontFamily: "CormorantGaramond_600SemiBold",
    flexShrink: 1,
  },
  location: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 6,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  ratingContainer: { alignItems: "flex-end" },
  stars: {
    color: COLORS.goldBright,
    fontSize: 13,
    letterSpacing: 1,
  },
  ratingNumber: {
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 23,
    marginTop: 2,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 15,
  },
  reviewText: {
    color: "#E5DED4",
    fontSize: 17,
    lineHeight: 24,
    fontFamily: "CormorantGaramond_500Medium",
  },
  noReview: {
    color: COLORS.subtle,
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },
  date: {
    color: COLORS.subtle,
    fontSize: 9,
    letterSpacing: 1.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  viewVenue: { flexDirection: "row", alignItems: "center" },
  viewVenueText: {
    color: COLORS.gold,
    fontSize: 9,
    letterSpacing: 1.5,
    marginRight: 3,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    letterSpacing: 3,
    marginTop: 18,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 10,
    fontFamily: "CormorantGaramond_500Medium",
  },
  exploreButton: {
    height: 52,
    paddingHorizontal: 25,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: COLORS.background,
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.gold,
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 12,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  pressed: { opacity: 0.7 },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    backgroundColor: "#111016",
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  navIcon: { color: COLORS.muted, fontSize: 23, lineHeight: 25 },
  navIconActive: { color: COLORS.gold, fontSize: 23, lineHeight: 25 },
  navText: {
    color: COLORS.muted,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 4,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  navTextActive: {
    color: COLORS.gold,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 4,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  activeNavIndicator: {
    position: "absolute",
    top: 0,
    width: 32,
    height: 2,
    backgroundColor: COLORS.gold,
  },
});
