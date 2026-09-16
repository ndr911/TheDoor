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
  text: "#F5F1E8",
  muted: "#96919B",
  white: "#FFFFFF",
};

const topSpots = [
  {
    name: "The Hidden Chapter",
    location: "West Village",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Velvet & Smoke",
    location: "SoHo",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80",
  },
];

export default function HomeScreen() {
  const [userName, setUserName] = useState("THERE");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.log("Error loading user:", error.message);
      return;
    }

    const name = user?.user_metadata?.name;

    if (name) {
      setUserName(name.trim());
    }
  }

  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>GOOD EVENING</Text>

            <Text style={styles.welcome}>
              WELCOME INSIDE, {userName.toUpperCase()}.
            </Text>

            <Text style={styles.location}>📍 New York City</Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.profileText}>{firstLetter}</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="♡" number="12" label="SAVED" />

          <StatCard icon="✓" number="8" label="VISITS" />

          <StatCard icon="★" number="5" label="REVIEWS" />
        </View>

        {/* Top Spots */}
        <SectionHeader title="YOUR TOP SPOTS" action="VIEW ALL" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {topSpots.map((venue) => (
            <VenueCard
              key={venue.name}
              name={venue.name}
              location={venue.location}
              rating={venue.rating}
              image={venue.image}
            />
          ))}
        </ScrollView>

        {/* Featured */}
        <SectionHeader title="FEATURED TONIGHT" action="SEE MORE" />

        <Pressable style={styles.featuredCard}>
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
              <Text style={styles.rating}>★ 4.9</Text>

              <Text style={styles.price}>$$$</Text>
            </View>
          </View>
        </Pressable>

        {/* Bottom spacing */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem icon="⌂" label="HOME" active onPress={() => {}} />

        <NavItem
          icon="⌕"
          label="EXPLORE"
          onPress={() => router.push("/explore")}
        />

        <NavItem icon="♡" label="SAVED" onPress={() => router.push("/saved")} />

        <NavItem
          icon="○"
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

function SectionHeader({ title, action }: { title: string; action: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <Pressable>
        <Text style={styles.sectionAction}>{action}</Text>
      </Pressable>
    </View>
  );
}

function VenueCard({
  name,
  location,
  rating,
  image,
}: {
  name: string;
  location: string;
  rating: string;
  image: string;
}) {
  return (
    <Pressable style={styles.venueCard}>
      <Image source={{ uri: image }} style={styles.venueImage} />

      <View style={styles.heartButton}>
        <Text style={styles.heart}>♡</Text>
      </View>

      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{name}</Text>

        <Text style={styles.venueLocation}>{location}</Text>

        <View style={styles.venueMeta}>
          <Text style={styles.rating}>★ {rating}</Text>

          <Text style={styles.dot}>·</Text>

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
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text>

      <Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginBottom: 9,
  },

  welcome: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  location: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 8,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    color: COLORS.gold,
    fontSize: 16,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  statIcon: {
    color: COLORS.gold,
    fontSize: 19,
    marginBottom: 5,
  },

  statNumber: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "600",
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.8,
  },

  sectionAction: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.3,
  },

  horizontalList: {
    gap: 14,
    paddingBottom: 32,
  },

  venueCard: {
    width: 245,
    backgroundColor: COLORS.card,
    borderRadius: 13,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  venueImage: {
    width: "100%",
    height: 145,
  },

  heartButton: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(11,10,15,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  heart: {
    color: COLORS.white,
    fontSize: 20,
  },

  venueInfo: {
    padding: 13,
  },

  venueName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },

  venueLocation: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },

  venueMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  rating: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "600",
  },

  dot: {
    color: COLORS.muted,
    marginHorizontal: 7,
  },

  metaText: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1,
  },

  featuredCard: {
    height: 260,
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(5,4,8,0.42)",
  },

  featuredContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },

  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    marginBottom: 10,
  },

  featuredBadgeText: {
    color: COLORS.background,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  featuredTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "500",
    letterSpacing: 1,
  },

  featuredLocation: {
    color: "#D5D0D7",
    fontSize: 12,
    marginTop: 5,
  },

  featuredBottom: {
    flexDirection: "row",
    marginTop: 12,
    gap: 14,
  },

  price: {
    color: COLORS.white,
    fontSize: 12,
    letterSpacing: 2,
  },

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
  },

  navIcon: {
    color: COLORS.muted,
    fontSize: 24,
    marginBottom: 4,
  },

  navLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },

  navActive: {
    color: COLORS.gold,
  },
});
