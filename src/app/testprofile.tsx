import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { supabase } from "../../lib/supabase";

export default function TestProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    name: string | null;
    email: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setError(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setError("No authenticated user found.");
      setLoading(false);
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setProfile(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SUPABASE TEST</Text>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SUPABASE TEST</Text>

      <Text style={styles.label}>NAME</Text>
      <Text style={styles.value}>{profile?.name ?? "No name"}</Text>

      <Text style={styles.label}>EMAIL</Text>
      <Text style={styles.value}>{profile?.email ?? "No email"}</Text>

      <Text style={styles.success}>✓ Profile loaded from Supabase</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08070A",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  title: {
    color: "#D7AD5A",
    fontSize: 24,
    letterSpacing: 3,
    marginBottom: 40,
  },

  label: {
    color: "#8F8A82",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 15,
  },

  value: {
    color: "#F5F0E8",
    fontSize: 20,
    marginTop: 5,
  },

  text: {
    color: "#F5F0E8",
    marginTop: 15,
  },

  error: {
    color: "#E57373",
    textAlign: "center",
    marginTop: 20,
  },

  success: {
    color: "#D7AD5A",
    marginTop: 40,
    fontSize: 16,
  },
});
