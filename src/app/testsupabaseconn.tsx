import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function TestSupabaseConn() {
  const [status, setStatus] = useState("Testing connection...");

  useEffect(() => {
    async function testConnection() {
      const { error } = await supabase.auth.getSession();

      if (error) {
        setStatus(`Connection error: ${error.message}`);
      } else {
        setStatus("Supabase connection works!");
      }
    }

    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>THE DOOR</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    color: "#C9A45C",
    fontSize: 20,
    letterSpacing: 3,
    marginBottom: 20,
  },

  status: {
    color: "#F5F1E8",
    fontSize: 16,
    textAlign: "center",
  },
});
