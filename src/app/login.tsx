import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password.",
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    router.replace("/home");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.brand}>THE DOOR</Text>

          <View style={styles.line} />

          <Text style={styles.title}>Welcome back.</Text>

          <Text style={styles.subtitle}>Enter your details to continue.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL</Text>

          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            placeholderTextColor="#77727C"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>PASSWORD</Text>

          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#77727C"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable>
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>
        </View>

        <View>
          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "ENTERING..." : "ENTER"}
            </Text>
          </Pressable>

          <Text style={styles.accountText}>Don't have an account?</Text>

          <Pressable onPress={() => router.push("/signup")}>
            <Text style={styles.signup}>CREATE AN ACCOUNT</Text>
          </Pressable>
        </View>
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
    paddingVertical: 30,
    justifyContent: "space-between",
  },

  brand: {
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 3,
  },

  line: {
    width: 45,
    height: 1,
    backgroundColor: "#C9A45C",
    marginTop: 14,
    marginBottom: 28,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 34,
    fontWeight: "600",
  },

  subtitle: {
    color: "#96919B",
    fontSize: 15,
    marginTop: 10,
  },

  form: {
    marginTop: 30,
  },

  label: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 18,
  },

  input: {
    height: 52,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    paddingHorizontal: 16,
    color: "#F5F1E8",
    fontSize: 15,
  },

  forgot: {
    color: "#C9A45C",
    fontSize: 11,
    marginTop: 12,
    textAlign: "right",
  },

  button: {
    height: 54,
    backgroundColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#0B0A0F",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
  },

  accountText: {
    color: "#77727C",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },

  signup: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 8,
  },
});
