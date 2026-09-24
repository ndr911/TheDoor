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
  white: "#FFFFFF",
};

export default function ProfileScreen() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
  });

  const [userName, setUserName] = useState("USER");
  const [userEmail, setUserEmail] = useState("");
  const [memberSince, setMemberSince] = useState("2026");

  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [visitCount, setVisitCount] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      loadProfile();
    }
  }, [fontsLoaded]);

  async function loadProfile() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.log("Error loading user:", userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        console.log("No authenticated user found.");
        setLoading(false);
        return;
      }

      // --------------------------------
      // USER INFORMATION
      // --------------------------------

      if (user.email) {
        setUserEmail(user.email);
      }

      if (user.created_at) {
        const signupYear = new Date(user.created_at).getFullYear();
        setMemberSince(String(signupYear));
      }

      // --------------------------------
      // PROFILE
      // --------------------------------

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.log("Error loading profile:", profileError.message);
      }

      if (profileData?.name) {
        setUserName(profileData.name.trim());
      }

      if (profileData?.email) {
        setUserEmail(profileData.email);
      }

      // --------------------------------
      // SAVED VENUES
      // --------------------------------

      const { count: savedTotal, error: savedError } = await supabase
        .from("saved_venues")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

      if (savedError) {
        console.log("Error loading saved count:", savedError.message);
      } else {
        setSavedCount(savedTotal ?? 0);
      }

      // --------------------------------
      // REVIEWS
      // --------------------------------

      const { data: reviewData, error: reviewError } = await supabase
        .from("reviews")
        .select("id, venue_id")
        .eq("user_id", user.id);

      if (reviewError) {
        console.log("Error loading review count:", reviewError.message);
      } else {
        const reviews = reviewData ?? [];

        setReviewCount(reviews.length);

        // --------------------------------
        // VISITS
        //
        // A visit is currently counted as
        // a unique venue the user has reviewed.
        // --------------------------------

        const uniqueVenueIds = new Set(
          reviews.map((review) => review.venue_id).filter(Boolean),
        );

        setVisitCount(uniqueVenueIds.size);
      }
    } catch (error) {
      console.log("Profile loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      Alert.alert("Log out failed", error.message);
      return;
    }

    router.replace("/login");
  }

  const firstLetter = userName.trim().charAt(0).toUpperCase() || "U";

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />

          <Text style={styles.loadingText}>OPENING THE DOOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>THE DOOR</Text>

          <Text style={styles.title}>PROFILE</Text>

          <View style={styles.goldLine} />
        </View>

        {/* PROFILE */}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstLetter}</Text>
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
              {userName.toUpperCase()}
            </Text>

            <Text style={styles.email} numberOfLines={1}>
              {userEmail}
            </Text>

            <Text style={styles.member}>MEMBER SINCE {memberSince}</Text>
          </View>
        </View>

        {/* STATS */}

        <View style={styles.stats}>
          <Pressable
            style={({ pressed }) => [
              styles.stat,
              pressed && styles.statPressed,
            ]}
            onPress={() => router.push("/saved")}
          >
            <Text style={styles.statNumber}>{savedCount ?? "—"}</Text>

            <Text style={styles.statLabel}>SAVED</Text>
          </Pressable>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Text style={styles.statNumber}>{visitCount ?? "—"}</Text>

            <Text style={styles.statLabel}>VISITS</Text>
          </View>

          <View style={styles.statDivider} />

          <Pressable
            style={({ pressed }) => [
              styles.stat,
              pressed && styles.statPressed,
            ]}
            onPress={() => router.push("/my-reviews")}
          >
            <Text style={styles.statNumber}>{reviewCount ?? "—"}</Text>

            <Text style={styles.statLabel}>REVIEWS</Text>
          </Pressable>
        </View>

        {/* MENU */}

        <View style={styles.menu}>
          {/* EDIT PROFILE */}

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={styles.menuText}>EDIT PROFILE</Text>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          {/* MY REVIEWS */}

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push("/my-reviews")}
          >
            <Text style={styles.menuText}>MY REVIEWS</Text>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          {/* SAVED PLACES */}

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push("/saved")}
          >
            <Text style={styles.menuText}>SAVED PLACES</Text>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          {/* HELP & SUPPORT */}

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push("/support")}
          >
            <Text style={styles.menuText}>HELP & SUPPORT</Text>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        {/* LOG OUT */}

        <Pressable
          style={({ pressed }) => [
            styles.logout,
            pressed && styles.menuItemPressed,
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>LOG OUT</Text>
        </Pressable>

        {/* BOTTOM SPACING FOR NAV BAR */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomNav}>
        <NavItem
          icon="home-outline"
          label="HOME"
          onPress={() => router.push("/home")}
        />

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

        <NavItem icon="person" label="PROFILE" active onPress={() => {}} />
      </View>
    </SafeAreaView>
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
  /* MAIN */
  /* ---------------------------------- */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 30,
  },

  /* ---------------------------------- */
  /* HEADER */
  /* ---------------------------------- */

  header: {
    marginBottom: 28,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 12,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  title: {
    color: COLORS.text,
    fontSize: 40,
    lineHeight: 43,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_500Medium",
  },

  goldLine: {
    width: 48,
    height: 1,
    backgroundColor: COLORS.gold,
    marginTop: 13,
  },

  /* ---------------------------------- */
  /* PROFILE */
  /* ---------------------------------- */

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  avatarText: {
    color: COLORS.goldBright,
    fontSize: 34,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  nameContainer: {
    flex: 1,
  },

  name: {
    color: COLORS.text,
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: 1.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  email: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 5,
    fontFamily: "CormorantGaramond_500Medium",
  },

  member: {
    color: COLORS.subtle,
    fontSize: 10,
    letterSpacing: 2.5,
    marginTop: 5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* ---------------------------------- */
  /* STATS */
  /* ---------------------------------- */

  stats: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 20,
  },

  stat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  statPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },

  statDivider: {
    width: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 3,
  },

  statNumber: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 31,
    fontFamily: "CormorantGaramond_500Medium",
  },

  statLabel: {
    color: COLORS.subtle,
    fontSize: 9,
    letterSpacing: 2.5,
    marginTop: 5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* ---------------------------------- */
  /* MENU */
  /* ---------------------------------- */

  menu: {
    marginTop: 28,
  },

  menuItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  menuItemPressed: {
    opacity: 0.65,
  },

  menuText: {
    color: COLORS.text,
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_500Medium",
  },

  arrow: {
    color: COLORS.gold,
    fontSize: 27,
    fontFamily: "CormorantGaramond_500Medium",
  },

  /* ---------------------------------- */
  /* LOG OUT */
  /* ---------------------------------- */

  logout: {
    marginTop: 30,
    alignItems: "center",
    paddingVertical: 12,
  },

  logoutText: {
    color: COLORS.gold,
    fontSize: 11,
    letterSpacing: 3,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* ---------------------------------- */
  /* LOADING */
  /* ---------------------------------- */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  loadingText: {
    color: COLORS.goldBright,
    fontSize: 20,
    letterSpacing: 4,
    marginTop: 12,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* ---------------------------------- */
  /* BOTTOM NAVIGATION */
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
