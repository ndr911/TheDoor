import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function ReviewScreen() {
  const { id, venueName } = useLocalSearchParams<{
    id: string;
    venueName: string;
  }>();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReview() {
    if (!id) {
      Alert.alert("Error", "No venue was selected.");
      return;
    }

    if (rating === 0) {
      Alert.alert("Choose a rating", "Please select between 1 and 5 stars.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Login required", "Please log in to write a review.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      venue_id: id,
      rating,
      review_text: reviewText.trim() || null,
    });

    if (error) {
      console.log("Error submitting review:", error.message);
      Alert.alert("Couldn't submit review", error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);

    Alert.alert("Review submitted", "Thanks for sharing your experience.", [
      {
        text: "DONE",
        onPress: () => router.back(),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ BACK</Text>
        </Pressable>

        <Text style={styles.eyebrow}>THE DOOR</Text>

        <Text style={styles.title}>WRITE A REVIEW</Text>

        <Text style={styles.subtitle}>Share your experience.</Text>

        {venueName && (
          <View style={styles.venueCard}>
            <Text style={styles.venueLabel}>REVIEWING</Text>

            <Text style={styles.venueName}>{venueName}</Text>
          </View>
        )}

        <View style={styles.ratingSection}>
          <Text style={styles.label}>YOUR RATING</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Text
                  style={[styles.star, star <= rating && styles.starActive]}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.ratingHint}>
            {rating === 0
              ? "Select a rating"
              : `${rating} ${rating === 1 ? "STAR" : "STARS"}`}
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>YOUR REVIEW</Text>

          <TextInput
            style={styles.textInput}
            placeholder="What did you think?"
            placeholderTextColor="#77727C"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          <Text style={styles.characterCount}>{reviewText.length}/500</Text>
        </View>

        <Pressable
          style={[
            styles.submitButton,
            (submitting || rating === 0) && styles.submitButtonDisabled,
          ]}
          onPress={submitReview}
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#0B0A0F" />
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT REVIEW</Text>
          )}
        </Pressable>
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
    paddingTop: 20,
    paddingBottom: 50,
  },

  back: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 30,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 14,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 30,
    fontWeight: "600",
    letterSpacing: 1.5,
  },

  subtitle: {
    color: "#96919B",
    fontSize: 15,
    marginTop: 10,
  },

  venueCard: {
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    padding: 18,
    marginTop: 30,
  },

  venueLabel: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  venueName: {
    color: "#F5F1E8",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1,
  },

  ratingSection: {
    marginTop: 35,
  },

  label: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  stars: {
    flexDirection: "row",
  },

  starButton: {
    marginRight: 8,
    paddingVertical: 4,
  },

  star: {
    color: "#39343F",
    fontSize: 36,
  },

  starActive: {
    color: "#C9A45C",
  },

  ratingHint: {
    color: "#96919B",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 8,
  },

  inputSection: {
    marginTop: 32,
  },

  textInput: {
    minHeight: 150,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    padding: 16,
    color: "#F5F1E8",
    fontSize: 14,
    lineHeight: 21,
  },

  characterCount: {
    color: "#77727C",
    fontSize: 9,
    textAlign: "right",
    marginTop: 6,
  },

  submitButton: {
    backgroundColor: "#C9A45C",
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonText: {
    color: "#0B0A0F",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
});
