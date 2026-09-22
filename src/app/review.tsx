import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  const { venueId, venueName } = useLocalSearchParams<{
    venueId?: string;
    venueName?: string;
  }>();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReview() {
    if (!venueId) {
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
      venue_id: venueId,
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
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
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
              scrollEnabled={true}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 180,
  },

  back: {
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 30,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 14,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  title: {
    color: "#F5F1E8",
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  subtitle: {
    color: "#96919B",
    fontSize: 16,
    marginTop: 10,
    fontFamily: "CormorantGaramond_500Medium",
  },

  venueCard: {
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    borderRadius: 14,
    padding: 18,
    marginTop: 30,
  },

  venueLabel: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 7,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  venueName: {
    color: "#F5F1E8",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  ratingSection: {
    marginTop: 35,
  },

  label: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 12,
    fontFamily: "CormorantGaramond_600SemiBold",
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
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  starActive: {
    color: "#C9A45C",
  },

  ratingHint: {
    color: "#96919B",
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 8,
    fontFamily: "CormorantGaramond_500Medium",
  },

  inputSection: {
    marginTop: 32,
  },

  textInput: {
    minHeight: 150,
    maxHeight: 220,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#F5F1E8",
    fontSize: 18,
    lineHeight: 25,
    fontFamily: "CormorantGaramond_500Medium",
  },

  characterCount: {
    color: "#77727C",
    fontSize: 10,
    textAlign: "right",
    marginTop: 6,
    fontFamily: "CormorantGaramond_500Medium",
  },

  submitButton: {
    backgroundColor: "#C9A45C",
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonText: {
    color: "#0B0A0F",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
});
