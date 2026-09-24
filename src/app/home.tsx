import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
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
  white: "#FFFFFF",
};

export default function HomeScreen() {
  const [userName, setUserName] = useState("THERE");
  const [userLocation, setUserLocation] = useState("YOUR AREA");
  const [savedCount, setSavedCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [topSpots, setTopSpots] = useState<
    {
      id: string;
      name: string;
      location: string;
      rating: string;
      image: string;
    }[]
  >([]);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log("Error loading user:", error?.message);
      return;
    }

    // Load user's name
    const name = user.user_metadata?.name;

    if (name) {
      setUserName(name.trim());
    }

    // Count saved venues
    const { count: savedCount, error: savedError } = await supabase
      .from("saved_venues")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (savedError) {
      console.log("Error loading saved count:", savedError.message);
    } else {
      setSavedCount(savedCount ?? 0);
    }

    // Count reviews
    const { count: reviewCount, error: reviewError } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (reviewError) {
      console.log("Error loading review count:", reviewError.message);
    } else {
      setReviewCount(reviewCount ?? 0);
    }

    // Count unique venues reviewed.
    // For now, this represents the user's visits.
    const { data: reviewedVenues, error: visitError } = await supabase
      .from("reviews")
      .select("venue_id")
      .eq("user_id", user.id);

    if (visitError) {
      console.log("Error loading visit count:", visitError.message);
    } else {
      const uniqueVenueIds = new Set(
        (reviewedVenues ?? []).map((review) => review.venue_id),
      );

      setVisitCount(uniqueVenueIds.size);
    }

    // Load top-rated venues
    // Get the user's current location
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Location permission not granted");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const [address] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const userZip = address?.postalCode;

    const city = address?.city;

    if (city) {
      setUserLocation(city.toUpperCase());
    }

    if (!userZip) {
      console.log("Could not determine current ZIP code");
      return;
    }

    // Load top 2 venues in the user's ZIP code
    const { data: topVenueData, error: topVenueError } = await supabase
      .from("venues")
      .select("id, name, neighborhood, rating, image_url, zip_code")
      .eq("zip_code", userZip)
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(2);

    if (topVenueError) {
      console.log("Error loading nearby top spots:", topVenueError.message);
    } else {
      console.log("Venues found for ZIP", userZip, topVenueData);

      const formattedTopSpots = (topVenueData ?? []).map((venue) => ({
        id: venue.id,
        name: venue.name,
        location: venue.neighborhood ?? "",
        rating: venue.rating?.toString() ?? "0.0",
        image:
          venue.image_url ??
          "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80",
      }));

      setTopSpots(formattedTopSpots);
    }

    if (topVenueError) {
      console.log("Error loading top spots:", topVenueError.message);
    } else {
      const formattedTopSpots = (topVenueData ?? []).map((venue) => ({
        id: venue.id,
        name: venue.name,
        location: venue.neighborhood ?? "",
        rating: venue.rating?.toString() ?? "0.0",
        image:
          venue.image_url ??
          "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80",
      }));

      setTopSpots(formattedTopSpots);
    }
  }

  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>THE DOOR IS OPEN</Text>

            <Text style={styles.welcome}>
              WELCOME INSIDE, {userName.toUpperCase()}.
            </Text>

            <View style={styles.locationRow}>
              <Text style={styles.locationDot}>●</Text>

              <Text style={styles.location}>{userLocation}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.profileText}>{firstLetter}</Text>
          </Pressable>
        </View>

        {/* STATS */}

        <View style={styles.statsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              pressed && styles.statCardPressed,
            ]}
            onPress={() => router.push("/saved")}
          >
            <Text style={styles.statIcon}>♡</Text>
            <Text style={styles.statNumber}>{savedCount}</Text>
            <Text style={styles.statLabel}>SAVED</Text>
          </Pressable>
          <StatCard icon="✓" number={visitCount.toString()} label="VISITS" />

          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              pressed && styles.statCardPressed,
            ]}
            onPress={() => router.push("/my-reviews")}
          >
            <Text style={styles.statIcon}>★</Text>
            <Text style={styles.statNumber}>{reviewCount}</Text>
            <Text style={styles.statLabel}>REVIEWS</Text>
          </Pressable>
        </View>

        {/* TOP SPOTS */}

        <SectionHeader
          title="TOP SPOTS NEAR YOU"
          action="VIEW ALL"
          onPress={() => router.push("/explore")}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {topSpots.map((venue) => (
            <VenueCard
              key={venue.id}
              id={venue.id}
              name={venue.name}
              location={venue.location}
              rating={venue.rating}
              image={venue.image}
            />
          ))}
        </ScrollView>

        {/* FEATURED */}

        <SectionHeader title="FEATURED TONIGHT" action="" />

        <Pressable
          style={({ pressed }) => [
            styles.featuredCard,
            pressed && styles.featuredPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: "/venue",
              params: {
                id: "9064676c-b884-4d0f-9f82-de3b65cebb0f",
              },
            })
          }
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
            }}
            style={styles.featuredImage}
          />

          <View style={styles.featuredOverlay} />

          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>FEATURED</Text>
            </View>

            <Text style={styles.featuredTitle}>THE MIDNIGHT ROOM</Text>

            <Text style={styles.featuredLocation}>
              Lower East Side · 0.8 mi
            </Text>

            <View style={styles.featuredBottom}>
              <View style={styles.featuredRating}>
                <Text style={styles.featuredStar}>★</Text>
                <Text style={styles.rating}>4.9</Text>
              </View>

              <Text style={styles.price}>$$$</Text>
            </View>
          </View>
        </Pressable>

        {/* BOTTOM SPACING */}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomNav}>
        <NavItem icon="home" label="HOME" active onPress={() => {}} />

        <NavItem
          icon="search"
          label="EXPLORE"
          onPress={() => router.push("/explore")}
        />

        <NavItem
          icon="heart-outline"
          label="SAVED"
          onPress={() => router.push("/saved")}
        />

        <NavItem
          icon="person-outline"
          label="PROFILE"
          onPress={() => router.push("/profile")}
        />
      </View>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  number,
  label,
}: {
  icon: string;
  number: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>

      <Text style={styles.statNumber}>{number}</Text>

      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>

        <View style={styles.sectionAccent} />
      </View>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.actionPressed}
      >
        <Text style={styles.sectionAction}>{action}</Text>
      </Pressable>
    </View>
  );
}

