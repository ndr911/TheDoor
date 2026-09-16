import { router, useLocalSearchParams } from "expo-router";
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

type Venue = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  neighborhood: string | null;
  price_level: number | null;
  rating: number | null;
};

type Review = {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profile: {
    name: string | null;
  } | null;
};

type SupabaseReview = {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profile:
    | {
        name: string | null;
      }[]
    | null;
};

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadVenue();
    }
  }, [id]);

  async function loadVenue() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("No authenticated user found.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("venues")
      .select(
        "id, name, description, address, city, state, country, neighborhood, price_level, rating",
      )
      .eq("id", id)
      .single();

    if (error) {
      console.log("Error loading venue:", error.message);
      setLoading(false);
      return;
    }

    setVenue(data);

    const { data: savedVenue, error: savedError } = await supabase
      .from("saved_venues")
      .select("id")
      .eq("user_id", user.id)
      .eq("venue_id", id)
      .maybeSingle();

    if (savedError) {
      console.log("Error checking saved venue:", savedError.message);
    }

    setIsSaved(!!savedVenue);

    const { data: reviewData, error: reviewError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        review_text,
        created_at,
        profile:profiles (
          name
        )
      `,
      )
      .eq("venue_id", id)
      .order("created_at", { ascending: false });

    if (reviewError) {
      console.log("Error loading reviews:", reviewError.message);
    } else {
      const formattedReviews: Review[] = (
        (reviewData as SupabaseReview[]) ?? []
      ).map((review) => ({
        id: review.id,
        rating: review.rating,
        review_text: review.review_text,
        created_at: review.created_at,
        profile: review.profile?.[0] ?? null,
      }));

      setReviews(formattedReviews);
    }

    setLoading(false);
  }

  async function toggleSave() {
    if (!venue) return;

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Login required", "Please log in to save venues.");
      setSaving(false);
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from("saved_venues")
        .delete()
        .eq("user_id", user.id)
        .eq("venue_id", venue.id);

      if (error) {
        console.log("Error removing saved venue:", error.message);
        Alert.alert("Couldn't remove", error.message);
        setSaving(false);
        return;
      }

      setIsSaved(false);
    } else {
      const { error } = await supabase.from("saved_venues").insert({
        user_id: user.id,
        venue_id: venue.id,
      });

      if (error) {
        console.log("Error saving venue:", error.message);
        Alert.alert("Couldn't save", error.message);
        setSaving(false);
        return;
      }

      setIsSaved(true);
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#C9A45C" />

          <Text style={styles.loadingText}>OPENING THE DOOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹ BACK</Text>
          </Pressable>

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>VENUE NOT FOUND</Text>

            <Text style={styles.emptyText}>
              We couldn't find this spot in The Door.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const location = [venue.neighborhood, venue.city, venue.state]
    .filter(Boolean)
    .join(", ");

  const priceLevel =
    venue.price_level !== null
      ? "$".repeat(Math.max(1, Math.min(venue.price_level, 5)))
      : "—";

  const reviewAverage =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  const displayedRating = reviewAverage !== null ? reviewAverage : venue.rating;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ BACK</Text>
        </Pressable>

        <View style={styles.image}>
          <Text style={styles.imageText}>THE DOOR</Text>
        </View>

        <Text style={styles.eyebrow}>{venue.neighborhood ?? "NEW YORK"}</Text>

        <Text style={styles.title}>{venue.name}</Text>

        <View style={styles.ratingRow}>
          {displayedRating !== null && (
            <>
              <Text style={styles.star}>★</Text>

              <Text style={styles.rating}>
                {Number(displayedRating).toFixed(1)}
              </Text>
            </>
          )}

          <Text style={styles.reviews}>
            {reviews.length === 0
              ? "NO REVIEWS YET"
              : `${reviews.length} ${
                  reviews.length === 1 ? "REVIEW" : "REVIEWS"
                }`}
          </Text>
        </View>

        <Text style={styles.description}>
          {venue.description ??
            "A destination waiting to be discovered behind the door."}
        </Text>

        <View style={styles.info}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>LOCATION</Text>

            <Text style={styles.value}>{location || "NEW YORK"}</Text>

            {venue.address && (
              <Text style={styles.address}>{venue.address}</Text>
            )}
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>PRICE</Text>

            <Text style={styles.value}>{priceLevel}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, isSaved && styles.saveButtonActive]}
          onPress={toggleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color={isSaved ? "#C9A45C" : "#0B0A0F"}
            />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                isSaved && styles.saveButtonTextActive,
              ]}
            >
              {isSaved ? "SAVED ✓" : "SAVE VENUE"}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>GET DIRECTIONS</Text>
        </Pressable>

        <Pressable
          style={styles.reviewButton}
          onPress={() =>
            router.push({
              pathname: "/review",
              params: {
                id: venue.id,
                venueName: venue.name,
              },
            })
          }
        >
          <Text style={styles.reviewButtonText}>WRITE A REVIEW</Text>
        </Pressable>

        <View style={styles.reviewsSection}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>REVIEWS</Text>

            <Text style={styles.reviewCount}>{reviews.length}</Text>
          </View>

          {reviews.length === 0 ? (
            <View style={styles.noReviews}>
              <Text style={styles.noReviewsTitle}>NO REVIEWS YET</Text>

              <Text style={styles.noReviewsText}>
                Be the first to share your experience at this spot.
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewerName}>
                    {review.profile?.name ?? "THE DOOR MEMBER"}
                  </Text>

                  <View style={styles.reviewRating}>
                    <Text style={styles.star}>★</Text>

                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>

                {review.review_text && (
                  <Text style={styles.reviewText}>{review.review_text}</Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  reviewButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9A45C",
    marginTop: 12,
  },

  reviewButtonText: {
    color: "#C9A45C",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 50,
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

  infoBlock: {
    flex: 1,
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

  address: {
    color: "#77727C",
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },

  saveButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9A45C",
    marginTop: 25,
  },

  saveButtonActive: {
    backgroundColor: "#1A1710",
  },

  saveButtonText: {
    color: "#C9A45C",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
  },

  saveButtonTextActive: {
    color: "#C9A45C",
  },

  button: {
    backgroundColor: "#C9A45C",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#0B0A0F",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
  },

  reviewsSection: {
    marginTop: 40,
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  reviewTitle: {
    color: "#F5F1E8",
    fontSize: 12,
    letterSpacing: 2,
  },

  reviewCount: {
    color: "#C9A45C",
    fontSize: 11,
  },

  noReviews: {
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    padding: 24,
    alignItems: "center",
  },

  noReviewsTitle: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 1.5,
  },

  noReviewsText: {
    color: "#77727C",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  reviewCard: {
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    padding: 18,
    marginBottom: 12,
  },

  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reviewerName: {
    color: "#F5F1E8",
    fontSize: 11,
    letterSpacing: 1,
  },

  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
  },

  reviewRatingText: {
    color: "#F5F1E8",
    fontSize: 12,
    marginLeft: 4,
  },

  reviewText: {
    color: "#96919B",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
