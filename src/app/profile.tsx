import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const [userName, setUserName] = useState("USER");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    // First get the currently authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.log("Error loading user:", userError.message);
      return;
    }

    if (!user) {
      console.log("No authenticated user found.");
      return;
    }

    // Then get that user's profile from public.profiles
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log("Error loading profile:", profileError.message);
      return;
    }

    if (data?.name) {
      setUserName(data.name.trim());
    }

    if (data?.email) {
      setUserEmail(data.email);
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

  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>THE DOOR</Text>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstLetter}</Text>
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.name}>{userName.toUpperCase()}</Text>

            <Text style={styles.email}>{userEmail}</Text>

            <Text style={styles.member}>MEMBER SINCE 2026</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>SAVED</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>VISITS</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>REVIEWS</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>EDIT PROFILE</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>MY REVIEWS</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>SETTINGS</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>HELP & SUPPORT</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 30,
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  avatarText: {
    color: "#C9A45C",
    fontSize: 28,
    fontWeight: "500",
  },

  nameContainer: {
    flex: 1,
  },

  name: {
    color: "#F5F1E8",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 2,
  },

  email: {
    color: "#96919B",
    fontSize: 11,
    marginTop: 5,
  },

  member: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 5,
  },

  stats: {
    flexDirection: "row",
    marginTop: 35,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#29242F",
    paddingVertical: 20,
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    color: "#F5F1E8",
    fontSize: 22,
    fontWeight: "500",
  },

  statLabel: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 5,
  },

  menu: {
    marginTop: 30,
  },

  menuItem: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#29242F",
  },

  menuText: {
    color: "#F5F1E8",
    fontSize: 12,
    letterSpacing: 1.5,
  },

  arrow: {
    color: "#C9A45C",
    fontSize: 24,
  },

  logout: {
    marginTop: 30,
    alignItems: "center",
  },

  logoutText: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 2,
  },
});
