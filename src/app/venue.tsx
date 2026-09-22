import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../../lib/supabase";

type Venue = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  price_level: number | null;
  rating: number | null;
  image_url: string | null;
  password: string | null;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
};

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
  });

  useEffect(() => {
    if (id) {
      loadVenue();
    }
  }, [id]);

  async function loadVenue() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: venueData, error: venueError } = await supabase
        .from("venues")
        .select(
          `
            id,
            name,
            description,
            address,
            neighborhood,
            city,
            state,
            price_level,
            rating,
            image_url,
            password
          `,
        )
        .eq("id", id)
        .single();

      if (venueError) {
        throw venueError;
      }

      setVenue(venueData);
      setImageFailed(false);

      const { data: reviewData, error: reviewError } = await supabase
        .from("reviews")
        .select("*")
        .eq("venue_id", id)
        .order("created_at", {
          ascending: false,
        });

      if (reviewError) {
        console.error("Unable to load reviews:", reviewError);
      }

      setReviews(reviewData ?? []);

      if (user) {
        const { data: savedData, error: savedError } = await supabase
          .from("saved_venues")
          .select("id")
          .eq("user_id", user.id)
          .eq("venue_id", id)
          .maybeSingle();

        if (savedError) {
          console.error("Unable to check saved venue:", savedError);
        }

        setSaved(!!savedData);
      }
    } catch (error) {
      console.error("Venue loading error:", error);

      Alert.alert(
        "Unable to load venue",
        "Something went wrong while loading this venue.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleSaved() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !venue) {
      Alert.alert("Sign in required", "Please sign in to save venues.");
      return;
    }

    if (saved) {
      const { error } = await supabase
        .from("saved_venues")
        .delete()
        .eq("user_id", user.id)
        .eq("venue_id", venue.id);

      if (error) {
        Alert.alert("Unable to remove", error.message);
        return;
      }

      setSaved(false);
    } else {
      const { error } = await supabase.from("saved_venues").insert({
        user_id: user.id,
        venue_id: venue.id,
      });

      if (error) {
        Alert.alert("Unable to save", error.message);
        return;
      }

      setSaved(true);
    }
  }

  async function shareVenue() {
    if (!venue) return;

    try {
      const location = [
        venue.address,
        venue.neighborhood,
        venue.city,
        venue.state,
      ]
        .filter(Boolean)
        .join(", ");

      await Share.share({
        title: venue.name,
        message: [
          `Check out ${venue.name} on The Door.`,
          location ? `\n${location}` : "",
        ].join(""),
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  }

  /*
   * OPEN NATIVE MAPS
   *
   * iOS:
   *   Apple Maps
   *
   * Android:
   *   Google Maps
   *
   * If the native map URL cannot be opened,
   * fall back to Google Maps in the browser.
   */
  async function getDirections() {
    if (!venue) return;

    const address = [
      venue.address,
      venue.neighborhood,
      venue.city,
      venue.state,
      "USA",
    ]
      .filter(Boolean)
      .join(", ");

    if (!address) {
      Alert.alert(
        "Address unavailable",
        "This venue does not have an address yet.",
      );
      return;
    }

    const encodedAddress = encodeURIComponent(address);

    let nativeMapsUrl: string;

    if (Platform.OS === "ios") {
      // Apple Maps
      nativeMapsUrl = `http://maps.apple.com/?daddr=${encodedAddress}`;
    } else {
      // Google Maps
      nativeMapsUrl = `geo:0,0?q=${encodedAddress}`;
    }

    // Browser fallback
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

    try {
      const canOpenNativeMaps = await Linking.canOpenURL(nativeMapsUrl);

      if (canOpenNativeMaps) {
        await Linking.openURL(nativeMapsUrl);
        return;
      }

      await Linking.openURL(googleMapsUrl);
    } catch (error) {
      console.error("Unable to open directions:", error);

      try {
        await Linking.openURL(googleMapsUrl);
      } catch {
        Alert.alert(
          "Unable to open maps",
          "Please try opening your maps application manually.",
        );
      }
    }
  }

  function priceDisplay(priceLevel: number | null) {
    if (!priceLevel) {
      return "—";
    }

    return "$".repeat(Math.min(Math.max(priceLevel, 1), 4));
  }

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>THE DOOR</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.errorText}>VENUE NOT FOUND</Text>

          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>BACK</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * IMAGE LOGIC
   *
   * 1. If Supabase has an image_url, use it.
   * 2. If there is no image_url, use the Door placeholder.
   * 3. If the Supabase image fails, use the Door placeholder.
   */
  const venueImage =
    venue.image_url?.trim() && !imageFailed
      ? { uri: venue.image_url }
      : require("../../assets/the_door_venue_placeholder.jpg");

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =====================================================
            HERO
        ====================================================== */}

        <View style={styles.hero}>
          <ImageBackground
            source={venueImage}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
            onError={() => {
              setImageFailed(true);
            }}
          >
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.15)",
                "rgba(0,0,0,0.02)",
                "rgba(8,7,9,0.94)",
              ]}
              locations={[0, 0.48, 1]}
              style={styles.heroGradient}
            >
              <HeroTop
                saved={saved}
                onBack={() => router.back()}
                onShare={shareVenue}
                onSave={toggleSaved}
              />

              <HeroInformation venue={venue} reviewCount={reviews.length} />
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <View style={styles.content}>
          {/* DESCRIPTION */}

          {venue.description && (
            <Text style={styles.description}>{venue.description}</Text>
          )}

          {/* ===================================================
              LOCATION / PRICE / PASSWORD
          ==================================================== */}

          <View style={styles.infoRow}>
            {/* LOCATION */}

            <View style={styles.infoColumn}>
              <Ionicons
                name="location"
                size={31}
                color="#D7AD5A"
                style={styles.infoIcon}
              />

              <Text style={styles.infoLabel}>LOCATION</Text>

              <Text style={styles.infoValue}>
                {venue.neighborhood || venue.city || "—"}
              </Text>

              {venue.address && (
                <Text style={styles.infoSubValue}>{venue.address}</Text>
              )}

              {venue.city && (
                <Text style={styles.infoSubValue}>
                  {venue.city}
                  {venue.state ? `, ${venue.state}` : ""}
                </Text>
              )}
            </View>

            <View style={styles.verticalDivider} />

            {/* PRICE */}

            <View style={styles.infoColumn}>
              <Ionicons
                name="cash-outline"
                size={31}
                color="#D7AD5A"
                style={styles.infoIcon}
              />

              <Text style={styles.infoLabel}>PRICE</Text>

              <Text style={styles.priceValue}>
                {priceDisplay(venue.price_level)}
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            {/* PASSWORD */}

            <View style={styles.infoColumn}>
              <Ionicons
                name="key-outline"
                size={31}
                color="#D7AD5A"
                style={styles.infoIcon}
              />

              <Text style={styles.infoLabel}>PASSWORD</Text>

              <Text style={styles.infoValue}>
                {venue.password || "Not listed"}
              </Text>
            </View>
          </View>

          {/* ===================================================
              DIRECTIONS
          ==================================================== */}

          <Pressable
            onPress={getDirections}
            style={({ pressed }) => [
              styles.directionsButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="navigate" size={23} color="#D9B65E" />

            <Text style={styles.directionsText}>GET DIRECTIONS</Text>
          </Pressable>

          {/* ===================================================
              REVIEWS HEADER
          ==================================================== */}

          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>REVIEWS</Text>

            <Text style={styles.reviewCount}>{reviews.length}</Text>
          </View>

          {/* WRITE REVIEW */}

          <View style={styles.reviewActionRow}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/review",
                  params: {
                    venueId: venue.id,
                    venueName: venue.name,
                  },
                })
              }
              style={({ pressed }) => [
                styles.writeReviewButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.writeReviewText}>WRITE A REVIEW</Text>
            </Pressable>
          </View>

          {/* ===================================================
              REVIEWS
          ==================================================== */}

          {reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyTitle}>BE THE FIRST</Text>

              <Text style={styles.emptyText}>
                Share your experience at {venue.name}.
              </Text>
            </View>
          ) : (
            <View style={styles.reviewList}>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =============================================================
   HERO TOP
============================================================= */

function HeroTop({
  saved,
  onBack,
  onShare,
  onSave,
}: {
  saved: boolean;
  onBack: () => void;
  onShare: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.heroTop}>
      <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
        <Ionicons name="chevron-back" size={30} color="#F7F0DF" />

        <Text style={styles.backText}>BACK</Text>
      </Pressable>

      <View style={styles.heroActions}>
        <Pressable onPress={onShare} style={styles.iconButton} hitSlop={10}>
          <Ionicons name="share-outline" size={31} color="#F7F0DF" />
        </Pressable>

        <Pressable onPress={onSave} style={styles.iconButton} hitSlop={10}>
          <Ionicons
            name={saved ? "heart" : "heart-outline"}
            size={33}
            color="#E7C875"
          />
        </Pressable>
      </View>
    </View>
  );
}

