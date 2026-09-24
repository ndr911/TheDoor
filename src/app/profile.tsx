import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

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
          <ActivityIndicator size="small" color="#C9A45C" />

          <Text style={styles.loadingText}>OPENING THE DOOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* --------------------------------
          MAIN CONTENT
          Safe area only applies to top
          -------------------------------- */}

      <SafeAreaView style={styles.screen} edges={["top"]}>
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

            {/* --------------------------------
                SETTINGS
                COMMENTED OUT FOR NOW
                --------------------------------

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => router.push("/settings")}
            >
              <Text style={styles.menuText}>
                SETTINGS
              </Text>

              <Text style={styles.arrow}>
                ›
              </Text>
            </Pressable>

            -------------------------------- */}
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
        </ScrollView>
      </SafeAreaView>

      {/* --------------------------------
          BOTTOM NAVIGATION

          IMPORTANT:
          This is OUTSIDE SafeAreaView so
          the background extends underneath
          the iPhone bottom safe area.
          -------------------------------- */}

      <View
        style={[
          styles.bottomNav,
          {
            height: 82 + insets.bottom,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        {/* HOME */}

        <Pressable style={styles.navItem} onPress={() => router.push("/home")}>
          <Text style={styles.navIcon}>⌂</Text>

          <Text style={styles.navText}>HOME</Text>
        </Pressable>

        {/* EXPLORE */}

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/explore")}
        >
          <Text style={styles.navIcon}>⌕</Text>

          <Text style={styles.navText}>EXPLORE</Text>
        </Pressable>

        {/* SAVED */}

        <Pressable style={styles.navItem} onPress={() => router.push("/saved")}>
          <Text style={styles.navIcon}>♡</Text>

          <Text style={styles.navText}>SAVED</Text>
        </Pressable>

        {/* PROFILE */}

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
  );
}

const styles = StyleSheet.create({
  /* --------------------------------
     MAIN
     -------------------------------- */

  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 26,

    // Extra room so the last content can
    // scroll above the bottom navigation.
    paddingBottom: 140,
  },

  /* --------------------------------
     HEADER
     -------------------------------- */

  header: {
    marginBottom: 28,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 12,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  title: {
    color: "#F5F1E8",
    fontSize: 40,
    lineHeight: 43,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_500Medium",
  },

  goldLine: {
    width: 48,
    height: 1,
    backgroundColor: "#C9A45C",
    marginTop: 13,
  },

  /* --------------------------------
     PROFILE
     -------------------------------- */

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  avatarText: {
    color: "#D9B65E",
    fontSize: 34,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  nameContainer: {
    flex: 1,
  },

  name: {
    color: "#F5F1E8",
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: 1.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  email: {
    color: "#96919B",
    fontSize: 14,
    lineHeight: 18,
    marginTop: 5,
    fontFamily: "CormorantGaramond_500Medium",
  },

  member: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 2.5,
    marginTop: 5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* --------------------------------
     STATS
     -------------------------------- */

  stats: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#29242F",
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
    backgroundColor: "#29242F",
    marginVertical: 3,
  },

  statNumber: {
    color: "#F5F1E8",
    fontSize: 28,
    lineHeight: 31,
    fontFamily: "CormorantGaramond_500Medium",
  },

  statLabel: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 2.5,
    marginTop: 5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* --------------------------------
     MENU
     -------------------------------- */

  menu: {
    marginTop: 28,
  },

  menuItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#29242F",
  },

  menuItemPressed: {
    opacity: 0.65,
  },

  menuText: {
    color: "#F5F1E8",
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_500Medium",
  },

  arrow: {
    color: "#C9A45C",
    fontSize: 27,
    fontFamily: "CormorantGaramond_500Medium",
  },

  /* --------------------------------
     LOG OUT
     -------------------------------- */

  logout: {
    marginTop: 30,
    alignItems: "center",
    paddingVertical: 12,
  },

  logoutText: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 3,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* --------------------------------
     LOADING
     -------------------------------- */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B0A0F",
  },

  loadingText: {
    color: "#D9B65E",
    fontSize: 20,
    letterSpacing: 4,
    marginTop: 12,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* --------------------------------
     BOTTOM NAVIGATION
     -------------------------------- */

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "#111016",

    borderTopWidth: 1,
    borderTopColor: "#29242F",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    flex: 1,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  navIcon: {
    color: "#77727C",
    fontSize: 23,
    lineHeight: 25,
  },

  navIconActive: {
    color: "#C9A45C",
    fontSize: 23,
    lineHeight: 25,
  },

  navText: {
    color: "#77727C",
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 4,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  navTextActive: {
    color: "#C9A45C",
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
    backgroundColor: "#C9A45C",
  },
});
