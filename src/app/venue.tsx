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

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [venue, setVenue] = useState<Venue | null>(null);
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
          {venue.rating !== null && (
            <>
              <Text style={styles.star}>★</Text>

              <Text style={styles.rating}>
                {Number(venue.rating).toFixed(1)}
              </Text>
            </>
          )}

          <Text style={styles.reviews}>REVIEWS COMING SOON</Text>
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