/* =============================================================
   HERO INFORMATION
============================================================= */

function HeroInformation({
  venue,
  reviewCount,
}: {
  venue: Venue;
  reviewCount: number;
}) {
  return (
    <View style={styles.heroInformation}>
      <Text style={styles.category}>
        {venue.neighborhood?.toUpperCase() || "NIGHTLIFE"} ·{" "}
        {venue.city?.toUpperCase() || "NEW YORK"}
      </Text>

      <Text style={styles.venueName}>{venue.name}</Text>

      <View style={styles.heroGoldLine} />

      <View style={styles.ratingRow}>
        <Ionicons name="star" size={30} color="#E5BC5D" />

        <Text style={styles.rating}>{venue.rating?.toFixed(1) || "—"}</Text>

        <View style={styles.ratingDivider} />

        <Text style={styles.reviewsLabel}>{reviewCount} REVIEWS</Text>
      </View>
    </View>
  );
}

/* =============================================================
   REVIEW CARD
============================================================= */

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const stars = Math.max(0, Math.min(review.rating, 5));

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View>
          <Text style={styles.reviewerName}>MEMBER</Text>

          <Text style={styles.reviewDate}>{date.toUpperCase()}</Text>
        </View>

        <View style={styles.reviewRating}>
          <Text style={styles.stars}>{"★".repeat(stars)}</Text>

          <Text style={styles.ratingNumber}>{review.rating}</Text>
        </View>
      </View>

      {review.comment && (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      )}
    </View>
  );
}