function VenueCard({
  id,
  name,
  location,
  rating,
  image,
}: {
  id: string;
  name: string;
  location: string;
  rating: string;
  image: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.venueCard, pressed && styles.cardPressed]}
      onPress={() =>
        router.push({
          pathname: "/venue",
          params: { id },
        })
      }
    >
      <View style={styles.venueImageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.venueImage}
          resizeMode="cover"
        />

        <View style={styles.imageOverlay} />

        <View style={styles.heartButton}>
          <Text style={styles.heart}>♡</Text>
        </View>

        <View style={styles.ratingBadge}>
          <Text style={styles.ratingStar}>★</Text>

          <Text style={styles.ratingBadgeText}>{rating}</Text>
        </View>
      </View>

      <View style={styles.venueInfo}>
        <Text style={styles.venueName} numberOfLines={1}>
          {name}
        </Text>

        <Text style={styles.venueLocation} numberOfLines={1}>
          {location || "NEW YORK"}
        </Text>

        <View style={styles.venueMeta}>
          <Text style={styles.metaText}>COCKTAIL BAR</Text>
        </View>
      </View>
    </Pressable>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.navItem, pressed && styles.navPressed]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={23}
        color={active ? COLORS.gold : COLORS.muted}
      />

      <Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  /* ---------------------------------- */
  /* BASE */
  /* ---------------------------------- */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
  },

  /* ---------------------------------- */
  /* HEADER */
  /* ---------------------------------- */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },

  headerText: {
    flex: 1,
    paddingRight: 15,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 10,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  welcome: {
    color: COLORS.text,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: 1,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  locationDot: {
    color: COLORS.gold,
    fontSize: 6,
    marginRight: 7,
  },

  location: {
    color: COLORS.muted,
    fontSize: 12,
    letterSpacing: 1.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  statCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },

  profileText: {
    color: COLORS.gold,
    fontSize: 20,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  /* ---------------------------------- */
  /* STATS */
  /* ---------------------------------- */

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 36,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
  },

  statIcon: {
    color: COLORS.gold,
    fontSize: 20,
    marginBottom: 5,
  },

  statNumber: {
    color: COLORS.text,
    fontSize: 23,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  statLabel: {
    color: COLORS.subtle,
    fontSize: 9,
    letterSpacing: 1.6,
    marginTop: 4,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* ---------------------------------- */
  /* SECTION HEADERS */
  /* ---------------------------------- */

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    letterSpacing: 2.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  sectionAccent: {
    width: 24,
    height: 1,
    backgroundColor: COLORS.gold,
    marginTop: 6,
  },

  sectionAction: {
    color: COLORS.gold,
    fontSize: 12,
    letterSpacing: 1.7,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  actionPressed: {
    opacity: 0.65,
  },

  /* ---------------------------------- */
  /* TOP SPOTS */
  /* ---------------------------------- */

  horizontalList: {
    gap: 14,
    paddingBottom: 34,
  },

  venueCard: {
    width: 250,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },

  venueImageContainer: {
    height: 155,
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
    height: 65,
    backgroundColor: "rgba(11, 10, 15, 0.16)",
  },

  heartButton: {
    position: "absolute",
    right: 11,
    top: 11,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(11, 10, 15, 0.84)",
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  heart: {
    color: COLORS.white,
    fontSize: 22,
    marginTop: -1,
  },

  ratingBadge: {
    position: "absolute",
    left: 11,
    bottom: 11,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 10, 15, 0.88)",
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 11,
    paddingHorizontal: 10,
  },

  ratingStar: {
    color: COLORS.goldBright,
    fontSize: 15,
  },

  ratingBadgeText: {
    color: COLORS.text,
    fontSize: 14,
    marginLeft: 4,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  venueInfo: {
    padding: 15,
  },

  venueName: {
    color: COLORS.text,
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  venueLocation: {
    color: COLORS.subtle,
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  venueMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  metaText: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.3,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* ---------------------------------- */
  /* FEATURED */
  /* ---------------------------------- */

  featuredCard: {
    height: 270,
    borderRadius: 17,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },

  featuredPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(5, 4, 8, 0.46)",
  },

  featuredContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },

  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.gold,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 11,
  },

  featuredBadgeText: {
    color: COLORS.background,
    fontSize: 9,
    letterSpacing: 1.6,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  featuredTitle: {
    color: COLORS.white,
    fontSize: 27,
    letterSpacing: 1.2,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  featuredLocation: {
    color: "#D5D0D7",
    fontSize: 11,
    letterSpacing: 0.7,
    marginTop: 5,
    fontFamily: "CormorantGaramond_400Regular",
  },

  featuredBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  featuredRating: {
    flexDirection: "row",
    alignItems: "center",
  },

  featuredStar: {
    color: COLORS.goldBright,
    fontSize: 16,
    marginRight: 5,
  },

  rating: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  price: {
    color: COLORS.white,
    fontSize: 13,
    letterSpacing: 2,
    marginLeft: 16,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* ---------------------------------- */
  /* BOTTOM NAV */
  /* ---------------------------------- */

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 82,
    backgroundColor: "#100E14",
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 8,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 58,
  },

  navPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.94 }],
  },

  navIcon: {
    color: COLORS.muted,
    fontSize: 24,
    marginBottom: 4,
  },

  navLabel: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.3,
    marginTop: 5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  navActive: {
    color: COLORS.gold,
  },
});