/* =============================================================
   STYLES
============================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09080C",
  },

  scrollContent: {
    paddingBottom: 60,
  },

  /* HERO */

  hero: {
    width: "100%",
    height: 500,
  },

  heroImage: {
    flex: 1,
  },

  heroImageStyle: {
    resizeMode: "cover",
  },

  heroGradient: {
    flex: 1,
    justifyContent: "space-between",
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 22,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  backText: {
    color: "#F7F0DF",
    fontSize: 13,
    letterSpacing: 4,
    marginLeft: 4,
  },

  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },

  iconButton: {
    padding: 3,
  },

  heroInformation: {
    paddingHorizontal: 28,
    paddingBottom: 30,
  },

  category: {
    color: "#E2C477",
    fontSize: 11,
    letterSpacing: 3.5,
    marginBottom: 12,
  },

  venueName: {
    color: "#F8F3E9",
    fontSize: 48,
    lineHeight: 50,
    fontFamily: "CormorantGaramond_500Medium",
  },

  heroGoldLine: {
    width: 135,
    height: 3,
    backgroundColor: "#DDB85F",
    marginTop: 17,
    marginBottom: 18,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rating: {
    color: "#F7F0DF",
    fontSize: 24,
    marginLeft: 10,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  ratingDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#8A806E",
    marginHorizontal: 18,
  },

  reviewsLabel: {
    color: "#F7F0DF",
    fontSize: 11,
    letterSpacing: 3,
  },

  /* CONTENT */

  content: {
    paddingHorizontal: 28,
  },

  description: {
    color: "#D0C9D0",
    fontSize: 21,
    lineHeight: 30,
    marginTop: 30,
    fontFamily: "CormorantGaramond_500Medium",
  },

  /* INFO */

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 30,
    paddingBottom: 26,
  },

  infoColumn: {
    flex: 1,
    minHeight: 0,
  },

  verticalDivider: {
    width: 1,
    height: 105,
    backgroundColor: "#5C5860",
    marginHorizontal: 16,
  },

  infoIcon: {
    marginBottom: 10,
  },

  infoLabel: {
    color: "#A29BA5",
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 7,
  },

  infoValue: {
    color: "#F4EEE3",
    fontSize: 17,
    lineHeight: 22,
    fontFamily: "CormorantGaramond_500Medium",
  },

  infoSubValue: {
    color: "#F4EEE3",
    fontSize: 14,
    lineHeight: 19,
    marginTop: 2,
    fontFamily: "CormorantGaramond_500Medium",
  },

  priceValue: {
    color: "#F4EEE3",
    fontSize: 25,
    letterSpacing: 1,
    fontFamily: "CormorantGaramond_500Medium",
  },

  /* DIRECTIONS */

  /* ============================================================
     MODERN BUTTONS
  ============================================================ */

  directionsButton: {
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C9A45C",
    backgroundColor: "#151219",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 8,

    // Subtle depth
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  directionsText: {
    color: "#D9B65E",
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.985 }],
  },

  /* ============================================================
     REVIEWS HEADER
  ============================================================ */

  reviewHeader: {
    borderTopWidth: 1,
    borderColor: "#29242F",
    marginTop: 42,
    paddingTop: 28,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  reviewTitle: {
    color: "#F6F0E6",
    fontSize: 28,
    letterSpacing: 4,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  reviewCount: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 9,

    borderRadius: 15,
    backgroundColor: "#1A1710",
    borderWidth: 1,
    borderColor: "#C9A45C",

    color: "#D9B65E",
    fontSize: 13,
    textAlign: "center",
    textAlignVertical: "center",

    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* ============================================================
     WRITE REVIEW
  ============================================================ */

  reviewActionRow: {
    marginTop: 18,
    marginBottom: 26,
  },

  writeReviewButton: {
    width: "100%",
    height: 56,

    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C9A45C",
    backgroundColor: "#C9A45C",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },

  writeReviewText: {
    color: "#0B0A0F",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.5,
  },

  /* ============================================================
     REVIEW LIST
  ============================================================ */

  reviewList: {
    gap: 14,
  },

  reviewCard: {
    backgroundColor: "#141218",

    borderWidth: 1,
    borderColor: "#29242F",
    borderRadius: 16,

    paddingHorizontal: 20,
    paddingVertical: 20,

    minHeight: 140,
  },

  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  reviewerName: {
    color: "#D9B65E",
    fontSize: 11,
    letterSpacing: 3.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  reviewDate: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 5,
  },

  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 12,
    backgroundColor: "#1A1710",
    borderWidth: 1,
    borderColor: "#403722",
  },

  stars: {
    color: "#DDB85F",
    fontSize: 14,
    letterSpacing: 1,
  },

  ratingNumber: {
    color: "#F4EEE3",
    fontSize: 14,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  reviewComment: {
    color: "#D8D1D8",
    fontSize: 18,
    lineHeight: 25,

    marginTop: 18,

    fontFamily: "CormorantGaramond_500Medium",
  },

  /* ============================================================
     EMPTY REVIEWS
  ============================================================ */

  emptyReviews: {
    alignItems: "center",

    backgroundColor: "#141218",
    borderWidth: 1,
    borderColor: "#29242F",
    borderRadius: 16,

    paddingHorizontal: 25,
    paddingVertical: 40,

    marginTop: 4,
  },

  emptyTitle: {
    color: "#D9B65E",
    fontSize: 12,
    letterSpacing: 3,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  emptyText: {
    color: "#8C858E",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,

    fontFamily: "CormorantGaramond_500Medium",
  },

  /* LOADING */

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#D9B65E",
    fontSize: 26,
    letterSpacing: 6,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  errorText: {
    color: "#F4EEE3",
    fontSize: 18,
    marginBottom: 20,
  },

  backLink: {
    color: "#D9B65E",
    fontSize: 12,
    letterSpacing: 3,
  },
});
